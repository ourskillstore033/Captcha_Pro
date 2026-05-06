"import { Input } from \"@/components/ui/input\";

export default function MathCaptcha({ challenge, onChange, value }) {
  return (
    <div className=\"space-y-3\">
      <div
        className=\"rounded-xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-sky-50 px-6 py-8 text-center\"
        data-testid=\"math-captcha-display\"
      >
        <p className=\"text-sm text-slate-500 mb-2\">Solve the math problem</p>
        <p className=\"font-heading text-4xl font-bold text-slate-900 tracking-wide\">
          {challenge?.expression} <span className=\"text-indigo-600\">= ?</span>
        </p>
      </div>
      <Input
        data-testid=\"math-captcha-input\"
        type=\"number\"
        placeholder=\"Enter the answer\"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className=\"rounded-xl text-center text-lg\"
      />
    </div>
  );
}
"