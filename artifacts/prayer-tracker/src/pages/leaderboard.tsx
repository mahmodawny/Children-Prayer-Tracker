import { useState } from "react";
import { useGetLeaderboard } from "@workspace/api-client-react";
import { useGetMe } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Crown, Star } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GetLeaderboardPeriod } from "@workspace/api-client-react";

export default function Leaderboard() {
  const [period, setPeriod] = useState<GetLeaderboardPeriod>("weekly");
  const { data: leaderboard, isLoading } = useGetLeaderboard({ period });
  const { data: user } = useGetMe();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-slate-400 fill-slate-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-700 fill-amber-700" />;
      default:
        return (
          <span className="font-bold text-muted-foreground w-6 text-center">
            {rank}
          </span>
        );
    }
  };

  const getRankColor = (rank: number, isMe: boolean) => {
    if (isMe) return "bg-transparent border-emerald-600/40 dark:border-emerald-400/30";
    return "bg-transparent border-border";
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col items-center text-center space-y-4 mb-8">
        <div className="p-4 bg-secondary/20 rounded-full relative">
          <Trophy className="w-12 h-12 text-secondary" />
          <Star className="w-6 h-6 absolute top-0 right-0 text-yellow-500 fill-yellow-500 animate-pulse" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">لوحة الشرف</h1>
          <p className="text-muted-foreground mt-1">تنافس في الخيرات مع أصدقائك</p>
        </div>

        <Tabs
          defaultValue="weekly"
          onValueChange={(v) => setPeriod(v as GetLeaderboardPeriod)}
          className="w-full max-w-sm mt-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">اليوم</TabsTrigger>
            <TabsTrigger value="weekly">الأسبوع</TabsTrigger>
            <TabsTrigger value="monthly">الشهر</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : leaderboard && leaderboard.length > 0 ? (
        <div className="space-y-3">
          {leaderboard.map((entry) => {
            const isMe = user?.id === entry.userId;

            return (
              <Card
                style={{margin:"10px"}}
                key={entry.userId}
                className={`overflow-hidden transition-all border ${getRankColor(entry.rank, isMe)} ${isMe ? "ring-2 ring-emerald-600/40 dark:ring-emerald-400/40 shadow-md scale-[1.02] z-10" : ""}`}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  {/* Rank icon */}
                  <div className="flex items-center justify-center w-8 shrink-0">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-lg font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                    {entry.name.substring(0, 2)}
                  </div>

                  {/* Name + username */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-foreground truncate flex items-center gap-2">
                      {entry.name}
                      {isMe && (
                        <span className="text-[10px] bg-emerald-700 dark:bg-emerald-500 text-white px-2 py-0.5 rounded-full font-normal">
                          أنت
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      @{entry.username}
                    </p>
                  </div>

                  {/* Points */}
                  <div className="text-center shrink-0">
                    <div className="text-lg font-bold text-foreground tabular-nums">
                      {entry.points}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium">
                      نقطة
                    </div>
                  </div>

                  {/* Compliance */}
                  <div className="hidden sm:block text-center shrink-0 border-l border-border pl-4 mr-2">
                    <div className="font-bold text-foreground">
                      {entry.compliance}%
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium">
                      التزام
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-foreground">لا توجد بيانات حالياً</h3>
          <p className="text-muted-foreground">كن أول من يسجل صلواته ليتصدر القائمة!</p>
        </Card>
      )}
    </div>
  );
}