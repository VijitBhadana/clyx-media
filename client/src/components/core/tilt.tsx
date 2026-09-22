import React, { useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

interface TiltProps {
  children: React.ReactNode;
  className?: string;
  rotationFactor?: number;
  isRevese?: boolean;
  isReverse?: boolean;
  style?: React.CSSProperties;
}

const springConfig = { damping: 20, stiffness: 260, mass: 0.5 };

export function Tilt({
  children,
  className = '',
  rotationFactor = 8,
  isRevese = false,
  isReverse = false,
  style = {},
}: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const rotateX = useSpring(0, springConfig);
  const rotateY = useSpring(0, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;

    const reverseMultiplier = (isRevese || isReverse) ? -1 : 1;
    rotateX.set(-yPct * rotationFactor * reverseMultiplier * 2);
    rotateY.set(xPct * rotationFactor * reverseMultiplier * 2);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        rotateX,
        rotateY,
        perspective: 1000,
        ...style,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default Tilt;
