import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ChevronDown, ShieldCheck, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScrollVideoIntroProps {
  onFinishIntro: () => void;
}

export const ScrollVideoIntro: React.FC<ScrollVideoIntroProps> = ({ onFinishIntro }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const animationRef = useRef<number>();

  const TOTAL_FRAMES = 240;

  // Preload images
  const images = useMemo(() => {
    const imgs: HTMLImageElement[] = [];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNumber = i.toString().padStart(4, '0');
      img.src = `/frames/frame_${frameNumber}.jpg`;
      img.onload = () => {
        setImagesLoaded((prev) => prev + 1);
      };
      imgs.push(img);
    }
    return imgs;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollY = window.scrollY;
      const maxScroll = containerRef.current.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;

      targetProgress.current = Math.min(Math.max(scrollY / maxScroll, 0), 1);
    };

    const updateAnimation = () => {
      // Lerp for smoothness
      currentProgress.current += (targetProgress.current - currentProgress.current) * 0.08;
      setScrollProgress(currentProgress.current);

      // Draw the exact frame to canvas
      const canvas = canvasRef.current;
      if (canvas && images.length === TOTAL_FRAMES) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;

          // Calculate which frame to show
          let frameIndex = Math.floor(currentProgress.current * (TOTAL_FRAMES - 1));
          // Safety bound
          if (frameIndex < 0) frameIndex = 0;
          if (frameIndex >= TOTAL_FRAMES) frameIndex = TOTAL_FRAMES - 1;

          const img = images[frameIndex];
          if (img && img.complete && img.naturalWidth !== 0) {
            // Draw image covering the entire canvas (object-cover equivalent)
            const canvasRatio = canvas.width / canvas.height;
            const imgRatio = img.width / img.height;
            let drawWidth, drawHeight, offsetX, offsetY;

            if (canvasRatio > imgRatio) {
              drawWidth = canvas.width;
              drawHeight = canvas.width / imgRatio;
              offsetX = 0;
              offsetY = (canvas.height - drawHeight) / 2;
            } else {
              drawWidth = canvas.height * imgRatio;
              drawHeight = canvas.height;
              offsetX = (canvas.width - drawWidth) / 2;
              offsetY = 0;
            }

            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
          } else {
             // Fallback gradient if frame not loaded yet
             ctx.fillStyle = '#0F1B2D';
             ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        }
      }

      animationRef.current = requestAnimationFrame(updateAnimation);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    animationRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [images]);

  return (
    <div ref={containerRef} className="relative h-[1000vh] w-full bg-clinical-navy">
      {/* Fixed Fullscreen Canvas Container */}
      <div
        className="fixed top-0 left-0 w-full h-screen z-10 overflow-hidden transition-opacity duration-500"
        style={{ opacity: scrollProgress > 0.99 ? (1 - scrollProgress) * 100 : 1 }}
      >
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />

        {/* Loading Overlay */}
        {imagesLoaded < TOTAL_FRAMES && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-clinical-navy/80 backdrop-blur text-white flex-col space-y-4">
            <Stethoscope className="w-12 h-12 text-clinical-teal animate-pulse" />
            <div className="text-xl font-bold">Optimizing Video Stream</div>
            <div className="w-64 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-clinical-teal transition-all duration-300" 
                style={{ width: `${(imagesLoaded / TOTAL_FRAMES) * 100}%` }}
              />
            </div>
            <div className="text-sm text-clinical-teal font-mono">
              {Math.round((imagesLoaded / TOTAL_FRAMES) * 100)}%
            </div>
          </div>
        )}

        {/* Clinical Overlay Hud */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none flex flex-col justify-between p-8 text-white z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-clinical-teal p-2 rounded">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-wider">DOC SHAAB</span>
            </div>
            <div className="flex items-center gap-2 bg-clinical-navy/80 backdrop-blur px-3 py-1.5 rounded text-xs border border-clinical-teal/30">
              <ShieldCheck className="w-4 h-4 text-clinical-teal" />
              <span>HIPAA / Encrypted PHI Audit Compliant</span>
            </div>
          </div>

          <div className="text-center max-w-xl mx-auto space-y-4 mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="text-3xl md:text-5xl font-bold tracking-tight drop-shadow-lg"
            >
              <motion.span
                className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-white via-clinical-teal to-white bg-[length:200%_auto]"
                animate={{ backgroundPosition: ["0% center", "200% center"] }}
                transition={{ duration: 4, ease: "linear", repeat: Infinity }}
              >
                Personal Health Record Aggregator
              </motion.span>
            </motion.h1>
            <p className="text-slate-300 text-sm md:text-base">
              Scroll down to scrub video & initialize doctor pre-consultation engine.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-xs font-semibold text-clinical-teal animate-bounce">
              <ChevronDown className="w-4 h-4" />
              <span>Scroll to Scrub Frame {Math.round(scrollProgress * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Final Scroll Checkpoint Trigger - Animated entry ONLY at the end */}
      <div 
        className={`fixed inset-0 w-full h-screen z-30 flex items-center justify-center p-6 bg-clinical-navy/90 backdrop-blur-xl transition-all duration-700 ease-out ${
          scrollProgress > 0.99 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className={`bg-clinical-slate border border-clinical-teal/40 rounded-2xl p-10 max-w-lg w-full text-center space-y-8 shadow-[0_0_40px_rgba(44,122,123,0.2)] transform transition-all duration-1000 delay-150 ${
          scrollProgress > 0.99 ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-16 scale-95 opacity-0'
        }`}>
          <div className="relative w-20 h-20 bg-clinical-teal/20 border-2 border-clinical-teal rounded-full flex items-center justify-center mx-auto text-clinical-teal">
            <div className="absolute inset-0 rounded-full border-2 border-clinical-teal animate-ping opacity-20"></div>
            <Stethoscope className="w-10 h-10 animate-pulse" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">System Ready</h2>
            <p className="text-base text-slate-300">
              Scrub sequence complete. Connection established securely.
            </p>
          </div>
          <button
            onClick={onFinishIntro}
            className="group relative w-full flex items-center justify-center py-4 bg-clinical-teal hover:bg-teal-500 text-white font-bold text-lg rounded-xl shadow-lg transition-all overflow-hidden"
          >
            <div className="absolute inset-0 w-1/4 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[400%] transition-transform duration-1000 ease-in-out" />
            <span>Proceed to Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};
