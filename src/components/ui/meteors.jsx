import React, { useMemo } from "react";
import { cn } from "../../utils/cn";

export const Meteors = ({ number = 20, className }) => {
  const meteors = useMemo(() => new Array(number).fill(true), [number]);
  
  return (
    <>
      <style>{`
        @keyframes custom-meteor-effect {
          0% {
            transform: rotate(215deg) translateX(0);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: rotate(215deg) translateX(-1500px);
            opacity: 0;
          }
        }
        .animate-meteor {
          animation: custom-meteor-effect 5s linear infinite;
        }
      `}</style>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {meteors.map((el, idx) => {
          const duration = Math.floor(Math.random() * (12 - 4) + 4) + "s";
          const delay = Math.random() * (1.5 - 0.2) + 0.2 + "s";
          const left = Math.floor(Math.random() * (120 - -20) + -20) + "%"; // Spread across width

          return (
            <span
              key={"meteor" + idx}
              className={cn(
                "animate-meteor absolute h-0.5 w-0.5 rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10]",
                "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#64748b] before:to-transparent",
                className
              )}
              style={{
                top: '-5%',
                left: left,
                animationDelay: delay,
                animationDuration: duration,
              }}
            />
          );
        })}
      </div>
    </>
  );
};
