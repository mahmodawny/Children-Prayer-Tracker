import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListChildren, useCreateChild, useDeleteChild, useUpdateChild, getListChildrenQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Plus, Trash2, ChevronLeft, ArrowUpDown, KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ListChildrenSortBy } from "@workspace/api-client-react";

const createSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  password: z.string().min(4, "كلمة المرور يجب أن تكون 4 أحرف على الأقل"),
  city: z.string().optional(),
  country: z.string().optional()
});

interface ResetPasswordDialogProps {
  childId: number;
  childName: string;
  open: boolean;
  onClose: () => void;
}

function ResetPasswordDialog({ childId, childName, open, onClose }: ResetPasswordDialogProps) {
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const updateMutation = useUpdateChild();
  const queryClient = useQueryClient();

  const handleClose = () => {
    setNewPw("");
    setConfirmPw("");
    setError("");
    setSuccess(false);
    setShowPw(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPw.length < 4) {
      setError("كلمة المرور يجب أن تكون 4 أحرف على الأقل");
      return;
    }
    if (newPw !== confirmPw) {
      setError("كلمة المروران غير متطابقتان");
      return;
    }

    updateMutation.mutate(
      { id: childId, data: { password: newPw } as any },
      {
        onSuccess: () => {
          setSuccess(true);
          queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey() });
          setTimeout(() => handleClose(), 1800);
        },
        onError: () => {
          setError("حدث خطأ أثناء تغيير كلمة المرور");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" />
            إعادة تعيين الرمز السري
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground -mt-2">
          تغيير كلمة المرور الخاصة بـ <strong className="text-foreground">{childName}</strong>
        </p>

        {success ? (
          <div className="flex flex-col items-center gap-2 py-6 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
            <p className="font-semibold">تم تغيير كلمة المرور بنجاح</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-1">
            <div className="space-y-1.5">
              <Label>كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  className="pl-10"
                  dir="ltr"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>تأكيد كلمة المرور</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                dir="ltr"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                type="submit"
                className="flex-1 rounded-full"
                disabled={updateMutation.isPending || !newPw || !confirmPw}
              >
                {updateMutation.isPending ? "جاري الحفظ..." : "حفظ"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-full"
                onClick={handleClose}
              >
                إلغاء
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AdminChildren() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<ListChildrenSortBy>("compliance");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<{ id: number; name: string } | null>(null);
  const [, setLocation] = useLocation();

  const { data: children, isLoading } = useListChildren({ search: search || undefined, sortBy });
  const createMutation = useCreateChild();
  const deleteMutation = useDeleteChild();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "", username: "", password: "", city: "", country: "" }
  });

  const onSubmit = (data: z.infer<typeof createSchema>) => {
    createMutation.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "تم بنجاح", description: "تمت إضافة الطفل بنجاح" });
        setIsDialogOpen(false);
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey() });
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "خطأ", description: err.message || "حدث خطأ أثناء الإضافة" });
      }
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`هل أنت متأكد من حذف ${name}؟ سيتم حذف جميع بياناته وسجلاته.`)) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "تم بنجاح", description: "تم حذف الطفل بنجاح" });
          queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey() });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">إدارة الأطفال</h1>
          <p className="text-muted-foreground mt-1">عرض وإدارة حسابات الأطفال</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة طفل جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة طفل جديد</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>الاسم بالكامل</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="username" render={({ field }) => (
                  <FormItem><FormLabel>اسم المستخدم (للدخول)</FormLabel><FormControl><Input dir="ltr" className="text-left" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem><FormLabel>الرمز السري</FormLabel><FormControl><Input type="password" dir="ltr" className="text-left" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem><FormLabel>المدينة (اختياري)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="country" render={({ field }) => (
                    <FormItem><FormLabel>البلد (اختياري)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "جاري الإضافة..." : "حفظ والتسجيل"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <div className="relative max-w-sm">
              <Search className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو اسم المستخدم..."
                className="pr-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSortBy("name")}>
                    <div className="flex items-center gap-1">الاسم <ArrowUpDown className="w-3 h-3" /></div>
                  </TableHead>
                  <TableHead>اسم المستخدم</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors text-center" onClick={() => setSortBy("prayers")}>
                    <div className="flex items-center justify-center gap-1">الصلوات <ArrowUpDown className="w-3 h-3" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors text-center" onClick={() => setSortBy("compliance")}>
                    <div className="flex items-center justify-center gap-1">الالتزام <ArrowUpDown className="w-3 h-3" /></div>
                  </TableHead>
                  <TableHead className="text-center">النقاط</TableHead>
                  <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7} className="h-16">
                        <div className="h-6 bg-muted animate-pulse rounded w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : children && children.length > 0 ? (
                  children.map((child, idx) => (
                    <TableRow
                      key={child.id}
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => setLocation(`/admin/children/${child.id}`)}
                    >
                      <TableCell className="font-medium text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="font-bold">{child.name}</TableCell>
                      <TableCell dir="ltr" className="text-right text-muted-foreground">@{child.username}</TableCell>
                      <TableCell className="text-center">{child.totalPrayers}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold ${child.compliance >= 80 ? 'bg-primary/20 text-primary' : child.compliance >= 50 ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-500' : 'bg-destructive/20 text-destructive'}`}>
                          {child.compliance}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-bold text-secondary">{child.points}</TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                            title="إعادة تعيين الرمز السري"
                            onClick={() => setResetTarget({ id: child.id, name: child.name })}
                          >
                            <KeyRound className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setLocation(`/admin/children/${child.id}`)}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(child.id, child.name)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      لا يوجد أطفال يطابقون البحث
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {resetTarget && (
        <ResetPasswordDialog
          childId={resetTarget.id}
          childName={resetTarget.name}
          open={!!resetTarget}
          onClose={() => setResetTarget(null)}
        />
      )}
    </div>
  );
}
