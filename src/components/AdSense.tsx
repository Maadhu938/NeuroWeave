import { useEffect, useRef } from 'react';

interface AdSenseProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const CLIENT_ID = 'ca-pub-3160169853957110';

export function AdSense({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
  style,
}: AdSenseProps) {
  const adRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
          (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('AdSense display error:', e);
    }
  }, []);

  // If no specific slot ID is configured yet, show a helpful placeholder in development
  if (!slot && import.meta.env.DEV) {
    return (
      <div
        className={`p-4 border border-dashed border-border/70 rounded-xl bg-card/40 text-center text-xs text-muted-foreground ${className}`}
        style={style}
      >
        <div className="font-medium text-foreground/80 mb-1">Google AdSense Unit</div>
        <p className="text-[11px]">
          Client: <code className="font-mono text-primary/80">{CLIENT_ID}</code>
        </p>
        <p className="text-[10px] mt-1 text-muted-foreground/70">
          Provide a <code>slot</code> ID to render a live ad unit, or rely on Auto Ads via the head tag.
        </p>
      </div>
    );
  }

  if (!slot) return null;

  return (
    <div className={`overflow-hidden my-4 flex justify-center ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style || { display: 'block' }}
        data-ad-client={CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}

export default AdSense;
