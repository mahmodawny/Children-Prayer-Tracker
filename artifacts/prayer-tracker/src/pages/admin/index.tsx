import { useState } from "react";
import { useGetAdminOverview } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Target, Activity, CalendarClock, KeyRound, Eye, EyeOff, CheckCircle2, Trophy, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const { data: overview, isLoading } = useGetAdminOverview();

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);

    if (newPw.length < 4) {
      setPwError("كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("كلمة المرور الجديدة غير متطابقة");
      return;
    }

    setPwLoading(true);
    try {
      const token = localStorage.getItem("prayer_token");
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error || "حدث خطأ");
      } else {
        setPwSuccess(true);
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
        setTimeout(() => {
          setPwSuccess(false);
          setShowChangePassword(false);
        }, 2000);
      }
    } catch {
      setPwError("حدث خطأ في الاتصال");
    } finally {
      setPwLoading(false);
    }
  };

  const closePasswordForm = () => {
    setShowChangePassword(false);
    setPwError("");
    setPwSuccess(false);
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-12 w-64 bg-muted animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!overview) return null;

  const stats = [
    {
      label: "إجمالي الأطفال",
      sub: "مسجلين في النظام",
      value: overview.totalChildren,
      icon: Users,
      color: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
      ring: "ring-blue-500/20",
    },
    {
      label: "إجمالي الصلوات",
      sub: "صلاة تم تسجيلها",
      value: overview.totalPrayers,
      icon: Target,
      color: "bg-primary/15 text-primary",
      ring: "ring-primary/20",
    },
    {
      label: "متوسط الالتزام",
      sub: "لجميع الأطفال",
      value: `${overview.averageCompliance}%`,
      icon: Activity,
      color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      ring: "ring-emerald-500/20",
    },
    {
      label: "صلوات اليوم",
      sub: "تم تسجيلها اليوم",
      value: overview.todayPrayers,
      icon: CalendarClock,
      color: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      ring: "ring-amber-500/20",
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">نظرة عامة</h1>
          <p className="text-muted-foreground text-sm mt-0.5">مرحباً بك في لوحة الإدارة</p>
        </div>
        <Button
          variant={showChangePassword ? "secondary" : "outline"}
          size="sm"
          className="gap-2 rounded-full"
          onClick={() => showChangePassword ? closePasswordForm() : setShowChangePassword(true)}
        >
          <KeyRound className="w-4 h-4" />
          تغيير كلمة المرور
        </Button>
      </div>

      {/* Change Password Panel */}
      <AnimatePresence>
        {showChangePassword && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-semibold text-foreground">تغيير كلمة مرور المشرف</h2>
              </div>
              <button
                onClick={closePasswordForm}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {pwSuccess ? (
              <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold py-6">
                <CheckCircle2 className="w-5 h-5" />
                تم تغيير كلمة المرور بنجاح
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-foreground">كلمة المرور الحالية</Label>
                    <div className="relative">
                      <Input
                        type={showCurrent ? "text" : "password"}
                        placeholder="••••••••"
                        value={currentPw}
                        onChange={e => setCurrentPw(e.target.value)}
                        className="pl-10"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(v => !v)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm text-foreground">كلمة المرور الجديدة</Label>
                    <div className="relative">
                      <Input
                        type={showNew ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPw}
                        onChange={e => setNewPw(e.target.value)}
                        className="pl-10"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(v => !v)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm text-foreground">تأكيد كلمة المرور</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPw}
                      onChange={e => setConfirmPw(e.target.value)}
                      dir="ltr"
                    />
                  </div>
                </div>

                {pwError && (
                  <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-2.5 rounded-xl">
                    {pwError}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    type="submit"
                    size="sm"
                    className="rounded-full px-5"
                    disabled={pwLoading || !currentPw || !newPw || !confirmPw}
                  >
                    {pwLoading ? "جاري الحفظ..." : "حفظ"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-full px-5"
                    onClick={closePasswordForm}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3 }}
              className={`rounded-2xl border border-border bg-card p-5 ring-1 ${s.ring} shadow-sm`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Top Child Banner */}
      {overview.topChild && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="rounded-2xl border border-amber-400/30 bg-amber-50 dark:bg-amber-950/30 p-5 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">المتصدر الحالي</p>
            <p className="font-bold text-foreground text-base">
              {overview.topChild} <span className="text-muted-foreground font-normal text-sm">— ما شاء الله! 🌟</span>
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
