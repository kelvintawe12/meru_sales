
import React from 'react';
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';
import styles from './MeruLoader.module.css'; // Import your CSS module for styles

interface MeruLoaderProps {
  isLoading?: boolean; // Toggle visibility
  message?: string; // Custom loading message
}

const letters = ['M', 'E', 'R', 'U'];

const letterVariants = {
  initial: { y: 0, scale: 1, rotate: 0, opacity: 0.7 },
  animate: (i: number) => ({
    y: [-12, 0, -12],
    scale: [1, 1.2, 1],
    rotate: [0, 8, 0],
    opacity: [0.7, 1, 0.7],
    transition: {
      delay: i * 0.15,
      duration: 1.5,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop' as const,
    },
  }),
};

const ringVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 4,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

const MeruLoader: React.FC<MeruLoaderProps> = ({ isLoading = true, message = 'Loading Refinery Operations...' }) => {
  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90"
      role="status"
      aria-live="polite"
      aria-label="Loading Mont Meru Refinery Calendar"
    >
      <div className="relative flex flex-col items-center">
        {/* Rotating Ring (Oil Drum Effect) */}
        <motion.div
          className="absolute w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-t-gold-500 border-l-blue-800 border-b-blue-800 border-r-transparent"
          variants={ringVariants}
          animate="animate"
        />
        {/* Letters */}
        <div className="relative flex space-x-1 sm:space-x-2">
          {letters.map((letter, i) => (
            <motion.span
              key={letter}
              className={`text-3xl sm:text-5xl font-extrabold text-blue-800 ${styles.letter}`}
              variants={letterVariants}
              initial="initial"
              animate="animate"
              custom={i}
            >
              {letter}
            </motion.span>
          ))}
        </div>
        {/* Loading Message */}
        <motion.p
          className="mt-4 text-sm sm:text-base font-medium text-blue-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {message}
        </motion.p>
      </div>
      {/* Reduced Motion Fallback */}
      <div className={styles.reducedMotion}>
        <FaSpinner className="text-4xl text-blue-800 animate-spin" />
        <p className="mt-2 text-sm font-medium text-blue-800">{message}</p>
      </div>
    </div>
  );
};

export default MeruLoader;