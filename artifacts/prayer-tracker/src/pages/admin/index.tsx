import { useState } from "react";
import { useGetAdminOverview } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Target, Activity, CalendarClock, KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react";

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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (!overview) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">نظرة عامة</h1>
          <p className="text-muted-foreground mt-1">مرحباً بك في لوحة الإدارة</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => { setShowChangePassword(v => !v); setPwError(""); setPwSuccess(false); }}
        >
          <KeyRound className="w-4 h-4" />
          تغيير كلمة المرور
        </Button>
      </div>

      {/* Change Password Card */}
      {showChangePassword && (
        <Card className="border-primary/30 bg-primary/5 m-10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" />
              تغيير كلمة مرور المشرف
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pwSuccess ? (
              <div className="flex items-center gap-2 text-emerald-600 font-semibold py-4 justify-center">
                <CheckCircle2 className="w-5 h-5" />
                تم تغيير كلمة المرور بنجاح ✓
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label>كلمة المرور الحالية</Label>
                  <div className="relative">
                    <Input
                      type={showCurrent ? "text" : "password"}
                      placeholder="أدخل كلمة المرور الحالية"
                      value={currentPw}
                      onChange={e => setCurrentPw(e.target.value)}
                      className="pl-10"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(v => !v)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>كلمة المرور الجديدة</Label>
                  <div className="relative">
                    <Input
                      type={showNew ? "text" : "password"}
                      placeholder="كلمة المرور الجديدة"
                      value={newPw}
                      onChange={e => setNewPw(e.target.value)}
                      className="pl-10"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(v => !v)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>تأكيد كلمة المرور الجديدة</Label>
                  <Input
                    type="password"
                    placeholder="أعد كتابة كلمة المرور"
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    dir="ltr"
                  />
                </div>

                {pwError && (
                  <div className="md:col-span-3 text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
                    {pwError}
                  </div>
                )}

                <div className="md:col-span-3 flex gap-3">
                  <Button type="submit" disabled={pwLoading || !currentPw || !newPw || !confirmPw}>
                    {pwLoading ? "جاري الحفظ..." : "حفظ كلمة المرور"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setShowChangePassword(false); setPwError(""); }}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-10">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأطفال</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalChildren}</div>
            <p className="text-xs text-muted-foreground mt-1">مسجلين في النظام</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الصلوات</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalPrayers}</div>
            <p className="text-xs text-muted-foreground mt-1">صلاة تم تسجيلها</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الالتزام</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.averageCompliance}%</div>
            <p className="text-xs text-muted-foreground mt-1">لجميع الأطفال</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صلوات اليوم</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.todayPrayers}</div>
            <p className="text-xs text-muted-foreground mt-1">تم تسجيلها هذا اليوم</p>
          </CardContent>
        </Card>
      </div>

      {overview.topChild && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-2 text-primary">المتصدر الحالي 🏆</h3>
            <p>الطفل <strong>{overview.topChild}</strong> يتصدر القائمة حالياً. ما شاء الله!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
