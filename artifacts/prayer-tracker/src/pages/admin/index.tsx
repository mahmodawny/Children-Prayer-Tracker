import { useGetAdminOverview } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Activity, CalendarClock } from "lucide-react";

export default function AdminDashboard() {
  const { data: overview, isLoading } = useGetAdminOverview();

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl"></div>)}
    </div>;
  }

  if (!overview) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">نظرة عامة</h1>
        <p className="text-muted-foreground mt-1">مرحباً بك في لوحة الإدارة</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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