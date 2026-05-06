"import { useEffect, useState } from \"react\";
import { motion, AnimatePresence } from \"framer-motion\";
import { RefreshCw, ShieldCheck, CheckCircle2, XCircle, Loader2 } from \"lucide-react\";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from \"@/components/ui/select\";
import { Button } from \"@/components/ui/button\";
import { toast } from \"sonner\";
import { generateCaptcha, verifyCaptcha } from \"@/lib/api\";
import TextCaptcha from \"@/components/captcha/TextCaptcha\";
import MathCaptcha from \"@/components/captcha/MathCaptcha\";
import ImageCaptcha from \"@/components/captcha/ImageCaptcha\";
import SliderCaptcha from \"@/components/captcha/SliderCaptcha\";
import PuzzleCaptcha from \"@/components/captcha/PuzzleCaptcha\";

const CAPTCHA_TYPES = [
  { value: \"text\", label: \"Text Captcha\" },
  { value: \"math\", label: \"Math Captcha\" },
  { value: \"image\", label: \"Image Selection\" },
  { value: \"slider\", label: \"Slider Captcha\" },
  { value: \"puzzle\", label: \"Puzzle Captcha\" },
];

const initialAnswerFor = (type) => (type === \"image\" ? [] : \"\");

export default function CaptchaDemoPage() {
  const [type, setType] = useState(\"text\");
  const [captcha, setCaptcha] = useState(null);
  const [answer, setAnswer] = useState(\"\");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [resetSignal, setResetSignal] = useState(0);

  const loadCaptcha = async (t = type) => {
    setLoading(true);
    setStatus(null);
    setAnswer(initialAnswerFor(t));
    setResetSignal((s) => s + 1);
    try {
      const data = await generateCaptcha(t);
      setCaptcha(data);
    } catch (e) {
      toast.error(\"Failed to load captcha\");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCaptcha(type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const handleVerify = async () => {
    if (!captcha) return;
    // Empty submission guard (excluding image which can't be empty if any selection)
    const isEmpty =
      (Array.isArray(answer) && answer.length === 0) ||
      (typeof answer === \"string\" && answer.trim() === \"\");
    if (isEmpty) {
      toast.error(\"Please complete the captcha first\");
      return;
    }
    setVerifying(true);
    setStatus(null);
    try {
      const res = await verifyCaptcha(captcha.captcha_id, answer);
      if (res.success) {
        setStatus(\"success\");
        toast.success(\"Captcha verified and usable\");
      } else {
        setStatus(\"error\");
        toast.error(res.message || \"Verification failed\");
        // Auto refresh on failure after small delay
        setTimeout(() => loadCaptcha(type), 1200);
      }
    } catch (e) {
      setStatus(\"error\");
      const msg = e?.response?.data?.detail || \"Verification error\";
      toast.error(msg);
      setTimeout(() => loadCaptcha(type), 1200);
    } finally {
      setVerifying(false);
    }
  };

  const renderCaptcha = () => {
    if (!captcha?.challenge) return null;
    switch (captcha.type) {
      case \"text\":
        return <TextCaptcha challenge={captcha.challenge} value={answer} onChange={setAnswer} />;
      case \"math\":
        return <MathCaptcha challenge={captcha.challenge} value={answer} onChange={setAnswer} />;
      case \"image\":
        return <ImageCaptcha challenge={captcha.challenge} value={answer} onChange={setAnswer} />;
      case \"slider\":
        return <SliderCaptcha resetSignal={resetSignal} onChange={setAnswer} />;
      case \"puzzle\":
        return <PuzzleCaptcha challenge={captcha.challenge} resetSignal={resetSignal} onChange={setAnswer} />;
      default:
        return null;
    }
  };

  return (
    <div className=\"min-h-screen flex flex-col items-center justify-center px-4 py-10 md:py-16\">
      <div className=\"text-center mb-10 max-w-2xl\">
        <div className=\"inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur border border-slate-200 text-xs font-semibold text-indigo-700 mb-5\">
          <ShieldCheck className=\"w-3.5 h-3.5\" />
          PROTECTING YOUR FORMS — NO RECAPTCHA, NO TURNSTILE
        </div>
        <h1 className=\"font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900\">
          Verify you’re <span className=\"text-indigo-600\">human.</span>
        </h1>
        <p className=\"mt-4 text-base sm:text-lg text-slate-600 leading-relaxed\">
          Five custom captcha mechanisms — fully built in-house. Switch between them and watch the magic.
        </p>
      </div>

      <motion.div
        layout
        animate={{
          scale: status === \"success\" ? 1.02 : 1,
          x: status === \"error\" ? [0, -10, 10, -8, 8, 0] : 0,
        }}
        transition={{ duration: 0.45 }}
        className={`w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 ${
          status === \"success\" ? \"success-glow\" : \"\"
        } ${status === \"error\" ? \"error-glow\" : \"\"}`}
        data-testid=\"captcha-card\"
      >
        {/* Type switcher */}
        <div className=\"flex items-center justify-between gap-3 mb-5\">
          <div>
            <p className=\"text-xs font-semibold uppercase text-slate-400 tracking-wider\">Challenge type</p>
          </div>
          <Select value={type} onValueChange={setType} data-testid=\"captcha-type-select\">
            <SelectTrigger className=\"w-44 rounded-xl\" data-testid=\"captcha-type-trigger\">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CAPTCHA_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value} data-testid={`captcha-type-option-${t.value}`}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Captcha challenge */}
        <div className=\"min-h-[180px]\">
          {loading ? (
            <div className=\"h-44 flex items-center justify-center text-slate-400\">
              <Loader2 className=\"w-6 h-6 animate-spin\" />
            </div>
          ) : (
            <AnimatePresence mode=\"wait\">
              <motion.div
                key={captcha?.captcha_id || \"empty\"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {renderCaptcha()}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Status banner */}
        {status === \"success\" && (
          <div className=\"mt-5 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200\" data-testid=\"success-banner\">
            <CheckCircle2 className=\"w-5 h-5\" />
            <span className=\"text-sm font-medium\">Captcha verified and usable</span>
          </div>
        )}
        {status === \"error\" && (
          <div className=\"mt-5 flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200\" data-testid=\"error-banner\">
            <XCircle className=\"w-5 h-5\" />
            <span className=\"text-sm font-medium\">Verification failed. Refreshing...</span>
          </div>
        )}

        {/* Actions */}
        <div className=\"flex items-center gap-3 mt-6\">
          <Button
            type=\"button\"
            variant=\"ghost\"
            onClick={() => loadCaptcha(type)}
            data-testid=\"captcha-refresh-btn\"
            className=\"rounded-xl text-slate-600 hover:text-indigo-700 hover:bg-indigo-50\"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? \"animate-spin\" : \"\"}`} /> Refresh
          </Button>
          <Button
            type=\"button\"
            onClick={handleVerify}
            disabled={verifying || loading}
            data-testid=\"captcha-verify-btn\"
            className=\"flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 transition-all hover:-translate-y-0.5\"
          >
            {verifying ? (
              <><Loader2 className=\"w-4 h-4 mr-2 animate-spin\" /> Verifying…</>
            ) : (
              <>Verify</>
            )}
          </Button>
        </div>

        <p className=\"text-xs text-slate-400 text-center mt-4\">
          Each challenge expires after 5 minutes • One-time use
        </p>
      </motion.div>

      <div className=\"mt-10 grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-2xl w-full\">
        {CAPTCHA_TYPES.map((t) => (
          <button
            key={t.value}
            data-testid={`quick-switch-${t.value}`}
            onClick={() => setType(t.value)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              type === t.value
                ? \"bg-indigo-600 text-white shadow-md\"
                : \"bg-white border border-slate-200 text-slate-600 hover:border-indigo-300\"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
"