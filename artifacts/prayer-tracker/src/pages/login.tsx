import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useLogin, useRegister } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Moon, Star } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState("");

  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [regData, setRegData] = useState({ username: "", password: "", name: "", city: "", country: "" });
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  const switchMode = (m: "login" | "register") => {
    setMode(m);
    setErrorMsg("");
    setRegErrors({});
  };

  const onLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!loginData.username || !loginData.password) {
      setErrorMsg("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }
    loginMutation.mutate(
      { data: loginData },
      {
        onSuccess: (res) => {
          localStorage.setItem("prayer_token", res.token);
          queryClient.invalidateQueries();
          setLocation(res.user.role === "admin" ? "/admin" : "/");
        },
        onError: () => {
          setErrorMsg("اسم المستخدم أو كلمة المرور غير صحيحة");
        },
      }
    );
  };

  const onRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const errors: Record<string, string> = {};
    if (!regData.name.trim()) errors.name = "الاسم مطلوب";
    if (!regData.username.trim()) errors.username = "اسم المستخدم مطلوب";
    if (!regData.password.trim()) errors.password = "كلمة المرور مطلوبة";
    if (Object.keys(errors).length > 0) {
      setRegErrors(errors);
      return;
    }
    setRegErrors({});
    registerMutation.mutate(
      {
        data: {
          username: regData.username.trim(),
          password: regData.password.trim(),
          name: regData.name.trim(),
          city: regData.city.trim() || undefined,
          country: regData.country.trim() || undefined,
        },
      },
      {
        onSuccess: (res) => {
          localStorage.setItem("prayer_token", res.token);
          queryClient.invalidateQueries();
          setLocation("/");
        },
        onError: (err: any) => {
          setErrorMsg(err?.message || "حدث خطأ، جرب اسم مستخدم آخر");
        },
      }
    );
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 opacity-50 pointer-events-none -z-10" />
      <Card className="w-full max-w-md border-primary/20 shadow-xl z-10 bg-card/80 backdrop-blur">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-primary relative">
              <Moon className="h-10 w-10 fill-primary/20" />
              <Star className="h-4 w-4 absolute top-2 right-2 fill-secondary text-secondary animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">رفيق الصلاة</CardTitle>
          <CardDescription className="text-base">
            {mode === "login" ? "أهلاً بك يا بطل! سجل دخولك لمتابعة صلواتك" : "أنشئ حسابك وابدأ رحلتك مع الصلاة"}
          </CardDescription>

          <div className="flex rounded-xl overflow-hidden border border-primary/20 mt-3">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 py-2 text-sm font-semibold transition-colors ${mode === "login" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-primary/10"}`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`flex-1 py-2 text-sm font-semibold transition-colors ${mode === "register" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-primary/10"}`}
            >
              حساب جديد
            </button>
          </div>
        </CardHeader>

        <CardContent>
          {mode === "login" ? (
            <form onSubmit={onLogin} className="space-y-5">
              <div className="space-y-1">
                <Label className="text-base">اسم المستخدم</Label>
                <Input
                  placeholder="أدخل اسمك هنا..."
                  className="h-12 text-lg"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-base">الرمز السري</Label>
                <Input
                  type="password"
                  placeholder="***"
                  className="h-12 text-lg text-left"
                  dir="ltr"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                />
              </div>
              {errorMsg && (
                <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md text-center">
                  {errorMsg}
                </div>
              )}
              <Button type="submit" className="w-full h-12 text-lg rounded-xl font-bold mt-2" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "جاري الدخول..." : "بسم الله، لنبدأ"}
              </Button>
            </form>
          ) : (
            <form onSubmit={onRegister} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-base">الاسم الكامل <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="ما اسمك؟"
                  className="h-12 text-lg"
                  value={regData.name}
                  onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                />
                {regErrors.name && <p className="text-sm text-destructive">{regErrors.name}</p>}
              </div>
              <div className="space-y-1">
                <Label className="text-base">اسم المستخدم <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="اختر اسم مستخدم..."
                  className="h-12 text-lg"
                  value={regData.username}
                  onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                />
                {regErrors.username && <p className="text-sm text-destructive">{regErrors.username}</p>}
              </div>
              <div className="space-y-1">
                <Label className="text-base">الرمز السري <span className="text-destructive">*</span></Label>
                <Input
                  type="password"
                  placeholder="اختر رمزاً سرياً..."
                  className="h-12 text-lg text-left"
                  dir="ltr"
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                />
                {regErrors.password && <p className="text-sm text-destructive">{regErrors.password}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>المدينة (اختياري)</Label>
                  <Input
                    placeholder="مثال: الرياض"
                    className="h-10"
                    value={regData.city}
                    onChange={(e) => setRegData({ ...regData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>الدولة (اختياري)</Label>
                  <Input
                    placeholder="مثال: السعودية"
                    className="h-10"
                    value={regData.country}
                    onChange={(e) => setRegData({ ...regData, country: e.target.value })}
                  />
                </div>
              </div>
              {errorMsg && (
                <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md text-center">
                  {errorMsg}
                </div>
              )}
              <Button type="submit" className="w-full h-12 text-lg rounded-xl font-bold mt-2" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? "جاري الإنشاء..." : "إنشاء الحساب 🌟"}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center pt-2 pb-6">
          <Link href="/admin/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            دخول المشرفين
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
