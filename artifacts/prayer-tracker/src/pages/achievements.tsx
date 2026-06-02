import { useGetMyAchievements } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Medal, Star, Shield, Zap, Lock } from "lucide-react";

export default function Achievements() {
  const { data: achievements, isLoading } = useGetMyAchievements();

  // We could fetch ALL possible achievements from an endpoint, but for now we'll just show the earned ones
  // and some placeholders for what's possible
  
  if (isLoading) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-xl"></div>)}
    </div>;
  }

  const hasAchievements = achievements && achievements.length > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col items-center text-center space-y-4 mb-8">
        <div className="p-4 bg-secondary/20 rounded-full text-secondary">
          <Medal className="w-12 h-12" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">لوحة الإنجازات</h1>
          <p className="text-muted-foreground mt-1">اجمع الأوسمة وحافظ على صلاتك</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {hasAchievements && achievements.map((ach) => (
          <Card key={ach.id} className="overflow-hidden border-primary/20 shadow-sm bg-gradient-to-br from-card to-primary/5 hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl relative">
                {ach.icon || "🏅"}
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 absolute -top-1 -right-1" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">{ach.titleAr}</h3>
                <p className="text-sm text-muted-foreground mt-1">{ach.descriptionAr}</p>
              </div>
              <div className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                تم الحصول عليه
              </div>
            </CardContent>
          </Card>
        ))}

        {!hasAchievements && (
          <div className="col-span-full text-center py-12">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted mb-4">
              <Shield className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold">لم تحصل على أي وسام بعد</h3>
            <p className="text-muted-foreground max-w-md mx-auto mt-2">
              حافظ على صلواتك، وحقق أياماً متتالية، وصلِّ الصلوات في وقتها لتحصل على أوسمة رائعة!
            </p>
          </div>
        )}
        
        {/* Placeholders for unearned achievements */}
        <Card className="overflow-hidden border-dashed opacity-60 grayscale bg-muted/30">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-4xl relative">
              👑
              <Lock className="w-5 h-5 text-muted-foreground absolute -bottom-1 right-0" />
            </div>
            <div>
              <h3 className="font-bold text-lg">بطل الأسبوع</h3>
              <p className="text-sm mt-1">حافظ على صلواتك الخمس لمدة 7 أيام متتالية</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-dashed opacity-60 grayscale bg-muted/30">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-4xl relative">
              🌅
              <Lock className="w-5 h-5 text-muted-foreground absolute -bottom-1 right-0" />
            </div>
            <div>
              <h3 className="font-bold text-lg">فارس الفجر</h3>
              <p className="text-sm mt-1">صل الفجر في وقته لـ 3 أيام متتالية</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}