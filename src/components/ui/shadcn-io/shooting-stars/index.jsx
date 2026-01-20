'use client';
import { cn } from "@/lib/utils";
import React, { useEffect, useState, useRef, useCallback } from "react";

export const ShootingStars = ({
  minSpeed = 10,
  maxSpeed = 30,
  minDelay = 1200,
  maxDelay = 4200,
  starColor = "#9E00FF",
  trailColor = "#2EB9DF",
  starWidth = 20, // Increased slightly for visibility
  starHeight = 2, // Increased slightly for visibility
  className,
}) => {
  const [star, setStar] = useState(null);
  const timeoutRef = useRef(null);

  const getRandomStartPoint = useCallback(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 1000;
    const side = Math.floor(Math.random() * 4);
    const offset = Math.random() * (side % 2 === 0 ? vw : vh);

    switch (side) {
      case 0: return { x: offset, y: 0, angle: 45 };
      case 1: return { x: vw, y: offset, angle: 135 };
      case 2: return { x: offset, y: vh, angle: 225 };
      case 3: return { x: 0, y: offset, angle: 315 };
      default: return { x: 0, y: 0, angle: 45 };
    }
  }, []);

  useEffect(() => {
    const createStar = () => {
      const { x, y, angle } = getRandomStartPoint();
      setStar({
        id: Date.now(),
        x,
        y,
        angle,
        scale: 1,
        speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
        distance: 0,
      });

      const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
      timeoutRef.current = setTimeout(createStar, randomDelay);
    };

    createStar();
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [minSpeed, maxSpeed, minDelay, maxDelay, getRandomStartPoint]);

  useEffect(() => {
    if (!star) return;

    const moveStar = () => {
      setStar((prevStar) => {
        if (!prevStar) return null;
        const radian = (prevStar.angle * Math.PI) / 180;
        const newX = prevStar.x + prevStar.speed * Math.cos(radian);
        const newY = prevStar.y + prevStar.speed * Math.sin(radian);
        
        // Check if out of bounds
        if (newX < -100 || newX > window.innerWidth + 100 || newY < -100 || newY > window.innerHeight + 100) {
          return null;
        }

        return { ...prevStar, x: newX, y: newY, distance: prevStar.distance + prevStar.speed };
      });
    };

    const frame = requestAnimationFrame(moveStar);
    return () => cancelAnimationFrame(frame);
  }, [star]);

  return (
    <svg className={cn("fixed inset-0 w-full h-full pointer-events-none z-50", className)}>
      <defs>
        {/* Unique ID to avoid conflicts */}
        <linearGradient id="shooting-star-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={trailColor} stopOpacity="0" />
          <stop offset="100%" stopColor={starColor} stopOpacity="1" />
        </linearGradient>
      </defs>
      {star && (
        <rect
          key={star.id}
          x={star.x}
          y={star.y}
          width={starWidth}
          height={starHeight}
          fill="url(#shooting-star-gradient)"
          transform={`rotate(${star.angle}, ${star.x}, ${star.y})`}
          style={{
            filter: `drop-shadow(0 0 4px ${starColor})` // Adds a glow "dot" effect
          }}
        />
      )}
    </svg>
  );
};