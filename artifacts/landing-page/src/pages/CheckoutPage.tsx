import { useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { useGetCourse, getGetCourseQueryKey, useCreatePayment } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef } from "react";
import {
  ShieldCheck, CreditCard, Smartphone, Building2,
  ChevronLeft, CheckCircle2, Lock, Users, BookOpen, Upload, X, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";

const PAYMENT_METHODS = [
  { id: "vodafone_cash", label: "Vodafone Cash", labelAr: "فودافون كاش", color: "bg-red-600" },
  { id: "bank", label: "Bank Transfer", labelAr: "تحويل بنكي", color: "bg-emerald-600" },
];

export default function CheckoutPage() {
  const { t, lang } = useI18n();
  const [location, navigate] = useLocation();
  const courseId = new URLSearchParams(location.split("?")[1] || "").get("courseId");

  // --- States لإدارة البيانات ---
  const [studentInfo, setStudentInfo] = useState({ name: "", phone: "", email: "" });
  const [selectedMethod, setSelectedMethod] = useState("vodafone_cash");
  const [step, setStep] = useState<"details" | "confirm" | "success">("details");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- جلب بيانات الكورس ---
  const { data: course } = useGetCourse(parseInt(courseId || "0"), {
    query: {
      queryKey: getGetCourseQueryKey(parseInt(courseId || "0")),
      enabled: !!courseId,
    },
  });

  // --- Hook إرسال الدفع للأدمن ---
  const createPayment = useCreatePayment({
    mutation: {
      onSuccess: () => {
        setStep("success");
      },
      onError: () => {
        alert(lang === "ar" ? "حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً." : "Something went wrong, please try again.");
      }
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setReceiptFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile) {
        alert(lang === "ar" ? "يرجى رفع صورة الإيصال أولاً" : "Please upload the receipt first");
        return;
    }
    setStep("confirm");
  };

  // const handleConfirm = async () => {
  //   // إرسال البيانات للأدمن
  //   createPayment.mutate({
  //     data: {
  //       studentName: studentInfo.name,
  //       studentEmail: studentInfo.email,
  //       studentPhone: studentInfo.phone,
  //       courseId: parseInt(courseId || "0"),
  //       courseName: courseTitle,
  //       amount: course?.price || 0,
  //       method: selectedMethod,
  //       status: "pending", // الحالة اللي هيشوفها الأدمن عشان يوافق
  //       // ملاحظة: هنا نرسل اسم الملف كـ String، في بيئة الإنتاج ستحتاج لرفع الملف أولاً لـ S3 أو Cloudinary
  //       receiptUrl: previewUrl || "", 
  //       createdAt: new Date().toISOString(),
  //     }
  //   });
  // };

  const handleConfirm = async () => {
  createPayment.mutate({
    data: {
      // 1. لازم نبعت studentId (رقم الطالب المسجل حالياً)
      // لو عندك user session، خد الـ id منه
      studentId: currentUser?.id, 

      // 2. رقم الكورس
      courseId: parseInt(courseId || "0"),

      // 3. المبلغ
      amount: course?.price || 0, // الـ Schema بياخد numeric (كـ string في الـ JS)

      // 4. الحالة والطريقة
      status: "pending", 
      method: "bank_transfer" || "card" || "cash" || "online", // تأكد إن القيم في الـ PAYMENT_METHODS هي نفسها الـ Enum في الداتابيز

      // 5. رابط الإيصال
      receiptUrl: previewUrl || "", 

      // 6. وقت الدفع
      paidAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
  });
};
  const courseTitle = lang === "en"
    ? (course?.title ?? "")
    : (course?.titleAr || course?.title || "");

  const isManualPayment = ["vodafone_cash", "bank"].includes(selectedMethod);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">

          {step === "success" ? (
            <motion.div
              className="text-center py-20 max-w-lg mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h1 className="text-3xl font-bold mb-3">{t("checkout.success.title")}</h1>
              <p className="text-muted-foreground mb-2">{t("checkout.success.subtitle")}</p>
              <p className="text-sm text-muted-foreground mb-8">
                {lang === "ar" ? "جاري مراجعة طلبك، سيتم تفعيل الكورس فور التأكد من التحويل." : "Your request is being reviewed. Course will be activated once payment is verified."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate(`/course/${courseId}`)}>
                  {t("checkout.success.go")}
                </Button>
                <Button variant="outline" onClick={() => navigate("/")}>
                  {t("checkout.success.back")}
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => step === "confirm" ? setStep("details") : navigate("/")}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronLeft className={cn("w-5 h-5", lang === "ar" && "rotate-180")} />
                  </button>
                  <h1 className="text-2xl font-bold">
                    {step === "confirm" ? t("checkout.confirm.title") : t("checkout.title")}
                  </h1>
                </div>

                {step === "details" && (
                  <motion.form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                      <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                        {t("checkout.personal")}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label>{t("checkout.name")}</Label>
                          <Input 
                            required 
                            value={studentInfo.name}
                            onChange={(e) => setStudentInfo({...studentInfo, name: e.target.value})}
                            placeholder={lang === "ar" ? "محمد أحمد" : "John Doe"} 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>{t("checkout.phone")}</Label>
                          <Input 
                            required 
                            type="tel" 
                            value={studentInfo.phone}
                            onChange={(e) => setStudentInfo({...studentInfo, phone: e.target.value})}
                            placeholder="+20 100 000 0000" 
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t("checkout.email")}</Label>
                        <Input 
                          required 
                          type="email" 
                          value={studentInfo.email}
                          onChange={(e) => setStudentInfo({...studentInfo, email: e.target.value})}
                          placeholder="you@example.com" 
                        />
                      </div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                      <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                        {t("checkout.payment")}
                      </h2>
                      <div className="grid grid-cols-2 gap-3">
                        {PAYMENT_METHODS.map((method) => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setSelectedMethod(method.id)}
                            className={cn(
                              "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium",
                              selectedMethod === method.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-muted-foreground/30"
                            )}
                          >
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0", method.color)}>
                              {method.id === "vodafone_cash" && <Smartphone className="w-4 h-4" />}
                              {method.id === "bank" && <Building2 className="w-4 h-4" />}
                            </div>
                            <span className="text-center leading-tight">
                              {lang === "ar" ? method.labelAr : method.label}
                            </span>
                            {selectedMethod === method.id && (
                              <div className="absolute top-2 ltr:right-2 rtl:left-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                <CheckCircle2 className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={selectedMethod}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4 pt-2"
                        >
                          <div className={cn(
                            "rounded-xl p-4 text-sm border",
                            selectedMethod === "vodafone_cash" && "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900 dark:text-red-300",
                            selectedMethod === "bank" && "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-300"
                          )}>
                            <p className="font-bold mb-1">
                              {selectedMethod === "vodafone_cash" ? t("checkout.vodafone.title") : t("checkout.bank.title")}
                            </p>
                            <p className="opacity-90">
                              {selectedMethod === "vodafone_cash" ? t("checkout.vodafone.desc") : (
                                <>
                                  {t("checkout.bank.account")}: 1234-5678-9012 <br/>
                                  {t("checkout.bank.name")}: EduAcademy Pro
                                </>
                              )}
                            </p>
                          </div>

                          <div className="space-y-3 p-4 border-2 border-dashed border-muted rounded-2xl bg-muted/20">
                            <Label className="flex items-center gap-2">
                              <Upload className="w-4 h-4" />
                              {lang === "ar" ? "ارفع صورة إيصال التحويل" : "Upload transaction receipt"}
                            </Label>
                            
                            {!previewUrl ? (
                              <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="h-32 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/40 transition-colors rounded-xl border border-border bg-background"
                              >
                                <Upload className="w-8 h-8 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground italic">
                                  {lang === "ar" ? "اضغط لاختيار صورة" : "Click to select an image"}
                                </span>
                                <input 
                                  ref={fileInputRef}
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={handleFileChange}
                                  required
                                />
                              </div>
                            ) : (
                              <div className="relative group">
                                <img src={previewUrl} alt="Receipt" className="w-full h-40 object-contain rounded-xl border bg-black" />
                                <button 
                                  type="button"
                                  onClick={removeFile}
                                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <Button type="submit" size="lg" className="w-full gap-2">
                      <Lock className="w-4 h-4" />
                      {t("checkout.proceed")}
                    </Button>
                  </motion.form>
                )}

                {step === "confirm" && (
                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                      <h2 className="font-semibold">{t("checkout.summary")}</h2>
                      <div className="flex items-start gap-4 pb-4 border-b border-border">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{courseTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            {course?.courseType === "live" ? t("courses.live") : t("courses.recorded")}
                          </p>
                        </div>
                        <p className="ltr:ml-auto rtl:mr-auto font-bold text-xl text-primary">
                          ${course?.price}
                        </p>
                      </div>

                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{t("checkout.name")}</span>
                        <span className="font-medium text-foreground">{studentInfo.name}</span>
                      </div>

                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{t("checkout.method")}</span>
                        <span className="font-medium text-foreground capitalize">
                          {PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.[lang === "ar" ? "labelAr" : "label"]}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>{t("checkout.total")}</span>
                        <span className="text-primary">${course?.price}</span>
                      </div>
                    </div>

                    <Button 
                      size="lg" 
                      className="w-full gap-2" 
                      onClick={handleConfirm}
                      disabled={createPayment.isPending}
                    >
                      {createPayment.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      {t("checkout.pay")} ${course?.price}
                    </Button>
                  </motion.div>
                )}
              </div>

              <div className="lg:col-span-2">
                <div className="sticky top-28 space-y-4">
                  {course && (
                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                      <div className="h-36 bg-primary/10 flex items-center justify-center">
                        {course.thumbnailUrl ? (
                          <img src={course.thumbnailUrl} alt={courseTitle} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="w-12 h-12 text-primary/40" />
                        )}
                      </div>
                      <div className="p-5 space-y-3">
                        <h3 className="font-bold text-lg leading-tight">{courseTitle}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{course.studentCount} {t("courses.students")}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}