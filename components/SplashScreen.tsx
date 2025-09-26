import React, { useEffect, useRef } from 'react';

const SplashScreen: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        interface Particle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            color: string;
            opacity: number;
        }

        let particlesArray: Particle[] = [];
        const numberOfParticles = 50;

        const createParticle = (): Particle => {
            const size = Math.random() * 2 + 1;
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const speedX = (Math.random() * 0.4) - 0.2;
            const speedY = (Math.random() * 0.4) - 0.2;
            const color = `rgba(255, 165, 0, ${Math.random() * 0.5 + 0.3})`;
            return { x, y, size, speedX, speedY, color, opacity: Math.random() * 0.5 + 0.2 };
        };

        const init = () => {
            particlesArray = [];
            for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push(createParticle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                const p = particlesArray[i];
                p.x += p.speedX;
                p.y += p.speedY;

                // Twinkle effect
                if (Math.random() > 0.99) {
                    p.opacity = Math.random() * 0.7 + 0.3;
                }

                // Reset particle if it goes off screen
                if (p.x > canvas.width || p.x < 0 || p.y > canvas.height || p.y < 0) {
                    Object.assign(p, createParticle());
                    p.x = Math.random() * canvas.width;
                    p.y = Math.random() * canvas.height;
                }
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 165, 0, ${p.opacity})`;
                ctx.fill();
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-[#121212] flex items-center justify-center z-50 animate-splash-fade">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70"></canvas>
            
            <div className="relative flex flex-col items-center justify-center">
                {/* Pulsing Radial Gradient */}
                <div className="absolute w-96 h-96 bg-gradient-radial from-brand-hot-orange/30 via-amber-500/20 to-transparent rounded-full animate-pulse-radial"></div>

                {/* Glow Ring */}
                <div className="absolute w-48 h-48 rounded-full border-2 border-amber-400/50 animate-expand-ring"></div>
                
                {/* Logo */}
                <div className="relative w-40 h-40 animate-fade-in-content">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.25 8.25C16.25 9.90685 14.9068 11.25 13.25 11.25H10.75C9.09315 11.25 7.75 12.5932 7.75 14.25C7.75 15.9068 9.09315 17.25 10.75 17.25H13.25" stroke="url(#logo-gradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <defs>
                            <linearGradient id="logo-gradient" x1="7.75" y1="8.25" x2="16.25" y2="17.25" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#FFA500"/>
                                <stop offset="1" stopColor="#FF6F61"/>
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                
                {/* App Name */}
                <h1 className="mt-4 text-4xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-white/70 animate-fade-in-content" style={{ animationDelay: '0.2s' }}>
                    Storify
                </h1>
            </div>
        </div>
    );
};

export default SplashScreen;
