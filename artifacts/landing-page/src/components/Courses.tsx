import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { useListCourses, getListCoursesQueryKey } from "@workspace/api-client-react";
import { usePixelTracking } from "@/hooks/use-pixel-tracking";
import { Button } from "@/components/ui/button";
import { Users, PlayCircle, Radio, ShoppingCart, Inbox } from "lucide-react"; // أضفنا Inbox
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function Courses() {
  const { t, lang } = useI18n();
  const { trackPurchase } = usePixelTracking();
  const [, navigate] = useLocation();

  const { data: courses, isLoading } = useListCourses(
    { status: "active" },
    { query: { queryKey: getListCoursesQueryKey({ status: "active" }) } }
  );

  const handleBuyNow = (courseId: number, price: number) => {
    trackPurchase(price);
    navigate(`/checkout?courseId=${courseId}`);
  };

  const handleViewCourse = (courseId: number) => {
    navigate(`/course/${courseId}`);
  };

  // تحويل البيانات لمصفوفة فارغة في حال كانت null أو undefined لضمان استقرار الكود
  const safeCourses = Array.isArray(courses) ? courses : [];

  return (
    <section id="courses" className="py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {t("courses.title")}
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t("courses.subtitle")}
          </motion.p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-border overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-6">
                  <Skeleton className="h-6 w-2/3 mb-4" />
                  <Skeleton className="h-4 w-1/3 mb-6" />
                  <div className="flex justify-between items-center mt-6">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : safeCourses.length === 0 ? (
          /* حالة عدم وجود بيانات: بدلاً من ترك الصفحة فاضية، نعرض رسالة احترافية */
          <motion.div 
            className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Inbox className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-xl font-medium text-muted-foreground">
              {t("courses.noCourses") || "قريباً سيتم إضافة دورات جديدة للأكاديمية"}
            </h3>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {safeCourses.map((course, index) => {
              const isLive = course.courseType === "live";
              return (
                <motion.div
                  key={course.id}
                  className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => handleViewCourse(course.id)}
                >
                  <div className="relative h-48 bg-muted overflow-hidden">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={lang === "en" ? course.title : (course.titleAr || course.title)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/40">
                        {isLive ? <Radio className="w-16 h-16" /> : <PlayCircle className="w-16 h-16" />}
                      </div>
                    )}
                    <div className="absolute top-4 ltr:right-4 rtl:left-4 flex gap-2">
                      <span
                        className={cn(
                          "text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm",
                          isLive
                            ? "bg-red-500/90 text-white"
                            : "bg-background/90 text-foreground"
                        )}
                      >
                        {isLive ? t("courses.live") : t("courses.recorded")}
                      </span>
                    </div>
                    {course.moduleCount > 0 && (
                      <div className="absolute bottom-4 ltr:left-4 rtl:right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                        {course.moduleCount} {t("courses.modules")}
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">
                      {lang === "en" ? course.title : (course.titleAr || course.title)}
                    </h3>

                    <div className="flex items-center text-muted-foreground text-sm mb-4">
                      <Users className="w-4 h-4 ltr:mr-2 rtl:ml-2 shrink-0" />
                      <span>
                        {course.studentCount} {t("courses.students")}
                      </span>
                    </div>

                    <div
                      className="flex items-center justify-between mt-auto pt-4 border-t border-border"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-2xl font-bold text-primary">${course.price}</div>
                      <Button
                        onClick={() => handleBuyNow(course.id, course.price)}
                        className="gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {t("courses.buy")}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}