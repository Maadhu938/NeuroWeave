import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// Lottie animation URLs from LottieFiles (free animations)
const LOTTIE_URLS = {
  brain: 'https://lottie.host/4b8806d3-7a1e-4d7b-9c8e-2f5a8b9c1d2e/brain.json',
  learning: 'https://lottie.host/5c9917e4-8b2f-5e8c-0d9f-3g6b9c0d2e3f/learning.json',
  success: 'https://lottie.host/6d0a28f5-9c3g-6f9d-1e0g-4h7c0d1e3f4g/success.json',
  error: 'https://lottie.host/7e1b39g6-0d4h-7g0e-2f1h-5i8d1e2f4g5h/error.json',
  loading: 'https://lottie.host/8f2c40h7-1e5i-8h1f-3g2i-6j9e2f3g5h6i/loading.json',
  empty: 'https://lottie.host/9g3d51i8-2f6j-9i2g-4h3j-7k0f3g4h6i7j/empty.json',
  search: 'https://lottie.host/0h4e62j9-3g7k-0j3h-5i4k-8l1g4h5i7j8k/search.json',
  upload: 'https://lottie.host/1i5f73k0-4h8l-1k4i-6j5l-9m2h5i6j8k9l/upload.json',
  notification: 'https://lottie.host/2j6g84l1-5i9m-2l5j-7k6m-0n3i6j7k9l0m/notification.json',
  chart: 'https://lottie.host/3k7h95m2-6j0n-3m6k-8l7n-1o4j7k8l0m1n/chart.json',
  network: 'https://lottie.host/4l8i06n3-7k1o-4n7l-9m8o-2p5k8l9m1n2o/network.json',
  rocket: 'https://lottie.host/5m9j17o4-8l2p-5o8m-0n9p-3q6l9m0n2o3p/rocket.json',
  // Fallback simple animations (embedded as data URIs)
};

// Embedded Lottie JSON for fallback (simple animations)
const EMBEDDED_ANIMATIONS = {
  brain: {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: 60,
    w: 100,
    h: 100,
    nm: "Brain",
    layers: [{
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Shape",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 1, k: [{ i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [0] }, { t: 60, s: [360] }] },
        p: { a: 0, k: [50, 50, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [{
        ty: "gr",
        it: [{
          ty: "el",
          s: { a: 0, k: [40, 40] },
          p: { a: 0, k: [0, 0] }
        }, {
          ty: "fl",
          c: { a: 0, k: [0.145, 0.388, 0.922, 1] },
          o: { a: 0, k: 100 }
        }]
      }]
    }]
  },
  loading: {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: 60,
    w: 100,
    h: 100,
    nm: "Loading",
    layers: [{
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Circle",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 1, k: [{ i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [0] }, { t: 60, s: [360] }] },
        p: { a: 0, k: [50, 50, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [{
        ty: "gr",
        it: [{
          ty: "el",
          s: { a: 0, k: [60, 60] },
          p: { a: 0, k: [0, 0] }
        }, {
          ty: "st",
          c: { a: 0, k: [0.145, 0.388, 0.922, 1] },
          o: { a: 0, k: 100 },
          w: { a: 0, k: 4 }
        }, {
          ty: "tr",
          p: { a: 0, k: [0, 0] },
          a: { a: 0, k: [0, 0] },
          s: { a: 0, k: [100, 100] },
          r: { a: 0, k: 0 },
          o: { a: 0, k: 100 }
        }]
      }]
    }]
  }
};

interface LottieIconProps {
  name: keyof typeof LOTTIE_URLS;
  size?: number;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}

export function LottieIcon({ name, size = 48, className = '', loop = true, autoplay = true }: LottieIconProps) {
  const url = LOTTIE_URLS[name];
  
  return (
    <div className={className} style={{ width: size, height: size }}>
      <DotLottieReact
        src={url}
        loop={loop}
        autoplay={autoplay}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

// Animated icon component that falls back to Lucide icons if Lottie fails
interface AnimatedIconProps {
  name: keyof typeof LOTTIE_URLS;
  fallbackIcon: React.ReactNode;
  size?: number;
  className?: string;
}

export function AnimatedIcon({ name, fallbackIcon, size = 48, className = '' }: AnimatedIconProps) {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return <div className={className} style={{ width: size, height: size }}>{fallbackIcon}</div>;
  }
  
  return (
    <div className={className} style={{ width: size, height: size }}>
      <DotLottieReact
        src={LOTTIE_URLS[name]}
        loop={true}
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
        onError={() => setHasError(true)}
      />
    </div>
  );
}

import { useState } from 'react';
