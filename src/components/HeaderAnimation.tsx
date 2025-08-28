import React, { useRef, useEffect } from 'react';

type Props = { className?: string; animationSpeed?: number };

const HeaderAnimation: React.FC<Props> = ({ className = '', animationSpeed = 1 }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const blobs = Array.from(container.querySelectorAll<HTMLElement>('.ha-blob'));

    const handleMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const mx = e.clientX;
      const my = e.clientY;
      mouseRef.current.x = (mx - cx) / rect.width; // -0.5..0.5-ish
      mouseRef.current.y = (my - cy) / rect.height;
      schedule();
    };

    const handleLeave = () => {
      mouseRef.current.x = 0;
      mouseRef.current.y = 0;
      schedule();
    };

    const update = () => {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      blobs.forEach((b) => {
        const depth = parseFloat(b.dataset.depth || '0.5');
        const tx = mx * depth * 40 * animationSpeed; // px
        const ty = my * depth * 30 * animationSpeed; // px
        const scale = 1 + depth * 0.06;
        b.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;
      });
      rafRef.current = null;
    };

    const schedule = () => {
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(update);
    };

    container.addEventListener('mousemove', handleMove);
    container.addEventListener('mouseleave', handleLeave);
    container.addEventListener('touchmove', (ev: TouchEvent) => {
      if (ev.touches && ev.touches[0]) {
        const t = ev.touches[0];
        handleMove(new MouseEvent('mousemove', { clientX: t.clientX, clientY: t.clientY } as any));
      }
    }, { passive: true });

    // initial idle schedule to set transforms
    schedule();

    return () => {
      container.removeEventListener('mousemove', handleMove);
      container.removeEventListener('mouseleave', handleLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animationSpeed]);

  return (
    <div ref={containerRef} className={`header-animation pointer-events-none ${className}`} aria-hidden>
      <div className="ha-blob" data-depth="0.95" style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }} />
      <div className="ha-blob" data-depth="0.65" style={{ background: 'linear-gradient(135deg,#ff7ab6,#ffb46b)', opacity: 0.9 }} />
      <div className="ha-blob" data-depth="0.45" style={{ background: 'linear-gradient(135deg,#60a5fa,#7dd3fc)', opacity: 0.8 }} />
    </div>
  );
};

export default HeaderAnimation;
