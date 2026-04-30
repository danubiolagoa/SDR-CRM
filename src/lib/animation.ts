import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina classes CSS de forma inteligente, evitando conflitos
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Easing functions para animações
 */
export const easing = {
  easeOut: [0.33, 1, 0.68, 1] as const,
  easeInOut: [0.65, 0, 0.35, 1] as const,
  spring: [0.34, 1.56, 0.64, 1] as const,
};

/**
 * Durações de animação em ms
 */
export const duration = {
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 400,
} as const;

/**
 * Variantes de animação para framer-motion
 */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.normal / 1000, ease: easing.easeOut } },
  exit: { opacity: 0, transition: { duration: duration.fast / 1000 } },
};

export const slideUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.normal / 1000, ease: easing.easeOut } },
  exit: { opacity: 0, y: -10, transition: { duration: duration.fast / 1000 } },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: duration.slow / 1000, ease: easing.easeOut } },
  exit: { opacity: 0, x: -20, transition: { duration: duration.fast / 1000 } },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: duration.slow / 1000, ease: easing.easeOut } },
  exit: { opacity: 0, x: 20, transition: { duration: duration.fast / 1000 } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: duration.slow / 1000, ease: easing.spring } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: duration.fast / 1000 } },
};

export const modalEnter = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: duration.slow / 1000, ease: easing.spring } },
  exit: { opacity: 0, scale: 0.96, y: 10, transition: { duration: duration.fast / 1000 } },
};

/**
 * Stagger children para listas animadas
 */
export const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};