import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface MotionViewProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
}

/**
 * A reusable wrapper for subtle entry transitions (fade-in + 8px slide-up).
 */
export const MotionView: React.FC<MotionViewProps> = ({ children, delay = 0, className, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

interface MotionStaggerContainerProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

/**
 * A container that staggers its children's animations (0.05s).
 */
export const MotionStaggerContainer: React.FC<MotionStaggerContainerProps> = ({ children, className, ...props }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05
          }
        }
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

interface MotionStaggerItemProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

/**
 * A staggered child item (fade-in + 8px slide-up).
 */
export const MotionStaggerItem: React.FC<MotionStaggerItemProps> = ({ children, className, ...props }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MotionStaggerTableRow: React.FC<HTMLMotionProps<"tr"> & { children: React.ReactNode }> = ({ children, className, ...props }) => {
  return (
    <motion.tr
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.tr>
  );
};
