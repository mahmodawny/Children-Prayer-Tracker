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
import { Moon, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
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
          localStorage.setItem("prayer_token", res.token);
          queryClient.invalidateQueries();
          if (res.user.role === "admin") {
             setLocation("/admin");
          } else {
             setLocation("/");
          }
        },
        onError: (err: any) => {
          setErrorMsg(err.message || "اسم المستخدم أو كلمة المرور غير صحيحة");
        },
      }
    );
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 pattern-clouds opacity-50 pointer-events-none -z-10" />
      <Card className="w-full max-w-md border-primary/20 shadow-xl z-10 bg-card/80 backdrop-blur">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-primary relative">
              <Moon className="h-10 w-10 fill-primary/20" />
              <Star className="h-4 w-4 absolute top-2 right-2 fill-secondary text-secondary animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">رفيق الصلاة</CardTitle>
          <CardDescription className="text-base">
            أهلاً بك يا بطل! سجل دخولك لمتابعة صلواتك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">اسم المستخدم</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل اسمك هنا..." className="h-12 text-lg" {...field} />
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
                    <FormLabel className="text-base">الرمز السري</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="***" className="h-12 text-lg text-left" dir="ltr" {...field} />
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
              <Button type="submit" className="w-full h-12 text-lg rounded-xl font-bold mt-2" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "جاري الدخول..." : "بسم الله، لنبدأ"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center pt-2 pb-6">
          <Link href="/admin/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            دخول المشرفين
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}