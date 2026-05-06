"import { useEffect, useRef, useState } from \"react\";
import { Input } from \"@/components/ui/input\";

const drawCaptcha = (canvas, text) => {
  const ctx = canvas.getContext(\"2d\");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, \"#EEF2FF\");
  grad.addColorStop(1, \"#F0F9FF\");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Noise lines
  for (let i = 0; i < 7; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 100 + 80},${Math.random() * 100 + 80},${Math.random() * 200 + 55},0.55)`;
    ctx.lineWidth = 1 + Math.random() * 1.5;
    ctx.beginPath();
    ctx.moveTo(Math.random() * w, Math.random() * h);
    ctx.bezierCurveTo(
      Math.random() * w, Math.random() * h,
      Math.random() * w, Math.random() * h,
      Math.random() * w, Math.random() * h
    );
    ctx.stroke();
  }

  // Random dots
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = `rgba(${Math.random() * 200},${Math.random() * 200},${Math.random() * 200},0.6)`;
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw each character with rotation + jitter
  const chars = text.split(\"\");
  const colors = [\"#4F46E5\", \"#7C3AED\", \"#0EA5E9\", \"#F59E0B\", \"#EC4899\", \"#10B981\"];
  const charWidth = w / (chars.length + 1);
  ctx.font = \"bold 38px 'Outfit', sans-serif\";
  ctx.textBaseline = \"middle\";

  chars.forEach((ch, i) => {
    ctx.save();
    const x = charWidth * (i + 1);
    const y = h / 2 + (Math.random() - 0.5) * 14;
    const angle = (Math.random() - 0.5) * 0.6; // ±0.3 rad
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.fillText(ch, -12, 0);
    ctx.restore();
  });

  // Top noise line
  ctx.strokeStyle = \"rgba(79,70,229,0.35)\";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let x = 0; x < w; x += 5) {
    ctx.lineTo(x, h / 2 + Math.sin(x / 18) * 8);
  }
  ctx.stroke();
};

export default function TextCaptcha({ challenge, onChange, value }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && challenge?.text) {
      drawCaptcha(canvasRef.current, challenge.text);
    }
  }, [challenge]);

  return (
    <div className=\"space-y-3\">
      <canvas
        ref={canvasRef}
        width={300}
        height={100}
        className=\"captcha-canvas w-full max-w-sm mx-auto rounded-xl border border-slate-200 shadow-sm\"
        data-testid=\"text-captcha-canvas\"
      />
      <Input
        data-testid=\"text-captcha-input\"
        placeholder=\"Enter the text shown above\"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        maxLength={8}
        className=\"rounded-xl text-center tracking-widest font-mono text-lg\"
      />
    </div>
  );
}
"