import { useState } from "react";
import { Trophy, Crown, Medal, ChevronRight, ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const ARABIC_MONTHS = [
  "يناير","فبراير","مارس","أبريل","مايو","يونيو",
  "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"
];

interface LeaderboardEntry {
  rank: number;
  userId: number;
  name: string;
  username: string;
  prayers: number;
  compliance: number;
  points: number;
}

function useMonthlyLeaderboard(year: number, month: number) {
  const [data, setData] = useState<LeaderboardEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastKey, setLastKey] = useState("");

  const key = `${year}-${month}`;
  if (key !== lastKey) {
    setLastKey(key);
    setIsLoading(true);
    setData(null);
    setError(null);
    const token = localStorage.getItem("prayer_token");
    fetch(`/api/leaderboard?year=${year}&month=${month}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { setData(d); setIsLoading(false); })
      .catch(() => { setError("حدث خطأ في تحميل البيانات"); setIsLoading(false); });
  }

  return { data, isLoading, error };
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-400 fill-slate-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-700 fill-amber-700" />;
  return <span className="font-bold text-muted-foreground w-5 text-center text-sm">{rank}</span>;
}

export default function AdminLeaderboard() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data, isLoading, error } = useMonthlyLeaderboard(year, month);

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const isFutureMonth = year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth() + 1);

  const goToPrev = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const goToNext = () => {
    if (isCurrentMonth) return;
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">لوحة الشرف الشهرية</h1>
        <p className="text-sm text-muted-foreground mt-0.5">ترتيب الأطفال حسب عدد الصلوات المسجّلة في الشهر</p>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={goToPrev}
          className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="text-center min-w-[160px]">
          <p className="text-xl font-bold text-foreground">
            {ARABIC_MONTHS[month - 1]} {year}
          </p>
          {isCurrentMonth && (
            <span className="text-xs text-primary font-medium">الشهر الحالي</span>
          )}
        </div>

        <button
          onClick={goToNext}
          disabled={isCurrentMonth}
          className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-8 text-center border-destructive/30 bg-destructive/5">
          <p className="text-destructive">{error}</p>
        </Card>
      ) : data && data.length > 0 ? (
        <div className="space-y-2">
          {data.map((entry, i) => (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.2 }}
            >
              <Card className={`border ${
                entry.rank === 1 ? "border-yellow-300/60 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-yellow-700/40" :
                entry.rank === 2 ? "border-slate-300/60 dark:border-slate-600/40" :
                entry.rank === 3 ? "border-amber-300/60 dark:border-amber-700/40" :
                "border-border"
              }`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex items-center justify-center w-7 shrink-0">
                    {getRankIcon(entry.rank)}
                  </div>

                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    {entry.name.substring(0, 2)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">@{entry.username}</p>
                  </div>

                  <div className="text-center shrink-0 min-w-[60px]">
                    <p className="text-lg font-bold text-foreground">{entry.prayers}</p>
                    <p className="text-[10px] text-muted-foreground">صلاة</p>
                  </div>

                  <div className="text-center shrink-0 min-w-[50px] border-r border-border pr-3">
                    <p className={`text-sm font-bold ${
                      entry.compliance >= 80 ? "text-emerald-600 dark:text-emerald-400" :
                      entry.compliance >= 50 ? "text-amber-600 dark:text-amber-400" :
                      "text-red-600 dark:text-red-400"
                    }`}>{entry.compliance}%</p>
                    <p className="text-[10px] text-muted-foreground">التزام</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h3 className="text-lg font-bold text-foreground">لا توجد بيانات لهذا الشهر</h3>
          <p className="text-muted-foreground text-sm mt-1">لم يتم تسجيل أي صلوات في {ARABIC_MONTHS[month - 1]} {year}</p>
        </Card>
      )}
    </div>
  );
}
