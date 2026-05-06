"import { useState } from \"react\";
import { useNavigate, Navigate } from \"react-router-dom\";
import { Lock, Loader2, ShieldCheck } from \"lucide-react\";
import { Button } from \"@/components/ui/button\";
import { Input } from \"@/components/ui/input\";
import { adminLogin } from \"@/lib/api\";
import { toast } from \"sonner\";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState(\"\");
  const [loading, setLoading] = useState(false);

  if (localStorage.getItem(\"admin_token\")) return <Navigate to=\"/admin\" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return toast.error(\"Enter your admin password\");
    setLoading(true);
    try {
      const { token } = await adminLogin(password);
      localStorage.setItem(\"admin_token\", token);
      toast.success(\"Welcome back\");
      navigate(\"/admin\");
    } catch (e) {
      toast.error(e?.response?.data?.detail || \"Login failed\");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=\"min-h-screen flex items-center justify-center px-4 py-10\">
      <form
        onSubmit={handleSubmit}
        className=\"w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8\"
        data-testid=\"admin-login-form\"
      >
        <div className=\"w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5\">
          <Lock className=\"w-5 h-5\" />
        </div>
        <h2 className=\"font-heading text-2xl font-bold text-slate-900\">Admin access</h2>
        <p className=\"text-sm text-slate-500 mt-1 mb-6\">Enter your password to view dashboard analytics.</p>

        <label className=\"text-xs font-semibold text-slate-600 uppercase tracking-wider\">Password</label>
        <Input
          data-testid=\"admin-password-input\"
          type=\"password\"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder=\"••••••••\"
          className=\"rounded-xl mt-1.5\"
          autoFocus
        />

        <Button
          type=\"submit\"
          disabled={loading}
          data-testid=\"admin-login-submit\"
          className=\"w-full mt-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3\"
        >
          {loading ? <Loader2 className=\"w-4 h-4 mr-2 animate-spin\" /> : <ShieldCheck className=\"w-4 h-4 mr-2\" />}
          Sign in to dashboard
        </Button>

        <p className=\"text-xs text-slate-400 mt-4 text-center\">
          Default password: <span className=\"font-mono text-slate-500\">admin123</span>
        </p>
      </form>
    </div>
  );
}
"