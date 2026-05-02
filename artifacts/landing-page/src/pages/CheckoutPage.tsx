import { useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { useGetCourse, getGetCourseQueryKey } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import {
  ShieldCheck, CreditCard, Smartphone, Building2,
  ChevronLeft, CheckCircle2, Lock, Users, BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";

const PAYMENT_METHODS = [
  { id: "fawry", label: "Fawry", labelAr: "فوري", color: "bg-orange-500" },
  { id: "vodafone_cash", label: "Vodafone Cash", labelAr: "فودافون كاش", color: "bg-red-600" },
  { id: "card", label: "Credit / Debit Card", labelAr: "بطاقة ائتمانية", color: "bg-blue-600" },
  { id: "bank", label: "Bank Transfer", labelAr: "تحويل بنكي", color: "bg-emerald-600" },
];

export default function CheckoutPage() {
  const { t, lang } = useI18n();
  const [location, navigate] = useLocation();
  const courseId = new URLSearchParams(location.split("?")[1] || "").get("courseId");
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [step, setStep] = useState<"details" | "confirm" | "success">("details");

  const { data: course } = useGetCourse(parseInt(courseId || "0"), {
    query: {
      queryKey: getGetCourseQueryKey(parseInt(courseId || "0")),
      enabled: !!courseId,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("confirm");
  };

  const handleConfirm = () => {
    setStep("success");
  };

  const courseTitle = lang === "en"
    ? (course?.title ?? "")
    : (course?.titleAr || course?.title || "");

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
              transition={{ duration: 0.5 }}
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h1 className="text-3xl font-bold mb-3">{t("checkout.success.title")}</h1>
              <p className="text-muted-foreground mb-2">{t("checkout.success.subtitle")}</p>
              <p className="text-sm text-muted-foreground mb-8">{t("checkout.success.desc")}</p>
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
                          <Input required placeholder={lang === "ar" ? "محمد أحمد" : "John Doe"} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>{t("checkout.phone")}</Label>
                          <Input required type="tel" placeholder="+20 100 000 0000" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t("checkout.email")}</Label>
                        <Input required type="email" placeholder="you@example.com" />
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
                              {method.id === "card" && <CreditCard className="w-4 h-4" />}
                              {method.id === "fawry" && <span className="text-[10px] font-black">F</span>}
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

                      {selectedMethod === "card" && (
                        <motion.div
                          className="space-y-3 pt-2"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                        >
                          <div className="space-y-1.5">
                            <Label>{t("checkout.cardNumber")}</Label>
                            <Input placeholder="4242 4242 4242 4242" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label>{t("checkout.expiry")}</Label>
                              <Input placeholder="MM/YY" />
                            </div>
                            <div className="space-y-1.5">
                              <Label>CVV</Label>
                              <Input placeholder="123" type="password" maxLength={4} />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {selectedMethod === "fawry" && (
                        <motion.div
                          className="rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 p-4 text-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <p className="font-medium text-orange-800 dark:text-orange-300 mb-1">
                            {t("checkout.fawry.title")}
                          </p>
                          <p className="text-orange-700 dark:text-orange-400">
                            {t("checkout.fawry.desc")}
                          </p>
                        </motion.div>
                      )}

                      {selectedMethod === "vodafone_cash" && (
                        <motion.div
                          className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-4 text-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <p className="font-medium text-red-800 dark:text-red-300 mb-1">
                            {t("checkout.vodafone.title")}
                          </p>
                          <p className="text-red-700 dark:text-red-400">
                            {t("checkout.vodafone.desc")}
                          </p>
                        </motion.div>
                      )}

                      {selectedMethod === "bank" && (
                        <motion.div
                          className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 p-4 text-sm space-y-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <p className="font-medium text-emerald-800 dark:text-emerald-300">
                            {t("checkout.bank.title")}
                          </p>
                          <p className="text-emerald-700 dark:text-emerald-400">
                            {t("checkout.bank.account")}: <span className="font-mono font-bold">1234-5678-9012</span>
                          </p>
                          <p className="text-emerald-700 dark:text-emerald-400">
                            {t("checkout.bank.name")}: EduAcademy Pro
                          </p>
                        </motion.div>
                      )}
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

                    <Button size="lg" className="w-full gap-2" onClick={handleConfirm}>
                      <CheckCircle2 className="w-4 h-4" />
                      {t("checkout.pay")} ${course?.price}
                    </Button>

                    <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {t("trust.guarantee")}
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="lg:col-span-2">
                <div className="sticky top-28 space-y-4">
                  {course && (
                    <motion.div
                      className="bg-card border border-border rounded-2xl overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
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
                        <div className="pt-3 border-t border-border flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{t("checkout.total")}</span>
                          <span className="text-2xl font-bold text-primary">${course.price}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>{t("trust.title")}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{t("trust.guarantee")}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {["VISA", "MC", "Fawry", "VF"].map((badge) => (
                        <span key={badge} className="text-[10px] font-bold px-2 py-1 rounded bg-muted text-muted-foreground border border-border">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
