import React, { Children, cloneElement, useState, useId } from 'react';
import { motion, AnimatePresence, Transition } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface AnimatedBackgroundProps {
  children: React.ReactNode;
  defaultValue?: string;
  className?: string;
  transition?: Transition;
  enableHover?: boolean;
  onValueChange?: (id: string | null) => void;
}

export function AnimatedBackground({
  children,
  defaultValue,
  className,
  transition = {
    type: 'spring',
    bounce: 0.2,
    duration: 0.3,
  },
  enableHover = false,
  onValueChange,
}: AnimatedBackgroundProps) {
  const [activeId, setActiveId] = useState<string | null>(defaultValue ?? null);
  const uniqueId = useId();

  const handleInteraction = (id: string | null) => {
    setActiveId(id);
    onValueChange?.(id);
  };

  return (
    <div className="relative inline-flex items-center">
      {Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        const childId = child.props['data-id'];
        const isSelected = activeId === childId;

        const interactionProps: any = {};
        if (enableHover) {
          interactionProps.onMouseEnter = () => handleInteraction(childId);
          interactionProps.onMouseLeave = () => handleInteraction(defaultValue ?? null);
        } else {
          interactionProps.onClick = (e: React.MouseEvent) => {
            child.props.onClick?.(e);
            handleInteraction(childId);
          };
        }

        return (
          <div className="relative inline-block">
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  layoutId={`animated-bg-${uniqueId}`}
                  className={cn('absolute inset-0 z-0 pointer-events-none', className)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={transition}
                />
              )}
            </AnimatePresence>
            <div className="relative z-10">
              {cloneElement(child, {
                ...interactionProps,
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AnimatedBackground;
