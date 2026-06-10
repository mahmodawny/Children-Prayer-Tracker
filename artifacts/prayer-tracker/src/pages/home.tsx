import { useState } from "react";
import { useGetTodayPrayers, useRecordPrayer, useGetMe, useGetPrayerTimes, getGetTodayPrayersQueryKey, getGetMyStatsQueryKey, getGetPrayerTimesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Check, Clock, Lock, CheckCircle2, Sparkles, Sunrise, Sun, CloudSun, Sunset, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { PrayerRecordInputPrayerName } from "@workspace/api-client-react";
import { format, parseISO } from "date-fns";
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

  if (!today?.date) return null;

  const progress = (today.recordedCount / today.totalCount) * 100;
  const todayFormatted = format(parseISO(today.date), "EEEE، d MMMM yyyy", { locale: ar });
  const allDone = today.recordedCount === today.totalCount;
  const circumference = 2 * Math.PI * 38;

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-16">

      {/* Hero Banner */}
      <div
        className="relative overflow-hidden rounded-3xl p-6"
        style={{ background: allDone ? "linear-gradient(135deg, #10b981, #0d9488)" : "linear-gradient(135deg, #065f46, #064e3b)" }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-8 -left-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-10 -right-6 w-52 h-52 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute top-4 right-16 w-16 h-16 rounded-full bg-white/10 pointer-events-none" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="space-y-1">
            {/* Use Tailwind's text-white/85 etc. instead of inline styles — cleaner and consistent */}
            <p className="text-sm font-medium text-white/85">{todayFormatted}</p>
            <h1 className="text-2xl font-bold text-white">صلوات اليوم</h1>
            <p className="text-sm text-white/75">
              {prayerTimes?.city ? "أوقات القاهرة" : "تابع صلواتك"}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                {today.prayers.map(p => (
                  <div
                    key={p.name}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      p.recorded ? "bg-white" : "bg-white/35"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-white/85">
                {today.recordedCount} من {today.totalCount}
              </span>
            </div>
          </div>

          {/* Circular progress — ring + counter */}
          <div className="relative flex-shrink-0 w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="38" fill="none" stroke="white" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - (circumference * progress) / 100 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center font-bold">
              <span className="text-2xl leading-none text-white">{today.recordedCount}</span>
              <span className="text-sm text-white/85">/{today.totalCount}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative mt-4 h-1.5 rounded-full overflow-hidden bg-white/20">
          <motion.div
            className="absolute top-0 right-0 h-full rounded-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Prayer Cards */}
      <div className="space-y-3">
        {today.prayers.map((prayer, index) => {
          const isCelebrating = celebrating === prayer.name;
          const Icon = PRAYER_ICONS[prayer.name] || Clock;

          return (
            <motion.div
              style={{margin:"10px"}}
              key={prayer.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
            >
              <div
                className={[
                  "relative overflow-hidden rounded-2xl border-2 transition-all duration-300",
                  prayer.recorded
                    ? "bg-emerald-50 border-emerald-600/40 dark:bg-emerald-950/30 dark:border-emerald-400/30"
                    : prayer.canRecord
                    ? "bg-card border-primary shadow-md"
                    : "bg-card border-border",
                ].join(" ")}
              >
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
                    <div
                      className={[
                        "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                        prayer.recorded
                          ? "bg-[hsl(155_40%_35%)] text-white"
                          : prayer.canRecord
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground",
                      ].join(" ")}
                    >
                      {prayer.recorded
                        ? <CheckCircle2 className="w-6 h-6" />
                        : <Icon className="w-5 h-5" />
                      }
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground leading-tight">{prayer.nameAr}</h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{prayer.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    {prayer.recorded ? (
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-sm font-semibold bg-emerald-700/15 dark:bg-emerald-400/15 px-3 py-1.5 rounded-full">
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
                        {isCelebrating
                          ? <Sparkles className="w-4 h-4 ml-1 animate-spin" />
                          : <Check className="w-4 h-4 ml-1" />
                        }
                        سجّل
                      </Button>
                    ) : prayer.passed ? (
                      <span className="text-red-600 dark:text-red-400 text-xs font-medium bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 px-3 py-1.5 rounded-full">
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