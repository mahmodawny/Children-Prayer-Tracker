import { useGetMyStats, useGetMyAchievements } from "@workspace/api-client-react";
import { useGetMe } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Flame, Star, Trophy, Activity, Target, Award, Calendar } from "lucide-react";

export default function Dashboard() {
  const { data: user } = useGetMe();
  const { data: stats, isLoading } = useGetMyStats();
  const { data: achievements, isLoading: achievementsLoading } = useGetMyAchievements();

  if (isLoading) {
    return <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl"></div>)}
      </div>
      <div className="h-64 bg-muted animate-pulse rounded-xl"></div>
    </div>;
  }

  if (!stats) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground">إحصائياتي</h1>
        <p className="text-muted-foreground mt-2">تابع تقدمك وإنجازاتك يا بطل!</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-orange-500/20 rounded-full text-orange-600">
              <Flame className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-bold text-orange-700 dark:text-orange-400">{stats.currentStreak}</h3>
            <p className="text-sm font-medium text-orange-700/80 dark:text-orange-400/80">أيام متتالية</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-yellow-500/20 rounded-full text-yellow-600">
              <Star className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{stats.points}</h3>
            <p className="text-sm font-medium text-yellow-700/80 dark:text-yellow-400/80">مجموع النقاط</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-emerald-500/10 border-primary/20">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-primary/20 rounded-full text-primary">
              <Target className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-bold text-primary">{stats.totalPrayers}</h3>
            <p className="text-sm font-medium text-primary/80">صلاة مكتملة</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-blue-500/20 rounded-full text-blue-600">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-bold text-blue-700 dark:text-blue-400">{stats.weeklyCompliance}%</h3>
            <p className="text-sm font-medium text-blue-700/80 dark:text-blue-400/80">التزام الأسبوع</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              معدل الالتزام
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>اليوم</span>
                <span>{stats.dailyCompliance}%</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all rounded-full" style={{ width: `${stats.dailyCompliance}%` }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>هذا الأسبوع</span>
                <span>{stats.weeklyCompliance}%</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all rounded-full" style={{ width: `${stats.weeklyCompliance}%` }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>هذا الشهر</span>
                <span>{stats.monthlyCompliance}%</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all rounded-full" style={{ width: `${stats.monthlyCompliance}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-secondary" />
              آخر الإنجازات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {achievementsLoading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg"></div>)}
              </div>
            ) : achievements && achievements.length > 0 ? (
              <div className="space-y-4">
                {achievements.slice(0, 3).map(ach => (
                  <div key={ach.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                    <div className="text-3xl">{ach.icon || "🏅"}</div>
                    <div>
                      <h4 className="font-bold">{ach.titleAr}</h4>
                      <p className="text-xs text-muted-foreground">{ach.descriptionAr}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                <Award className="w-12 h-12 mb-2 opacity-20" />
                <p>لم تحصل على إنجازات بعد. واصل الصلاة!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}