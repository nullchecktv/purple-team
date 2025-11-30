import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', hoverable = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white/80
        backdrop-blur-xl
        rounded-3xl
        border
        border-slate-200/60
        p-8
        shadow-xl
        shadow-slate-200/50
        transition-all
        duration-500
        ease-out
        ${hoverable ? 'hover:shadow-2xl hover:shadow-slate-300/50 hover:scale-105 cursor-pointer hover:bg-white/90' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
