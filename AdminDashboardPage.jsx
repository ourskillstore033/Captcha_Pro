"import { useEffect, useState } from \"react\";
import { useNavigate } from \"react-router-dom\";
import { motion } from \"framer-motion\";
import {
  Activity,
  CheckCircle2,
  XCircle,
  TrendingUp,
  RefreshCcw,
  Trash2,
  Loader2,
} from \"lucide-react\";
import { Button } from \"@/components/ui/button\";
import { fetchAdminStats, adminReset } from \"@/lib/api\";
import { toast } from \"sonner\";

const StatCard = ({ icon: Icon, label, value, color, testId }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className=\"bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6\"
    data-testid={testId}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} mb-3`}>
      <Icon className=\"w-5 h-5\" />
    </div>
    <p className=\"text-sm text-slate-500\">{label}</p>
    <p className=\"font-heading text-3xl font-bold text-slate-900 mt-1\">{value}</p>
  </motion.div>
);

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const token = localStorage.getItem(\"admin_token\");

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminStats(token);
      setStats(data);
    } catch (e) {
      if (e?.response?.status === 401) {
        localStorage.removeItem(\"admin_token\");
        navigate(\"/admin/login\");
        return;
      }
      toast.error(\"Failed to load stats\");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = async () => {
    if (!window.confirm(\"Reset all captcha statistics? This cannot be undone.\")) return;
    setResetting(true);
    try {
      await adminReset(token);
      toast.success(\"Stats reset\");
      await load();
    } catch (e) {
      toast.error(\"Reset failed\");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className=\"px-4 sm:px-8 py-10 max-w-6xl mx-auto\">
      <div className=\"flex flex-wrap items-center justify-between gap-4 mb-8\">
        <div>
          <h1 className=\"font-heading text-3xl sm:text-4xl font-bold text-slate-900\">Admin Dashboard</h1>
          <p className=\"text-slate-500 mt-1\">Monitor your captcha verification activity in real-time.</p>
        </div>
        <div className=\"flex gap-2\">
          <Button
            variant=\"outline\"
            onClick={load}
            disabled={loading}
            data-testid=\"dashboard-refresh-btn\"
            className=\"rounded-xl\"
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? \"animate-spin\" : \"\"}`} /> Refresh
          </Button>
          <Button
            variant=\"outline\"
            onClick={handleReset}
            disabled={resetting}
            data-testid=\"dashboard-reset-btn\"
            className=\"rounded-xl text-rose-600 hover:bg-rose-50 border-rose-200\"
          >
            <Trash2 className=\"w-4 h-4 mr-2\" /> Reset stats
          </Button>
        </div>
      </div>

      {loading && !stats ? (
        <div className=\"flex items-center justify-center h-64 text-slate-400\">
          <Loader2 className=\"w-6 h-6 animate-spin\" />
        </div>
      ) : stats ? (
        <>
          <div className=\"grid grid-cols-2 lg:grid-cols-4 gap-4\">
            <StatCard
              icon={Activity}
              label=\"Total attempts\"
              value={stats.total_attempts}
              color=\"bg-indigo-50 text-indigo-600\"
              testId=\"stat-total\"
            />
            <StatCard
              icon={CheckCircle2}
              label=\"Successful verifications\"
              value={stats.successful_verifications}
              color=\"bg-emerald-50 text-emerald-600\"
              testId=\"stat-success\"
            />
            <StatCard
              icon={XCircle}
              label=\"Failed verifications\"
              value={stats.failed_verifications}
              color=\"bg-rose-50 text-rose-600\"
              testId=\"stat-failed\"
            />
            <StatCard
              icon={TrendingUp}
              label=\"Success rate\"
              value={`${stats.success_rate}%`}
              color=\"bg-amber-50 text-amber-600\"
              testId=\"stat-rate\"
            />
          </div>

          {/* Per-type breakdown */}
          <div className=\"mt-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)]\">
            <h2 className=\"font-heading text-lg font-semibold text-slate-900 mb-4\">By captcha type</h2>
            {stats.by_type?.length ? (
              <div className=\"space-y-3\">
                {stats.by_type.map((t) => {
                  const rate = t.total ? Math.round((t.success / t.total) * 100) : 0;
                  return (
                    <div key={t.type} className=\"flex items-center gap-4\" data-testid={`bytype-${t.type}`}>
                      <div className=\"w-24 capitalize text-sm font-medium text-slate-700\">{t.type}</div>
                      <div className=\"flex-1\">
                        <div className=\"h-2.5 bg-slate-100 rounded-full overflow-hidden\">
                          <div className=\"h-full bg-indigo-500\" style={{ width: `${rate}%` }} />
                        </div>
                      </div>
                      <div className=\"text-sm text-slate-600 w-32 text-right\">
                        <span className=\"font-semibold text-slate-900\">{t.success}</span>
                        <span className=\"text-slate-400\"> / {t.total}</span>
                        <span className=\"text-xs ml-2 text-slate-400\">({rate}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className=\"text-sm text-slate-500\">No data yet. Try a few captchas on the demo page.</p>
            )}
          </div>

          {/* Recent activity */}
          <div className=\"mt-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)]\">
            <h2 className=\"font-heading text-lg font-semibold text-slate-900 mb-4\">Recent activity</h2>
            {stats.recent?.length ? (
              <div className=\"divide-y divide-slate-100\">
                {stats.recent.map((r) => (
                  <div key={r.id} className=\"flex items-center justify-between py-3 text-sm\" data-testid={`recent-${r.id}`}>
                    <div className=\"flex items-center gap-3\">
                      {r.success ? (
                        <CheckCircle2 className=\"w-4 h-4 text-emerald-500\" />
                      ) : (
                        <XCircle className=\"w-4 h-4 text-rose-500\" />
                      )}
                      <span className=\"capitalize font-medium text-slate-700\">{r.type}</span>
                    </div>
                    <span className=\"text-xs text-slate-400\">
                      {new Date(r.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className=\"text-sm text-slate-500\">No recent verifications.</p>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
"