import { useState } from "react";
import { useGetTodayPrayers, useRecordPrayer, useGetMe, useGetPrayerTimes, getGetTodayPrayersQueryKey, getGetMyStatsQueryKey, getGetPrayerTimesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock, Lock, CheckCircle2, Sparkles, Sunrise, Sun, CloudSun, Sunset, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import type { PrayerRecordInputPrayerName } from "@workspace/api-client-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const PRAYER_ICONS: Record<string, any> = {
  fajr: Sunrise,
  dhuhr: Sun,
  asr: CloudSun,
  maghrib: Sunset,
  isha: Moon
};

export default function Home() {
  const queryClient = useQueryClient();
  const { data: user } = useGetMe();
  const { data: today, isLoading } = useGetTodayPrayers();
  const { data: prayerTimes } = useGetPrayerTimes({ city: user?.city || undefined, country: user?.country || undefined }, { query: { enabled: !!user, queryKey: getGetPrayerTimesQueryKey({ city: user?.city || undefined, country: user?.country || undefined }) } });
  
  const recordMutation = useRecordPrayer();
  const [celebrating, setCelebrating] = useState<string | null>(null);

  const handleRecord = (prayerName: string, date: string) => {
    recordMutation.mutate(
      { data: { prayerName: prayerName as PrayerRecordInputPrayerName, date } },
      {
        onSuccess: () => {
          setCelebrating(prayerName);
          setTimeout(() => setCelebrating(null), 3000);
          queryClient.invalidateQueries({ queryKey: getGetTodayPrayersQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMyStatsQueryKey() });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted animate-pulse rounded-2xl"></div>
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  if (!today) return null;

  const progress = (today.recordedCount / today.totalCount) * 100;
  
  const todayFormatted = format(new Date(today.date), "EEEE، d MMMM", { locale: ar });

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <Card className="bg-primary/5 border-primary/20 overflow-hidden relative">
        <div className="absolute right-0 top-0 h-full w-2 bg-primary"></div>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-right space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">صلوات اليوم</h1>
              <p className="text-muted-foreground">{todayFormatted}</p>
              {prayerTimes?.city && (
                <p className="text-xs text-muted-foreground">أوقات الصلاة لمدينة {prayerTimes.city}</p>
              )}
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted opacity-20" />
                  <motion.circle 
                    cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" 
                    className="text-primary drop-shadow-sm"
                    strokeDasharray="283"
                    initial={{ strokeDashoffset: 283 }}
                    animate={{ strokeDashoffset: 283 - (283 * progress) / 100 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-primary font-bold">
                  <span className="text-2xl sm:text-3xl">{today.recordedCount}/{today.totalCount}</span>
                </div>
              </div>
              <span className="text-sm font-medium text-muted-foreground">أكملت {Math.round(progress)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {today.prayers.map((prayer, index) => {
          const isCelebrating = celebrating === prayer.name;
          const Icon = PRAYER_ICONS[prayer.name] || Clock;
          
          return (
            <motion.div
              key={prayer.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative overflow-hidden transition-all duration-300 ${prayer.recorded ? 'bg-primary/10 border-primary/30' : prayer.canRecord ? 'hover:border-primary/50' : 'opacity-75 bg-muted/30'}`}>
                {isCelebrating && (
                  <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
                    <motion.div 
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 3, opacity: 0 }}
                      transition={{ duration: 1 }}
                      className="w-full h-full bg-primary/20 rounded-full"
                    />
                  </div>
                )}
                
                <CardContent className="p-4 sm:p-6 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${prayer.recorded ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {prayer.recorded ? <CheckCircle2 className="w-7 h-7" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{prayer.nameAr}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="w-4 h-4" />
                        <span>{prayer.time}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    {prayer.recorded ? (
                      <Button variant="outline" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 rounded-full cursor-default" disabled>
                        <Check className="w-5 h-5 ml-2" />
                        تمت الصلاة
                      </Button>
                    ) : prayer.canRecord ? (
                      <Button 
                        size="lg"
                        className="rounded-full shadow-md hover:shadow-lg transition-all"
                        onClick={() => handleRecord(prayer.name, today.date)}
                        disabled={recordMutation.isPending}
                      >
                        {isCelebrating ? <Sparkles className="w-5 h-5 ml-2 animate-spin" /> : <Check className="w-5 h-5 ml-2" />}
                        سجل الآن
                      </Button>
                    ) : prayer.passed ? (
                      <div className="text-destructive text-sm font-medium flex items-center gap-1 bg-destructive/10 px-3 py-1.5 rounded-full">
                        فات وقتها
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-sm flex items-center gap-1 bg-muted px-3 py-1.5 rounded-full">
                        <Lock className="w-4 h-4 ml-1" />
                        لم يحن الوقت
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}