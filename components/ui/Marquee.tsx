import { cn } from "@/lib/utils";
import React from "react";

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  duration?: string;
}

export function Marquee({
  children,
  className,
  reverse = false,
  pauseOnHover = true,
  duration = "40s",
}: MarqueeProps) {
  return (
    <div
      className={cn("flex w-full overflow-hidden [--duration:40s]", className)}
      style={{ "--duration": duration } as React.CSSProperties}
    >
      <div
        className={cn(
          "flex w-max min-w-full shrink-0 items-center justify-around gap-4 animate-marquee",
          reverse && "direction-reverse",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
