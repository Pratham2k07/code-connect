import React, { useEffect, useRef } from "react";
import { cn } from "../../utils/cn";

export const SparklesCore = ({
  background = "transparent",
  minSize = 0.4,
  maxSize = 1,
  particleDensity = 1200,
  className,
  particleColor = "#FFFFFF",
}) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    let animationFrameId;
    let particles = [];
    
    const initParticles = () => {
      particles = [];
      const densityMultiplier = particleDensity / 1000;
      // Calculate particle count based on screen size to maintain density
      const area = canvas.width * canvas.height;
      const particleCount = Math.floor((area / 50000) * densityMultiplier * 100);
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * (maxSize - minSize) + minSize,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random(),
          opacitySpeed: (Math.random() * 0.015) + 0.005,
        });
      }
    };

    const setCanvasSize = () => {
      if (canvas.parentElement) {
        // Handle high DPI displays for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.parentElement.offsetWidth * dpr;
        canvas.height = canvas.parentElement.offsetHeight * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${canvas.parentElement.offsetWidth}px`;
        canvas.style.height = `${canvas.parentElement.offsetHeight}px`;
        initParticles();
      }
    };
    
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    const render = () => {
      // Clear canvas with transparent or solid background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const w = canvas.parentElement.offsetWidth;
      const h = canvas.parentElement.offsetHeight;
      
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Wrap around edges
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        
        // Twinkle effect (breathing opacity)
        p.opacity += p.opacitySpeed;
        if (p.opacity >= 1 || p.opacity <= 0.1) {
          p.opacitySpeed = -p.opacitySpeed;
        }
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
        ctx.fill();
      });
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      window.removeEventListener("resize", setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [maxSize, minSize, particleColor, particleDensity]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 block pointer-events-none", className)}
      style={{ background: background }}
    />
  );
};
