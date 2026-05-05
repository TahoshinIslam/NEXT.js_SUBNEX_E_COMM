'use client';

import ShapeGrid from '@/components/ui/ShapeGrid';

export function StoreBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
      <ShapeGrid
        speed={0.3}
        squareSize={44}
        direction="diagonal"
        borderColor="#3b82f6"
        hoverFillColor="#6d28d9"
        shape="square"
        hoverTrailAmount={5}
      />
    </div>
  );
}
