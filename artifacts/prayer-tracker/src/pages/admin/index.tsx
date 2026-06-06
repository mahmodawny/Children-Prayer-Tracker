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
    if (newPw.length < 4) { setPwError("كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل"); return; }
    if (newPw !== confirmPw) { setPwError("كلمة المرور الجديدة غير متطابقة"); return; }
    setPwLoading(true);
    try {
      const token = localStorage.getItem("prayer_token");
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) { setPwError(data.error || "حدث خطأ"); }
      else {
        setPwSuccess(true);
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
        setTimeout(() => { setPwSuccess(false); closeForm(); }, 2000);
      }
    } catch { setPwError("حدث خطأ في الاتصال"); }
    finally { setPwLoading(false); }
  };

  const closeForm = () => {
    setShowChangePassword(false);
    setPwError(""); setPwSuccess(false);
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!overview) return null;

  const stats = [
    { label: "إجمالي الأطفال", sub: "مسجلين في النظام", value: overview.totalChildren, icon: Users, iconBg: "bg-blue-100 dark:bg-blue-900/40", iconColor: "text-blue-600 dark:text-blue-400" },
    { label: "إجمالي الصلوات", sub: "صلاة مسجّلة", value: overview.totalPrayers, icon: Target, iconBg: "bg-primary/10", iconColor: "text-primary" },
    { label: "متوسط الالتزام", sub: "لجميع الأطفال", value: `${overview.averageCompliance}%`, icon: Activity, iconBg: "bg-emerald-100 dark:bg-emerald-900/40", iconColor: "text-emerald-600 dark:text-emerald-400" },
    { label: "صلوات اليوم", sub: "تم تسجيلها اليوم", value: overview.todayPrayers, icon: CalendarClock, iconBg: "bg-amber-100 dark:bg-amber-900/40", iconColor: "text-amber-600 dark:text-amber-400" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">نظرة عامة</h1>
          <p className="text-sm text-muted-foreground mt-0.5">مرحباً بك في لوحة الإدارة</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-full border-border"
          onClick={() => showChangePassword ? closeForm() : setShowChangePassword(true)}
        >
          <KeyRound className="w-4 h-4" />
          تغيير كلمة المرور
        </Button>
      </div>

      {/* Change Password Panel */}
      <AnimatePresence>
        {showChangePassword && (
          <motion.div
            key="pw-panel"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/40">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <KeyRound className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">تغيير كلمة مرور المشرف</span>
              </div>
              <button onClick={closeForm} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Panel body */}
            <div className="p-5">
              {pwSuccess ? (
                <div className="flex items-center justify-center gap-2 py-5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-5 h-5" />
                  تم تغيير كلمة المرور بنجاح
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Current password */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-medium">كلمة المرور الحالية</Label>
                      <div className="relative">
                        <Input type={showCurrent ? "text" : "password"} placeholder="••••••••" value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="pl-9 h-9 text-sm" dir="ltr" />
                        <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    {/* New password */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-medium">كلمة المرور الجديدة</Label>
                      <div className="relative">
                        <Input type={showNew ? "text" : "password"} placeholder="••••••••" value={newPw} onChange={e => setNewPw(e.target.value)} className="pl-9 h-9 text-sm" dir="ltr" />
                        <button type="button" onClick={() => setShowNew(v => !v)} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    {/* Confirm password */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-medium">تأكيد كلمة المرور</Label>
                      <Input type="password" placeholder="••••••••" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="h-9 text-sm" dir="ltr" />
                    </div>
                  </div>

                  {pwError && (
                    <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                      {pwError}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button type="submit" size="sm" className="rounded-full px-5" disabled={pwLoading || !currentPw || !newPw || !confirmPw}>
                      {pwLoading ? "جاري الحفظ..." : "حفظ"}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="rounded-full px-5" onClick={closeForm}>
                      إلغاء
                    </Button>
                  </div>
                </form>
              )}
            </div>
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.25 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium truncate">{s.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1 leading-none">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">{s.sub}</p>
                </div>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.iconBg}`}>
                  <Icon className={`w-4.5 h-4.5 ${s.iconColor}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Top Child */}
      {overview.topChild && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28, duration: 0.25 }}
          className="flex items-center gap-4 rounded-2xl border border-amber-300/50 dark:border-amber-700/40 bg-amber-50 dark:bg-amber-950/20 px-5 py-4"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-200/60 dark:bg-amber-800/40 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">المتصدر الحالي</p>
            <p className="font-bold text-foreground">
              {overview.topChild}
              <span className="text-muted-foreground font-normal text-sm"> — ما شاء الله 🌟</span>
            </p>
          </div>
        </motion.div>
      )}

    </div>
  );
}
