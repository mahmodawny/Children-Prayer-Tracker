import { useRoute } from "wouter";
import { useGetChild, useGetChildStats, useUpdateChild, getGetChildQueryKey, getListChildrenQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Activity, Target, Trophy, MapPin, Calendar, CheckCircle2, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { useEffect, useRef } from "react";

const updateSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  password: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional()
});

export default function AdminChildDetail() {
  const [, params] = useRoute("/admin/children/:id");
  const id = parseInt(params?.id || "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: child, isLoading: childLoading } = useGetChild(id, { query: { enabled: !!id, queryKey: getGetChildQueryKey(id) } });
  const { data: stats, isLoading: statsLoading } = useGetChildStats(id, { query: { enabled: !!id, queryKey: ["getChildStats", id] as const } });
  const updateMutation = useUpdateChild();

  const form = useForm<z.infer<typeof updateSchema>>({
    resolver: zodResolver(updateSchema),
    defaultValues: { name: "", username: "", password: "", city: "", country: "" }
  });

  const initializedForId = useRef<number | null>(null);

  useEffect(() => {
    if (child && initializedForId.current !== id) {
      initializedForId.current = id;
      form.reset({
        name: child.name,
        username: child.username,
        password: "",
        city: child.city || "",
        country: child.country || ""
      });
    }
  }, [child, id, form]);

  const onSubmit = (data: z.infer<typeof updateSchema>) => {
    const updateData: any = { ...data };
    if (!updateData.password) delete updateData.password;
    if (!updateData.city) delete updateData.city;
    if (!updateData.country) delete updateData.country;

    updateMutation.mutate({ id, data: updateData }, {
      onSuccess: () => {
        toast({ title: "تم بنجاح", description: "تم تحديث بيانات الطفل" });
        queryClient.invalidateQueries({ queryKey: getGetChildQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey() });
        form.setValue("password", "");
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "خطأ", description: err.message || "فشل التحديث" });
      }
    });
  };

  if (childLoading || statsLoading) {
    return <div className="space-y-6 animate-pulse">
      <div className="h-40 bg-muted rounded-xl"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-96 bg-muted rounded-xl"></div>
        <div className="h-96 bg-muted rounded-xl"></div>
      </div>
    </div>;
  }

  if (!child || !stats) return <div className="text-center py-12">لم يتم العثور على الطفل</div>;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{child.name}</h1>
            <p className="text-muted-foreground" dir="ltr">@{child.username}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-center px-4 border-l">
            <div className="text-sm text-muted-foreground">النقاط</div>
            <div className="text-2xl font-bold text-secondary">{child.points}</div>
          </div>
          <div className="text-center px-4 border-l">
            <div className="text-sm text-muted-foreground">الالتزام</div>
            <div className="text-2xl font-bold text-primary">{child.compliance}%</div>
          </div>
          <div className="text-center px-4">
            <div className="text-sm text-muted-foreground">الصلوات</div>
            <div className="text-2xl font-bold">{child.totalPrayers}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">تعديل البيانات</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>الاسم</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="username" render={({ field }) => (
                    <FormItem><FormLabel>اسم المستخدم</FormLabel><FormControl><Input dir="ltr" className="text-left" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>تغيير الرمز السري</FormLabel><FormControl><Input type="password" placeholder="يترك فارغاً إذا لم ترد تغييره" dir="ltr" className="text-left" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem><FormLabel>المدينة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="submit" className="w-full mt-2" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">معلومات الحساب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">تاريخ التسجيل:</span>
                <span className="font-medium" dir="ltr">{format(parseISO(child.createdAt), "yyyy-MM-dd")}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">الموقع:</span>
                <span className="font-medium">{child.city || "غير محدد"} {child.country ? `, ${child.country}` : ''}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-primary/5">
              <CardContent className="p-4 text-center">
                <div className="text-sm text-muted-foreground mb-1">سلسلة الأيام</div>
                <div className="text-2xl font-bold text-primary">{stats.currentStreak} 🔥</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-sm text-muted-foreground mb-1">صلوات اليوم</div>
                <div className="text-2xl font-bold">{stats.todayCount}/5</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-sm text-muted-foreground mb-1">صلوات الأسبوع</div>
                <div className="text-2xl font-bold">{stats.weekCount}/35</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-sm text-muted-foreground mb-1">صلوات الشهر</div>
                <div className="text-2xl font-bold">{stats.monthCount}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>نسبة الالتزام</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>اليوم</span>
                  <span>{stats.dailyCompliance}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all rounded-full" style={{ width: `${stats.dailyCompliance}%` }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>هذا الأسبوع</span>
                  <span>{stats.weeklyCompliance}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all rounded-full" style={{ width: `${stats.weeklyCompliance}%` }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>هذا الشهر</span>
                  <span>{stats.monthlyCompliance}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all rounded-full" style={{ width: `${stats.monthlyCompliance}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}