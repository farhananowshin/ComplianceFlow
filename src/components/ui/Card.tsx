import React, { memo } from 'react';
import { motion } from 'motion/react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'glass';
  animated?: boolean;
}

export const Card = memo(React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', animated = true, className = '', ...props }, ref) => {
    const baseStyles = 'rounded-lg transition-all duration-200';
    const variants = {
      default:
        'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700',
      bordered:
        'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600',
      glass:
        'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-2xs',
    };

    if (animated) {
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          whileHover={{ y: -2 }}
          className={`${baseStyles} ${variants[variant]} ${className}`}
          {...(props as any)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
        {children}
      </div>
    );
  }
));
Card.displayName = 'Card';


export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = memo(({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-5 pb-3 border-b border-slate-100 dark:border-slate-800/60 ${className}`} {...props}>
    {children}
  </div>
));
CardHeader.displayName = 'CardHeader';

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = memo(({
  children,
  className = '',
  ...props
}) => (
  <h3 className={`text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight ${className}`} {...props}>
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = memo(({
  children,
  className = '',
  ...props
}) => (
  <p className={`text-xs text-slate-500 dark:text-slate-400 mt-0.5 ${className}`} {...props}>
    {children}
  </p>
));
CardDescription.displayName = 'CardDescription';

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = memo(({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-5 ${className}`} {...props}>
    {children}
  </div>
));
CardContent.displayName = 'CardContent';

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = memo(({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
));
CardFooter.displayName = 'CardFooter';

export default Card;
