// src/components/Starfield.js
import React, { useRef, useEffect } from 'react';
import './Starfield.css'; // Ensure this file exists with the correct styles

const Starfield = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let stars = [];
    const numStars = 100;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Reinitialize stars on resize
      stars = [];
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5,
          alpha: Math.random(),
          dx: (Math.random() - 0.5) * 0.5,
          dy: (Math.random() - 0.5) * 0.5,
        });
      }
    };

    window.addEventListener('resize', resize);
    resize();

    // Initialize stars
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        alpha: Math.random(),
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
      });
    }

    const animate = () => {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill background with black
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();

        // Move stars slightly for a twinkling effect
        star.x += star.dx;
        star.y += star.dy;

        // Reposition stars if they move out of bounds
        if (star.x < 0 || star.x > canvas.width) star.x = Math.random() * canvas.width;
        if (star.y < 0 || star.y > canvas.height) star.y = Math.random() * canvas.height;
      });
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="starfield-canvas" />;
};

export default Starfield;
