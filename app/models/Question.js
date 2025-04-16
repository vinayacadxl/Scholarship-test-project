import { db, auth } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

// Ensure authentication
const ensureAuth = async () => {
  try {
    if (!auth.currentUser) {
      console.log('No user found, attempting anonymous sign-in...');
      await signInAnonymously(auth);
      console.log('Anonymous sign-in successful');
    }
    return auth.currentUser;
  } catch (error) {
    console.error('Authentication failed:', error);
    throw new Error('Failed to authenticate: ' + error.message);
  }
};

// Helper function to shuffle array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export async function getRandomQuestions(examType, count = 15) {
  try {
    // Ensure authentication first
    await ensureAuth();
    
    // Create a reference to the questions collection
    const questionsRef = collection(db, 'questions');
    
    // Query for specific exam type
    const q = query(
      questionsRef,
      where('exam', '==', examType.toUpperCase())
    );
    
    // Get the documents
    const querySnapshot = await getDocs(q);
    
    // Convert to array and handle timestamps
    const allQuestions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || null,
      updatedAt: doc.data().updatedAt?.toDate?.() || null
    }));
    
    // If no questions found, add a sample question
    if (allQuestions.length === 0) {
      const sampleQuestion = {
        question: "What is the SI unit of force?",
        options: ["Newton", "Joule", "Watt", "Pascal"],
        correctAnswer: "Newton",
        exam: examType.toUpperCase(),
        subject: "Physics",
        chapter: "Units and Measurements",
        difficulty: "Easy",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(questionsRef, sampleQuestion);
      return [{ id: docRef.id, ...sampleQuestion }];
    }
    
    // If we have fewer questions than requested, return all shuffled
    if (allQuestions.length <= count) {
      return shuffleArray(allQuestions);
    }
    
    // Select random questions
    const selectedIndices = new Set();
    const selectedQuestions = [];
    
    while (selectedQuestions.length < count && selectedIndices.size < allQuestions.length) {
      const randomIndex = Math.floor(Math.random() * allQuestions.length);
      
      if (!selectedIndices.has(randomIndex)) {
        selectedIndices.add(randomIndex);
        const question = allQuestions[randomIndex];
        
        selectedQuestions.push({
          ...question,
          options: shuffleArray([...question.options])
        });
      }
    }
    
    return selectedQuestions;
    
  } catch (error) {
    console.error('Error in getRandomQuestions:', error);
    throw new Error('Failed to fetch questions: ' + error.message);
  }
}

export const addQuestion = async (questionData) => {
  try {
    // Ensure authentication
    await ensureAuth();
    
    // Validate the question
    if (!questionData.question) throw new Error('Question text is required');
    if (!Array.isArray(questionData.options) || questionData.options.length !== 4) {
      throw new Error('Exactly 4 options are required');
    }
    if (!questionData.correctAnswer) throw new Error('Correct answer is required');
    if (!questionData.exam) throw new Error('Exam type is required');
    
    // Add timestamps
    const question = {
      ...questionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Add to Firebase
    const questionsRef = collection(db, 'questions');
    const docRef = await addDoc(questionsRef, question);
    return docRef.id;
    
  } catch (error) {
    console.error('Error in addQuestion:', error);
    throw new Error('Failed to add question: ' + error.message);
  }
};

export const getQuestions = async ({ exam, subject, chapter, difficulty } = {}) => {
  try {
    // Ensure authentication
    await ensureAuth();

    // Build query with filters
    let q = collection(db, 'questions');
    let constraints = [];
    
    if (exam) {
      constraints.push(where('exam', '==', exam));
    }
    
    if (subject) {
      constraints.push(where('subject', '==', subject));
    }
    
    if (chapter) {
      constraints.push(where('chapter', '==', chapter));
    }
    
    if (difficulty) {
      constraints.push(where('difficulty', '==', difficulty));
    }

    constraints.push(orderBy('createdAt', 'desc'));
    q = query(q, ...constraints);
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('No questions found matching the criteria');
      return [];
    }

    const questions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
    }));
    
    console.log(`Successfully fetched ${questions.length} questions`);
    return questions;

  } catch (error) {
    console.error('Error fetching questions:', error);
    throw new Error(`Failed to fetch questions: ${error.message}`);
  }
}; 