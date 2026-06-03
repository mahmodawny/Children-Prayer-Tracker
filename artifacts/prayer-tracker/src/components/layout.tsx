import { Link, useLocation } from "wouter";
import { useGetMe } from "@workspace/api-client-react";
import { Moon, Sun, LogOut, Home, BarChart2, CalendarDays, Trophy, Users, LayoutDashboard } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">تبديل المظهر</span>
    </Button>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading } = useGetMe({
    query: { retry: false, queryKey: ["getMe"] as const }
  });
  const queryClient = useQueryClient();

  const isAuthPage = location === "/login" || location === "/admin/login";

  useEffect(() => {
    if (isLoading) return;
    if (!user && !isAuthPage) {
      setLocation("/login");
    } else if (user && user.role === "admin" && !location.startsWith("/admin")) {
      setLocation("/admin");
    } else if (user && user.role === "child" && location.startsWith("/admin")) {
      setLocation("/");
    }
  }, [user, isLoading, location, isAuthPage, setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("prayer_token");
    queryClient.clear();
    setLocation("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans">
      {!isAuthPage && (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between mx-auto px-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-primary">رفيق الصلاة</span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              {user?.role === "child" ? (
                <>
                  <Link href="/"><a className={`text-sm font-medium transition-colors hover:text-primary ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`}>الرئيسية</a></Link>
                  <Link href="/dashboard"><a className={`text-sm font-medium transition-colors hover:text-primary ${location === '/dashboard' ? 'text-primary' : 'text-muted-foreground'}`}>إحصائياتي</a></Link>
                  <Link href="/history"><a className={`text-sm font-medium transition-colors hover:text-primary ${location === '/history' ? 'text-primary' : 'text-muted-foreground'}`}>السجل</a></Link>
                  <Link href="/leaderboard"><a className={`text-sm font-medium transition-colors hover:text-primary ${location === '/leaderboard' ? 'text-primary' : 'text-muted-foreground'}`}>المتصدرين</a></Link>
                </>
              ) : user?.role === "admin" ? (
                <>
                  <Link href="/admin"><a className={`text-sm font-medium transition-colors hover:text-primary ${location === '/admin' ? 'text-primary' : 'text-muted-foreground'}`}>لوحة التحكم</a></Link>
                  <Link href="/admin/children"><a className={`text-sm font-medium transition-colors hover:text-primary ${location.startsWith('/admin/children') ? 'text-primary' : 'text-muted-foreground'}`}>الأطفال</a></Link>
                </>
              ) : null}
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user && (
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">تسجيل الخروج</span>
                </Button>
              )}
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      {!isAuthPage && user?.role === "child" && (
        <nav className="md:hidden sticky bottom-0 z-50 w-full border-t bg-background">
          <div className="flex justify-around items-center h-16">
            <Link href="/" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
              <Home className="h-5 w-5" />
              <span className="text-[10px] font-medium">الرئيسية</span>
            </Link>
            <Link href="/dashboard" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location === '/dashboard' ? 'text-primary' : 'text-muted-foreground'}`}>
              <BarChart2 className="h-5 w-5" />
              <span className="text-[10px] font-medium">إحصائياتي</span>
            </Link>
            <Link href="/history" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location === '/history' ? 'text-primary' : 'text-muted-foreground'}`}>
              <CalendarDays className="h-5 w-5" />
              <span className="text-[10px] font-medium">السجل</span>
            </Link>
            <Link href="/leaderboard" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location === '/leaderboard' ? 'text-primary' : 'text-muted-foreground'}`}>
              <Trophy className="h-5 w-5" />
              <span className="text-[10px] font-medium">المتصدرين</span>
            </Link>
          </div>
        </nav>
      )}
      {!isAuthPage && user?.role === "admin" && (
        <nav className="md:hidden sticky bottom-0 z-50 w-full border-t bg-background">
          <div className="flex justify-around items-center h-16">
            <Link href="/admin" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location === '/admin' ? 'text-primary' : 'text-muted-foreground'}`}>
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-[10px] font-medium">لوحة التحكم</span>
            </Link>
            <Link href="/admin/children" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.startsWith('/admin/children') ? 'text-primary' : 'text-muted-foreground'}`}>
              <Users className="h-5 w-5" />
              <span className="text-[10px] font-medium">الأطفال</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
