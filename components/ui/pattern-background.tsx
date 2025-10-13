import React from "react";
import { cn } from "@/lib/utils";

interface PatternBackgroundProps {
  className?: string;
  patternSize?: number;
  opacity?: number;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
  id?: string;
}

const PatternBackground = ({
  className,
  patternSize = 80,
  opacity = 0.1,
  color = "#308d43",
  backgroundColor = "#ffffff",
  id,
  children,
}: PatternBackgroundProps) => {
  const patternId = `hometown-pattern-${
    id || Math.random().toString(36).substr(2, 9)
  }`;

  return (
    <div className={cn("relative", className)}>
      {/* SVG Pattern Definition */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          opacity,
          imageRendering: "crisp-edges",
        }}
        shapeRendering="crispEdges"
      >
        <defs>
          {/* Checkerboard Pattern */}
          <pattern
            id={patternId}
            x="0"
            y="0"
            width={patternSize * 2}
            height={patternSize * 2}
            patternUnits="userSpaceOnUse"
          >
            {/* Top-left: Logo with foreground color */}
            <rect
              x="0"
              y="0"
              width={patternSize + 1.5}
              height={patternSize + 1}
              fill={backgroundColor}
            />
            <svg
              x="0"
              y="0"
              width={patternSize}
              height={patternSize}
              viewBox="0 0 400.64 400"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M273.34,262.46h126.98v137.22h-126.98v-137.22ZM127.3.32l.1,136.66h145.94l-115.86,124.87h-30.46v138.47H.32v-140.78l127.08-122.55H.32V.32h126.98ZM400.32.32v262.56l-126.98-125.9V.32h126.98Z"
                fill={color}
                strokeWidth="0"
              />
            </svg>

            {/* Top-right: Logo with inverted colors */}
            <rect
              x={patternSize - 0.5}
              y="0"
              width={patternSize + 0.5}
              height={patternSize + 0.5}
              fill={color}
            />
            <svg
              x={patternSize}
              y="0"
              width={patternSize}
              height={patternSize}
              viewBox="0 0 400.64 400"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M273.34,262.46h126.98v137.22h-126.98v-137.22ZM127.3.32l.1,136.66h145.94l-115.86,124.87h-30.46v138.47H.32v-140.78l127.08-122.55H.32V.32h126.98ZM400.32.32v262.56l-126.98-125.9V.32h126.98Z"
                fill={backgroundColor}
                strokeWidth="0"
              />
            </svg>

            {/* Bottom-left: Logo with inverted colors */}
            <rect
              x="0"
              y={patternSize - 0.5}
              width={patternSize + 0.5}
              height={patternSize + 0.5}
              fill={color}
            />
            <svg
              x="0"
              y={patternSize}
              width={patternSize}
              height={patternSize}
              viewBox="0 0 400.64 400"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M273.34,262.46h126.98v137.22h-126.98v-137.22ZM127.3.32l.1,136.66h145.94l-115.86,124.87h-30.46v138.47H.32v-140.78l127.08-122.55H.32V.32h126.98ZM400.32.32v262.56l-126.98-125.9V.32h126.98Z"
                fill={backgroundColor}
                strokeWidth="0"
              />
            </svg>

            {/* Bottom-right: Logo with foreground color */}
            <rect
              x={patternSize - 0.5}
              y={patternSize - 0.5}
              width={patternSize + 0.5}
              height={patternSize + 0.5}
              fill={backgroundColor}
            />
            <svg
              x={patternSize}
              y={patternSize}
              width={patternSize}
              height={patternSize}
              viewBox="0 0 400.64 400"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M273.34,262.46h126.98v137.22h-126.98v-137.22ZM127.3.32l.1,136.66h145.94l-115.86,124.87h-30.46v138.47H.32v-140.78l127.08-122.55H.32V.32h126.98ZM400.32.32v262.56l-126.98-125.9V.32h126.98Z"
                fill={color}
                strokeWidth="0"
              />
            </svg>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default PatternBackground;
