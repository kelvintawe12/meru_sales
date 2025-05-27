import React from "react";

const letters = ["M", "E", "R", "U"];

export const MeruLoader: React.FC = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
    <div className="flex space-x-3 text-5xl font-extrabold text-[#2C5B48]">
      {letters.map((letter, i) => (
        <span
          key={letter}
          className="inline-block animate-meru-advanced"
          style={{
            animationDelay: `${i * 0.18}s`,
            animationDuration: "2s",
            animationIterationCount: "infinite",
          }}
        >
          {letter}
        </span>
      ))}
    </div>
    <style>
      {`
        @keyframes meru-advanced {
          0% {
            transform: translateY(0) scale(1);
            color: #2C5B48;
            opacity: 0.7;
            text-shadow: 0 2px 8px #2C5B4840;
          }
          10% {
            transform: translateY(-18px) scale(1.18) rotate(-8deg);
            color: #22c55e;
            opacity: 1;
            text-shadow: 0 6px 16px #22c55e44;
          }
          20% {
            transform: translateY(0) scale(1.08) rotate(0deg);
            color: #2C5B48;
            opacity: 1;
            text-shadow: 0 2px 8px #2C5B4840;
          }
          60% {
            transform: translateY(0) scale(1);
            color: #2C5B48;
            opacity: 0.7;
            text-shadow: 0 2px 8px #2C5B4840;
          }
          100% {
            transform: translateY(0) scale(1);
            color: #2C5B48;
            opacity: 0.7;
            text-shadow: 0 2px 8px #2C5B4840;
          }
        }
        .animate-meru-advanced {
          animation-name: meru-advanced;
          animation-timing-function: ease-in-out;
        }
      `}
    </style>
  </div>
);