import { NextResponse } from 'next/server';
import { getRandomQuestions } from '../../models/Question';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const exam = searchParams.get('exam');
    const count = parseInt(searchParams.get('count') || '15', 10);

    console.log('API: Received request for', { exam, count });

    if (!exam) {
      console.log('API: Missing exam parameter');
      return NextResponse.json(
        { error: 'Exam type is required' },
        { status: 400 }
      );
    }

    if (!['JEE', 'NEET'].includes(exam.toUpperCase())) {
      console.log('API: Invalid exam type:', exam);
      return NextResponse.json(
        { error: 'Invalid exam type. Must be either JEE or NEET' },
        { status: 400 }
      );
    }

    console.log('API: Fetching questions from database...');
    const questions = await getRandomQuestions(exam, count);
    
    if (!questions || questions.length === 0) {
      console.log('API: No questions found');
      return NextResponse.json(
        { error: 'No questions available for this exam type' },
        { status: 404 }
      );
    }

    console.log(`API: Successfully fetched ${questions.length} questions`);
    return NextResponse.json({ 
      success: true,
      questions,
      count: questions.length
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 