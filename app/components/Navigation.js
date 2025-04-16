'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import ProfileButton from './ProfileButton';
import styles from './Navigation.module.css';

export default function Navigation() {
  const { user } = useAuth();
  
  console.log('Current user:', user); // Debug log

  return (
    <nav className={styles.nav}>
      <div className={styles.leftSection}>
        <Link href="/" className={styles.logo}>
          <span className={styles.icon}>⭐</span>
          <span className={styles.logoText}>Quiz Battle</span>
        </Link>
      </div>

      <div className={styles.centerSection}>
        <Link href="/quiz/select" className={styles.navLink}>
          Battle
        </Link>
        <Link href="/leaderboard" className={styles.navLink}>
          Leaderboard
        </Link>
        <Link href="/rewards" className={styles.navLink}>
          Rewards
        </Link>
      </div>

      <div className={styles.rightSection}>
        {user ? (
          <ProfileButton />
        ) : (
          <Link href="/login" className={styles.loginButton}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
} 