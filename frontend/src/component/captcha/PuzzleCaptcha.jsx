"import { useEffect, useRef, useState } from \"react\";

const HANDLE_SIZE = 40;
const PADDING = 4;

export default function PuzzleCaptcha({ challenge, onChange, resetSignal }) {
  const trackRef = useRef(null);
  const [sliderX, setSliderX] = useState(0);
  const [maxX, setMaxX] = useState(0);
  const draggingRef = useRef(false);

  const trackWidth = challenge?.track_width ?? 300;
  const pieceSize = challenge?.piece_size ?? 50;
  const pieceY = challenge?.piece_y ?? 60;
  const targetX = challenge?.target_x ?? 150;
  const baseImage = challenge?.image;

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth;
      setMaxX(Math.max(0, w - HANDLE_SIZE - PADDING * 2));
    };
    compute();
    window.addEventListener(\"resize\", compute);
    return () => window.removeEventListener(\"resize\", compute);
  }, []);

  useEffect(() => {
    setSliderX(0);
    onChange(\"\");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal, challenge]);

  // Map sliderX (0..maxX) to piece position (0..trackWidth - pieceSize)
  const piecePosX = maxX > 0 ? (sliderX / maxX) * (trackWidth - pieceSize) : 0;

  const onPointerDown = (e) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const newX = Math.min(Math.max(0, e.clientX - rect.left - HANDLE_SIZE / 2), maxX);
    setSliderX(newX);
    // Send the piece position (in target coordinate space) on every move
    const pos = maxX > 0 ? (newX / maxX) * (trackWidth - pieceSize) : 0;
    onChange(pos.toFixed(1));
  };
  const onPointerUp = (e) => {
    draggingRef.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  return (
    <div className=\"space-y-3\">
      <p className=\"text-sm text-slate-600 text-center\">Drag the slider to fit the puzzle piece into the gap</p>

      {/* Image with cutout + moving piece */}
      <div
        className=\"relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 mx-auto\"
        style={{ width: trackWidth, height: 160 }}
        data-testid=\"puzzle-captcha-image\"
      >
        {baseImage && (
          <img src={baseImage} alt=\"puzzle base\" className=\"absolute inset-0 w-full h-full object-cover\" />
        )}

        {/* Gap (target) */}
        <div
          className=\"absolute rounded-md border-2 border-white/80\"
          style={{
            width: pieceSize,
            height: pieceSize,
            left: targetX,
            top: pieceY,
            background: \"rgba(15,23,42,0.55)\",
            boxShadow: \"inset 0 0 0 2px rgba(255,255,255,0.4)\",
          }}
        />

        {/* Moving puzzle piece */}
        <div
          className=\"absolute rounded-md overflow-hidden border-2 border-white shadow-lg\"
          style={{
            width: pieceSize,
            height: pieceSize,
            left: piecePosX,
            top: pieceY,
          }}
        >
          {baseImage && (
            <img
              src={baseImage}
              alt=\"piece\"
              style={{
                position: \"absolute\",
                left: -targetX,
                top: -pieceY,
                width: trackWidth,
                height: 160,
                maxWidth: \"none\",
                objectFit: \"cover\",
              }}
            />
          )}
        </div>
      </div>

      {/* Slider track */}
      <div
        ref={trackRef}
        className=\"relative h-11 rounded-xl bg-slate-100 border border-slate-200 select-none mx-auto\"
        style={{ width: trackWidth }}
        data-testid=\"puzzle-captcha-track\"
      >
        <div
          className=\"absolute inset-y-0 left-0 bg-indigo-100 rounded-l-xl\"
          style={{ width: `${sliderX + HANDLE_SIZE}px` }}
        />
        <div
          data-testid=\"puzzle-captcha-handle\"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{ left: `${sliderX + PADDING}px`, width: HANDLE_SIZE, height: HANDLE_SIZE - 8 }}
          className=\"absolute top-1/2 -translate-y-1/2 rounded-lg bg-white border border-slate-200 shadow flex items-center justify-center text-indigo-600 cursor-grab active:cursor-grabbing\"
        >
          <span className=\"text-lg leading-none\">⇆</span>
        </div>
      </div>
    </div>
  );
}
"