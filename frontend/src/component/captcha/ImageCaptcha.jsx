"import { Check } from \"lucide-react\";

export default function ImageCaptcha({ challenge, onChange, value }) {
  const selected = Array.isArray(value) ? value : [];

  const toggle = (idx) => {
    const next = selected.includes(idx)
      ? selected.filter((i) => i !== idx)
      : [...selected, idx];
    onChange(next);
  };

  return (
    <div className=\"space-y-3\">
      <div className=\"rounded-xl bg-indigo-600 text-white px-4 py-3 text-center\">
        <p className=\"text-sm uppercase tracking-wide opacity-80\">Select all images with</p>
        <p className=\"font-heading text-lg font-semibold\">bicycles</p>
      </div>
      <div className=\"grid grid-cols-3 gap-2\" data-testid=\"image-captcha-grid\">
        {(challenge?.images || []).map((url, idx) => {
          const isSel = selected.includes(idx);
          return (
            <button
              key={idx}
              type=\"button\"
              data-testid={`image-captcha-cell-${idx}`}
              onClick={() => toggle(idx)}
              className={`relative aspect-square overflow-hidden rounded-lg transition-all hover:scale-[1.02] focus:outline-none ${
                isSel ? \"ring-[3px] ring-indigo-600\" : \"ring-1 ring-slate-200\"
              }`}
            >
              <img src={url} alt={`option-${idx}`} className=\"w-full h-full object-cover\" />
              {isSel && (
                <span className=\"absolute top-1.5 right-1.5 bg-indigo-600 text-white rounded-full p-1 shadow-lg\">
                  <Check className=\"w-3 h-3\" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className=\"text-xs text-slate-500 text-center\">
        Tap to select. Click verify when finished.
      </p>
    </div>
  );
}
"