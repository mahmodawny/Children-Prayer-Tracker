import { useState } from "react";
import { useGetPrayerHistory } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, CheckCircle2, Circle, Clock } from "lucide-react";
import { format, parseISO, subDays } from "date-fns";
import { ar } from "date-fns/locale";

const PRAYERS = [
  { id: 'fajr', name: 'الفجر' },
  { id: 'dhuhr', name: 'الظهر' },
  { id: 'asr', name: 'العصر' },
  { id: 'maghrib', name: 'المغرب' },
  { id: 'isha', name: 'العشاء' }
];

export default function History() {
  const { data: history, isLoading } = useGetPrayerHistory({ days: 14 });

  if (isLoading) {
    return <div className="space-y-4">
      {[1,2,3,4,5].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl"></div>)}
    </div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-full text-primary">
          <CalendarDays className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">سجل الصلوات</h1>
          <p className="text-muted-foreground">متابعة صلواتك في الأيام الماضية</p>
        </div>
      </div>

      <div className="grid gap-4">
        {history?.map((day) => {
          const date = parseISO(day.date);
          const formattedDate = format(date, "EEEE، d MMMM", { locale: ar });
          const count = day.prayers.length;
          const isComplete = count === 5;
          const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

          return (
            <Card key={day.date} className={`overflow-hidden transition-all ${isComplete ? 'border-primary/50 shadow-sm' : ''} ${isToday ? 'ring-2 ring-primary/20' : ''}`}>
              <div className="flex flex-col md:flex-row">
                <div className={`p-4 md:w-48 flex md:flex-col items-center md:items-start justify-between md:justify-center border-b md:border-b-0 md:border-l ${isComplete ? 'bg-primary/5' : 'bg-muted/30'}`}>
                  <div>
                    <h3 className="font-bold text-lg">{isToday ? "اليوم" : format(date, "EEEE", { locale: ar })}</h3>
                    <p className="text-sm text-muted-foreground">{format(date, "d MMMM yyyy", { locale: ar })}</p>
                  </div>
                  <div className="mt-2 text-center md:text-right">
                    <span className={`text-xl font-black ${isComplete ? 'text-primary' : 'text-foreground'}`}>
                      {count}/5
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 p-4 md:p-6 grid grid-cols-5 gap-2">
                  {PRAYERS.map((prayer) => {
                    const isRecorded = day.prayers.includes(prayer.id);
                    return (
                      <div key={prayer.id} className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-colors ${
                          isRecorded 
                            ? 'bg-primary text-primary-foreground shadow-sm' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {isRecorded ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-5 h-5" />}
                        </div>
                        <span className={`text-xs md:text-sm font-medium ${isRecorded ? 'text-primary' : 'text-muted-foreground'}`}>
                          {prayer.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          );
        })}
        
        {(!history || history.length === 0) && (
          <Card className="p-12 text-center border-dashed">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold">لا يوجد سجل بعد</h3>
            <p className="text-muted-foreground">سجل صلواتك اليوم لتبدأ في بناء سجلك الحافل!</p>
          </Card>
        )}
      </div>
    </div>
  );
}