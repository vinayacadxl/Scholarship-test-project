'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QuizClient({ questions, quizType }) {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    if (!submitted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, submitted]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((question, index) => {
      const selectedOption = question.options[answers[index]];
      if (selectedOption === question.correctAnswer) {
        correctCount++;
      }
    });
    setScore((correctCount / questions.length) * 100);
    setSubmitted(true);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    setCurrentQuestion(0);
    setTimeLeft(600);
    // Force a server-side rerender to get new questions
    router.refresh();
  };

  // Calculate completion percentage based on total answered questions
  const calculateProgress = () => {
    const answeredCount = Object.keys(answers).length;
    return Math.round((answeredCount / questions.length) * 100);
  };

  return (
    <div className="min-h-screen bg-[#0D0C1D] text-white p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">{quizType.toUpperCase()} Quiz</h1>
          <div className="text-xl font-semibold text-gray-300">
            Time Left: {formatTime(timeLeft)}
          </div>
        </div>

        {submitted ? (
          <div className="bg-[#14132B] rounded-lg p-8 shadow-xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
              <p className="text-2xl mb-6">Your Score: {score.toFixed(1)}%</p>
              <button
                onClick={handleRetry}
                className="bg-[#FF8303] text-white px-6 py-3 rounded-lg hover:bg-[#FF9124] transition-colors"
              >
                Try Another Quiz
              </button>
            </div>

            <div className="mt-8 space-y-6">
              {questions.map((question, index) => {
                const selectedOption = question.options[answers[index]];
                const isCorrect = selectedOption === question.correctAnswer;
                
                return (
                  <div key={index} className="bg-[#1C1B3A] rounded-lg p-6">
                    <p className="font-medium mb-4 text-gray-200">Q{index + 1}: {question.question}</p>
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} 
                          className={`p-3 rounded ${
                            option === question.correctAnswer ? 'bg-green-900/30' :
                            optIndex === answers[index] && !isCorrect ? 'bg-red-900/30' : ''
                          }`}
                        >
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`question-${index}`}
                              checked={answers[index] === optIndex}
                              disabled
                              className="mr-3"
                              readOnly
                            />
                            <span className="text-gray-300">{option}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                    {!isCorrect && (
                      <p className="mt-3 text-red-400">
                        Correct answer: {question.correctAnswer}
                      </p>
                    )}
                    {question.explanation && (
                      <p className="mt-3 text-blue-400">
                        {question.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-[#14132B] rounded-lg p-8 shadow-xl">
            <div className="mb-4 flex justify-between text-sm text-gray-400">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{calculateProgress()}% Complete</span>
            </div>
            
            <div className="mb-8 h-2 bg-[#1C1B3A] rounded">
              <div 
                className="h-full bg-[#FF8303] rounded transition-all duration-300" 
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>

            <div className="mb-8">
              <p className="text-xl mb-6 text-gray-200">{questions[currentQuestion].question}</p>
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, optIndex) => (
                  <div key={optIndex} 
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      answers[currentQuestion] === optIndex 
                        ? 'bg-[#FF8303] border border-[#FF9124]'
                        : 'bg-[#1C1B3A] hover:bg-[#252447] border border-transparent'
                    }`}
                    onClick={() => handleAnswerSelect(currentQuestion, optIndex)}
                  >
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        checked={answers[currentQuestion] === optIndex}
                        onChange={() => {}}
                        className="mr-3"
                      />
                      <span className="text-gray-200">{option}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className={`px-6 py-2 rounded ${
                  currentQuestion === 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-[#FF8303] hover:bg-[#FF9124] text-white'
                }`}
              >
                Previous
              </button>

              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length !== questions.length}
                  className={`px-6 py-2 rounded ${
                    Object.keys(answers).length === questions.length
                      ? 'bg-[#FF8303] hover:bg-[#FF9124] text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 rounded bg-[#FF8303] hover:bg-[#FF9124] text-white"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 