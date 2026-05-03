import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateStudent } from "@workspace/api-client-react"; // تأكد من وجود هذا الهوك في المكتبة
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Mail, Lock, Phone, User, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  // استخدام الـ Mutation لإنشاء طالب جديد
  const createStudent = useCreateStudent({
    mutation: {
      onSuccess: (data) => {
        // بعد التسجيل بنجاح، نحفظ بيانات الطالب في الـ LocalStorage (مؤقتاً كـ Session)
        localStorage.setItem("student", JSON.stringify(data));
        // التوجه لصفحة الكورسات أو الـ Checkout مباشرة لو كان جاي منها
        navigate("/"); 
      },
      onError: (error: any) => {
        alert(error?.message || "Registration failed. Email might be already in use.");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStudent.mutate({ data: formData });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">إنشاء حساب جديد</CardTitle>
          <CardDescription className="text-center">
            أدخل بياناتك للبدء في التعلم اليوم
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم بالكامل</Label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="name" 
                  placeholder="محمد أحمد" 
                  className="pr-10"
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  className="pr-10"
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="01xxxxxxxxx" 
                  className="pr-10"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  className="pr-10"
                  required 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full gap-2" 
              disabled={createStudent.isPending}
            >
              {createStudent.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              تسجيل الحساب
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              لديك حساب بالفعل؟{" "}
              <button type="button" onClick={() => navigate("/login")} className="text-primary hover:underline">
                تسجيل الدخول
              </button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}