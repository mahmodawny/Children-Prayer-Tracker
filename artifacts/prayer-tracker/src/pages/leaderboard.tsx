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
      case 1: return <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-slate-300 fill-slate-300" />;
      case 3: return <Medal className="w-6 h-6 text-amber-700 fill-amber-700" />;
      default: return <span className="font-bold text-muted-foreground w-6 text-center">{rank}</span>;
    }
  };

  const getRankColor = (rank: number, isMe: boolean) => {
    if (isMe) return "bg-primary/10 border-primary/30";
    switch (rank) {
      case 1: return "bg-yellow-500/10 border-yellow-500/30";
      case 2: return "bg-slate-300/10 border-slate-300/30 dark:bg-slate-800 border-slate-700";
      case 3: return "bg-amber-700/10 border-amber-700/30";
      default: return "bg-card";
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col items-center text-center space-y-4 mb-8">
        <div className="p-4 bg-secondary/20 rounded-full text-secondary relative">
          <Trophy className="w-12 h-12" />
          <Star className="w-6 h-6 absolute top-0 right-0 text-yellow-500 fill-yellow-500 animate-pulse" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">لوحة الشرف</h1>
          <p className="text-muted-foreground mt-1">تنافس في الخيرات مع أصدقائك</p>
        </div>
        
        <Tabs defaultValue="weekly" onValueChange={(v) => setPeriod(v as GetLeaderboardPeriod)} className="w-full max-w-sm mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">اليوم</TabsTrigger>
            <TabsTrigger value="weekly">الأسبوع</TabsTrigger>
            <TabsTrigger value="monthly">الشهر</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl"></div>)}
        </div>
      ) : leaderboard && leaderboard.length > 0 ? (
        <div className="space-y-3">
          {leaderboard.map((entry) => {
            const isMe = user?.id === entry.userId;
            
            return (
              <Card key={entry.userId} className={`overflow-hidden transition-all ${getRankColor(entry.rank, isMe)} ${isMe ? 'ring-2 ring-primary/50 shadow-md transform scale-[1.02] z-10' : ''}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center text-lg font-bold shrink-0">
                    {entry.name.substring(0, 2)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate flex items-center gap-2">
                      {entry.name}
                      {isMe && <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-normal">أنت</span>}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">@{entry.username}</p>
                  </div>
                  
                  <div className="text-center shrink-0">
                    <div className="font-black text-xl text-primary">{entry.points}</div>
                    <div className="text-[10px] text-muted-foreground font-medium">نقطة</div>
                  </div>
                  
                  <div className="hidden sm:block text-center shrink-0 border-r pr-4 ml-2">
                    <div className="font-bold text-foreground">{entry.compliance}%</div>
                    <div className="text-[10px] text-muted-foreground font-medium">التزام</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold">لا توجد بيانات حالياً</h3>
          <p className="text-muted-foreground">كن أول من يسجل صلواته ليتصدر القائمة!</p>
        </Card>
      )}
    </div>
  );
}