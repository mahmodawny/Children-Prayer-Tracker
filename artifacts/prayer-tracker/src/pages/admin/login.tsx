import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const loginMutation = useLogin();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [errorMsg, setErrorMsg] = useState("");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setErrorMsg("");
    loginMutation.mutate(
      { data },
      {
        onSuccess: (res) => {
          if (res.user.role !== "admin") {
            setErrorMsg("غير مصرح لك بالدخول إلى لوحة الإدارة");
            return;
          }
          localStorage.setItem("prayer_token", res.token);
          queryClient.invalidateQueries();
          setLocation("/admin");
        },
        onError: (err: any) => {
          setErrorMsg(err.message || "اسم المستخدم أو كلمة المرور غير صحيحة");
        },
      }
    );
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md border-primary/20 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Shield className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">إدارة رفيق الصلاة</CardTitle>
          <CardDescription>
            تسجيل الدخول للمشرفين
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{display:"flex",margin:'10px'}}>اسم المستخدم</FormLabel>
                    <FormControl>
                      <Input placeholder="admin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {errorMsg && (
                <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md text-center">
                  {errorMsg}
                </div>
              )}
              <Button style={{marginTop:"10px",cursor:"pointer"}} type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "جاري تسجيل الدخول..." : "دخول"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            العودة إلى تسجيل دخول الأطفال
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}