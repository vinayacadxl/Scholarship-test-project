'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function QuizSelect() {
  const [selectedType, setSelectedType] = useState('');
  const router = useRouter();

  const handleSelect = () => {
    if (selectedType) {
      router.push(`/quiz/${selectedType}`);
    }
  };

  const quizTypes = [
    {
      id: 'neet',
      name: 'NEET',
      icon: (
        <svg viewBox="0 0 24 24" width="32" height="32">
          <path fill="#F7931E" d="M19 8c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-7 2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm7 4c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
        </svg>
      )
    },
    {
      id: 'jee',
      name: 'JEE',
      icon: (
        <svg viewBox="0 0 24 24" width="32" height="32">
          <path fill="#F7931E" d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
        </svg>
      )
    },
    {
      id: '10th',
      name: '10th',
      icon: (
        <svg viewBox="0 0 24 24" width="32" height="32">
          <path fill="#F7931E" d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
        </svg>
      )
    },
    {
      id: '11th',
      name: '11th',
      icon: (
        <svg viewBox="0 0 24 24" width="32" height="32">
          <path fill="#F7931E" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2.5 13.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Select a quiz</h1>
        <p className={styles.subtitle}>
          Pick the exam level you want to challenge.
        </p>

        <div className={styles.grid}>
          {quizTypes.map((type) => (
            <div
              key={type.id}
              className={`${styles.card} ${selectedType === type.id ? styles.selected : ''}`}
              onClick={() => setSelectedType(type.id)}
            >
              <div className={styles.cardIcon}>{type.icon}</div>
              <h2 className={styles.cardTitle}>{type.name}</h2>
            </div>
          ))}
        </div>

        <button 
          className={styles.selectButton}
          disabled={!selectedType}
          onClick={handleSelect}
        >
          Select
        </button>
      </main>
    </div>
  );
} 