import React, { useRef, useEffect } from 'react';

type Props = {
  path?: string;
  animationData?: any;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
};

const LottiePlayer: React.FC<Props> = ({ path, animationData, loop = true, autoplay = true, className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    let anim: any = null;
    (async () => {
      const lottie: any = await import('lottie-web');
      if (cancelled) return;
      try {
        anim = lottie.loadAnimation({
          container: containerRef.current as Element,
          renderer: 'svg',
          loop,
          autoplay,
          path: path,
          animationData: animationData,
        });
        playerRef.current = anim;
      } catch (e) {
        // no-op, fallback will show nothing
        console.error('Lottie load failed', e);
      }
    })();

    return () => {
      cancelled = true;
      if (playerRef.current && playerRef.current.destroy) playerRef.current.destroy();
    };
  }, [path, animationData, loop, autoplay]);

  return <div ref={containerRef} className={className} />;
};

export default LottiePlayer;
