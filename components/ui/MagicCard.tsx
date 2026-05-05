"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MagicCardProps {
  children: React.ReactNode;
  className?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
}

export function MagicCard({
  children,
  className,
  gradientSize = 400,
  gradientColor = "#3b82f6",
  gradientOpacity = 0.15,
}: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      if (!cardRef.current) return;
      const { left, top } = cardRef.current.getBoundingClientRect();
      setMousePosition({
        x: ev.clientX - left,
        y: ev.clientY - top,
      });
    };

    if (isHovering) {
      window.addEventListener("mousemove", updateMousePosition);
    } else {
      window.removeEventListener("mousemove", updateMousePosition);
    }

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, [isHovering]);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setMousePosition({ x: -1000, y: -1000 });
      }}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] transition-colors duration-500",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-500 z-0"
        style={{
          opacity: isHovering ? gradientOpacity : 0,
          background: `radial-gradient(${gradientSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${gradientColor}, transparent 100%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
