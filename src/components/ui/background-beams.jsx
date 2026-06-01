import React from "react";
import { cn } from "../../utils/cn";
import { motion } from "framer-motion";

export const BackgroundBeams = ({ className }) => {
  const paths = [
    "M-380.5 0.5C-380.5 0.5 -188.5 289 123 289C434.5 289 544.5 130 873.5 130C1202.5 130 1441.5 350.5 1441.5 350.5",
    "M-380.5 110.5C-380.5 110.5 -188.5 399 123 399C434.5 399 544.5 240 873.5 240C1202.5 240 1441.5 460.5 1441.5 460.5",
    "M-380.5 220.5C-380.5 220.5 -188.5 509 123 509C434.5 509 544.5 350 873.5 350C1202.5 350 1441.5 570.5 1441.5 570.5",
    "M-380.5 330.5C-380.5 330.5 -188.5 619 123 619C434.5 619 544.5 460 873.5 460C1202.5 460 1441.5 680.5 1441.5 680.5",
    "M-380.5 440.5C-380.5 440.5 -188.5 729 123 729C434.5 729 544.5 570 873.5 570C1202.5 570 1441.5 790.5 1441.5 790.5",
    "M-380.5 550.5C-380.5 550.5 -188.5 839 123 839C434.5 839 544.5 680 873.5 680C1202.5 680 1441.5 900.5 1441.5 900.5",
    "M-380.5 660.5C-380.5 660.5 -188.5 949 123 949C434.5 949 544.5 790 873.5 790C1202.5 790 1441.5 1010.5 1441.5 1010.5",
    "M-150.5 1010.5C-150.5 1010.5 200.5 600 450 600C700.5 600 780.5 800 1080.5 800C1380.5 800 1550.5 500.5 1550.5 500.5",
    "M-150.5 900.5C-150.5 900.5 200.5 490 450 490C700.5 490 780.5 690 1080.5 690C1380.5 690 1550.5 390.5 1550.5 390.5",
    "M-150.5 790.5C-150.5 790.5 200.5 380 450 380C700.5 380 780.5 580 1080.5 580C1380.5 580 1550.5 280.5 1550.5 280.5",
    "M-150.5 680.5C-150.5 680.5 200.5 270 450 270C700.5 270 780.5 470 1080.5 470C1380.5 470 1550.5 170.5 1550.5 170.5"
  ];

  return (
    <div
      className={cn(
        "fixed inset-0 z-0 flex items-center justify-center overflow-hidden bg-neutral-950",
        className
      )}
    >
      {/* Background Grid */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 100%)'
        }}
      />
      
      {/* Animated Beams SVG */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
        <svg
          className="w-full h-full"
          viewBox="0 0 1440 1024"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          {paths.map((path, index) => (
            <g key={index}>
              <path
                d={path}
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="1.5"
              />
              <motion.path
                d={path}
                stroke={`url(#linearGradient-${index})`}
                strokeWidth="2"
                strokeDasharray="200 400"
                strokeDashoffset="1000"
                initial={{ strokeDashoffset: 1000 }}
                animate={{ strokeDashoffset: -1000 }}
                transition={{
                  duration: 8 + (index % 4) * 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: (index % 3) * 1.5,
                }}
              />
              <defs>
                <linearGradient
                  id={`linearGradient-${index}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="50%" stopColor={index % 2 === 0 ? "#22d3ee" : "#a78bfa"} stopOpacity="0.8" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </g>
          ))}
        </svg>
      </div>

      <div className="absolute inset-0 bg-neutral-950/50 [mask-image:radial-gradient(ellipse_at_center,transparent_0%,black_80%)]" />
    </div>
  );
};
