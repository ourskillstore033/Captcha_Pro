"import { useEffect, useRef, useState } from \"react\";
import { ChevronsRight, Check } from \"lucide-react\";

const TRACK_PADDING = 4;
const HANDLE_SIZE = 40;

export default function SliderCaptcha({ onChange, resetSignal }) {
  const trackRef = useRef(null);
  const [x, setX] = useState(0);
  const [maxX, setMaxX] = useState(0);
  const [completed, setCompleted] = useState(false);
  const draggingRef = useRef(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth;
      setMaxX(Math.max(0, w - HANDLE_SIZE - TRACK_PADDING * 2));
    };
    compute();
    window.addEventListener(\"resize\", compute);
    return () => window.removeEventListener(\"resize\", compute);
  }, []);

  // Reset when resetSignal changes
  useEffect(() => {
    setX(0);
    setCompleted(false);
    onChange(\"\");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  const onPointerDown = (e) => {
    if (completed) return;
    draggingRef.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current || completed) return;
    const rect = trackRef.current.getBoundingClientRect();
    const newX = Math.min(Math.max(0, e.clientX - rect.left - HANDLE_SIZE / 2), maxX);
    setX(newX);
  };

  const onPointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (x >= maxX - 2) {
      setX(maxX);
      setCompleted(true);
      onChange(\"completed\");
    } else {
      // Reset on premature release
      setX(0);
      onChange(\"\");
    }
  };

  const progress = maxX > 0 ? x / maxX : 0;

  return (
    <div className=\"space-y-3\">
      <p className=\"text-sm text-slate-600 text-center\">Drag the slider to the right to verify</p>
      <div
        ref={trackRef}
        className={`relative h-12 rounded-xl border ${
          completed ? \"border-emerald-400 bg-emerald-50\" : \"border-slate-200 bg-slate-100\"
        } overflow-hidden select-none`}
        data-testid=\"slider-captcha-track\"
      >
        {/* Filled bar */}
        <div
          className={`absolute inset-y-0 left-0 ${completed ? \"bg-emerald-200\" : \"bg-indigo-100\"}`}
          style={{ width: `${x + HANDLE_SIZE}px` }}
        />
        {/* Hint text */}
        {!completed && (
          <div className=\"absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-sm\">
            <span style={{ opacity: 1 - progress }}>Slide to verify →</span>
          </div>
        )}
        {completed && (
          <div className=\"absolute inset-0 flex items-center justify-center text-emerald-700 text-sm font-medium\">
            Verified slide
          </div>
        )}
        {/* Handle */}
        <div
          data-testid=\"slider-captcha-handle\"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{ left: `${x + TRACK_PADDING}px`, width: HANDLE_SIZE, height: HANDLE_SIZE }}
          className={`absolute top-1/2 -translate-y-1/2 rounded-lg shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing transition-colors ${
            completed ? \"bg-emerald-500 text-white\" : \"bg-white text-indigo-600 border border-slate-200\"
          }`}
        >
          {completed ? <Check className=\"w-5 h-5\" /> : <ChevronsRight className=\"w-5 h-5\" />}
        </div>
      </div>
    </div>
  );
}
"