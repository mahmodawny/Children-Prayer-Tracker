import { useState } from "react";
import { useGetTodayPrayers, useRecordPrayer, useGetMe, useGetPrayerTimes, getGetTodayPrayersQueryKey, getGetMyStatsQueryKey, getGetPrayerTimesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Check, Clock, Lock, CheckCircle2, Sparkles, Sunrise, Sun, CloudSun, Sunset, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { PrayerRecordInputPrayerName } from "@workspace/api-client-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const PRAYER_ICONS: Record<string, any> = {
  fajr: Sunrise,
  dhuhr: Sun,
  asr: CloudSun,
  maghrib: Sunset,
  isha: Moon,
};

export default function Home() {
  const queryClient = useQueryClient();
  const { data: user } = useGetMe();
  const { data: today, isLoading } = useGetTodayPrayers();
  const { data: prayerTimes } = useGetPrayerTimes(
    { city: user?.city || undefined, country: user?.country || undefined },
    { query: { enabled: !!user, queryKey: getGetPrayerTimesQueryKey({ city: user?.city || undefined, country: user?.country || undefined }) } }
  );

  const recordMutation = useRecordPrayer();
  const [celebrating, setCelebrating] = useState<string | null>(null);

  const handleRecord = (prayerName: string, date: string) => {
    recordMutation.mutate(
      { data: { prayerName: prayerName as PrayerRecordInputPrayerName, date } },
      {
        onSuccess: () => {
          setCelebrating(prayerName);
          setTimeout(() => setCelebrating(null), 2000);
          queryClient.invalidateQueries({ queryKey: getGetTodayPrayersQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMyStatsQueryKey() });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-5 pb-12">
        <div className="h-44 bg-muted animate-pulse rounded-3xl" />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!today) return null;

  const progress = (today.recordedCount / today.totalCount) * 100;
  const todayFormatted = format(new Date(today.date + "T00:00:00"), "EEEE، d MMMM yyyy", { locale: ar });
  const allDone = today.recordedCount === today.totalCount;
  const circumference = 2 * Math.PI * 38;
  const bannerBg = allDone ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-primary to-primary/90";

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-16">

      {/* Hero Banner - no inherited text-white */}
      <div className={`relative overflow-hidden rounded-3xl p-6 ${bannerBg}`}>
        <div className="absolute -top-8 -left-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-10 -right-6 w-52 h-52 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute top-4 right-16 w-16 h-16 rounded-full bg-white/10 pointer-events-none" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p style={{ color: "rgba(255,255,255,0.85)" }} className="text-sm font-medium">{todayFormatted}</p>
            <h1 style={{ color: "#ffffff" }} className="text-2xl font-bold">صلوات اليوم</h1>
            <p style={{ color: "rgba(255,255,255,0.75)" }} className="text-sm">
              {prayerTimes?.city ? "أوقات القاهرة" : "تابع صلواتك"}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                {today.prayers.map(p => (
                  <div
                    key={p.name}
                    className="w-2.5 h-2.5 rounded-full transition-all"
                    style={{ backgroundColor: p.recorded ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.35)" }}
                  />
                ))}
              </div>
              <span style={{ color: "rgba(255,255,255,0.85)" }} className="text-sm">
                {today.recordedCount} من {today.totalCount}
              </span>
            </div>
          </div>

          <div className="relative flex-shrink-0 w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,1)" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - (circumference * progress) / 100 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center font-bold">
              <span style={{ color: "#ffffff" }} className="text-2xl leading-none">{today.recordedCount}</span>
              <span style={{ color: "rgba(255,255,255,0.85)" }} className="text-sm">/{today.totalCount}</span>
            </div>
          </div>
        </div>

        <div className="relative mt-4 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
          <motion.div
            className="absolute top-0 right-0 h-full rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,1)" }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Prayer Cards - explicit text-foreground to ensure correct color in all themes */}
      <div className="space-y-3 text-foreground">
        {today.prayers.map((prayer, index) => {
          const isCelebrating = celebrating === prayer.name;
          const Icon = PRAYER_ICONS[prayer.name] || Clock;

          return (
            <motion.div
              key={prayer.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
            >
              <div className={`
                relative overflow-hidden rounded-2xl border-2 transition-all duration-300
                ${prayer.recorded
                  ? "bg-primary/10 border-primary/40"
                  : prayer.canRecord
                  ? "bg-card border-primary shadow-md"
                  : "bg-card border-border"
                }
              `}>
                <AnimatePresence>
                  {isCelebrating && (
                    <motion.div
                      className="absolute inset-0 bg-primary/20 z-0"
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                    />
                  )}
                </AnimatePresence>

                <div className="relative z-10 flex items-center justify-between p-4 gap-3">
                  {/* Icon + Name */}
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
                      ${prayer.recorded
                        ? "bg-primary text-primary-foreground"
                        : prayer.canRecord
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                      }
                    `}>
                      {prayer.recorded
                        ? <CheckCircle2 className="w-6 h-6" />
                        : <Icon className="w-5 h-5" />
                      }
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground leading-tight">{prayer.nameAr}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span className="text-muted-foreground">{prayer.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    {prayer.recorded ? (
                      <div className="flex items-center gap-1.5 text-primary text-sm font-semibold bg-primary/15 px-3 py-1.5 rounded-full">
                        <Check className="w-4 h-4" />
                        تمت
                      </div>
                    ) : prayer.canRecord ? (
                      <Button
                        size="sm"
                        className="rounded-full px-5 font-bold"
                        onClick={() => handleRecord(prayer.name, today.date)}
                        disabled={recordMutation.isPending}
                      >
                        {isCelebrating ? <Sparkles className="w-4 h-4 ml-1 animate-spin" /> : <Check className="w-4 h-4 ml-1" />}
                        سجّل
                      </Button>
                    ) : prayer.passed ? (
                      <span className="text-destructive text-xs font-medium bg-destructive/10 border border-destructive/20 px-3 py-1.5 rounded-full">
                        فات وقتها
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs flex items-center gap-1 bg-muted px-3 py-1.5 rounded-full border border-border">
                        <Lock className="w-3 h-3" />
                        لم يحن
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
