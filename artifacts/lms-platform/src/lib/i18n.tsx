import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Language = "en" | "ar";
type Translations = Record<string, Record<string, string>>;

const translations: Translations = {
  en: {
    dashboard: "Dashboard",
    courses: "Courses",
    students: "Students",
    payments: "Payments",
    settings: "Settings",
    totalStudents: "Total Students",
    activeStudents: "Active Students",
    totalCourses: "Total Courses",
    revenue: "Total Revenue",
    pendingRevenue: "Pending Revenue",
    thisMonth: "This Month",
    recentActivity: "Recent Activity",
    completionRate: "Completion Rate",
    enrollmentsThisMonth: "New Enrollments",
    createCourse: "Create Course",
    addStudent: "Add Student",
    addPayment: "Record Payment",
    status: "Status",
    price: "Price",
    add: "Add",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    loading: "Loading...",
    name: "Name",
    email: "Email",
    phone: "Phone",
    progress: "Progress",
    enrolledAt: "Enrolled",
    paymentStatus: "Payment",
    active: "Active",
    inactive: "Inactive",
    pending: "Pending",
    paid: "Paid",
    overdue: "Overdue",
    draft: "Draft",
    archived: "Archived",
    completed: "Completed",
    failed: "Failed",
    refunded: "Refunded",
    amount: "Amount",
    method: "Method",
    date: "Date",
    course: "Course",
    description: "Description",
    modules: "Modules",
    lessons: "Lessons",
    addModule: "Add Module",
    addLesson: "Add Lesson",
    video: "Video",
    pdf: "PDF",
    text: "Text",
    duration: "Duration (min)",
    videoUrl: "Video URL",
    pdfUrl: "PDF URL",
    content: "Content",
    bank_transfer: "Bank Transfer",
    cash: "Cash",
    card: "Card",
    online: "Online",
    notes: "Notes",
    paidAt: "Paid At",
    academyName: "Academy Name",
    academyNameAr: "Academy Name (Arabic)",
    logoUrl: "Logo URL",
    metaPixelId: "Meta Pixel ID",
    googleTagId: "Google Tag ID",
    tiktokPixelId: "TikTok Pixel ID",
    defaultLanguage: "Default Language",
    currency: "Currency",
    marketingPixels: "Marketing Pixels",
    pixelsDesc: "Connect your advertising pixels to track conversions and optimize campaigns.",
    saveSettings: "Save Settings",
    generalSettings: "General Settings",
    search: "Search...",
    filter: "Filter",
    all: "All",
    noData: "No data found",
    viewDetails: "View Details",
    actions: "Actions",
    confirmDelete: "Are you sure you want to delete this?",
    yes: "Yes",
    no: "No",
    titleAr: "Title (Arabic)",
    order: "Order",
    type: "Type",
    students_in_course: "Students",
    monthly_revenue: "Monthly Revenue",
    financial_overview: "Financial Overview",
    total_transactions: "Total Transactions",
    language: "Language",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    system: "System",
  },
  ar: {
    dashboard: "لوحة التحكم",
    courses: "الدورات",
    students: "الطلاب",
    payments: "المدفوعات",
    settings: "الإعدادات",
    totalStudents: "إجمالي الطلاب",
    activeStudents: "الطلاب النشطون",
    totalCourses: "إجمالي الدورات",
    revenue: "إجمالي الإيرادات",
    pendingRevenue: "الإيرادات المعلقة",
    thisMonth: "هذا الشهر",
    recentActivity: "النشاط الأخير",
    completionRate: "معدل الإتمام",
    enrollmentsThisMonth: "تسجيلات جديدة",
    createCourse: "إنشاء دورة",
    addStudent: "إضافة طالب",
    addPayment: "تسجيل دفعة",
    status: "الحالة",
    price: "السعر",
    add: "إضافة",
    save: "حفظ",
    cancel: "إلغاء",
    edit: "تعديل",
    delete: "حذف",
    loading: "جاري التحميل...",
    name: "الاسم",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    progress: "التقدم",
    enrolledAt: "تاريخ التسجيل",
    paymentStatus: "حالة الدفع",
    active: "نشط",
    inactive: "غير نشط",
    pending: "معلق",
    paid: "مدفوع",
    overdue: "متأخر",
    draft: "مسودة",
    archived: "مؤرشف",
    completed: "مكتمل",
    failed: "فشل",
    refunded: "مسترد",
    amount: "المبلغ",
    method: "طريقة الدفع",
    date: "التاريخ",
    course: "الدورة",
    description: "الوصف",
    modules: "الوحدات",
    lessons: "الدروس",
    addModule: "إضافة وحدة",
    addLesson: "إضافة درس",
    video: "فيديو",
    pdf: "PDF",
    text: "نص",
    duration: "المدة (دقيقة)",
    videoUrl: "رابط الفيديو",
    pdfUrl: "رابط PDF",
    content: "المحتوى",
    bank_transfer: "تحويل بنكي",
    cash: "نقدي",
    card: "بطاقة",
    online: "إلكتروني",
    notes: "ملاحظات",
    paidAt: "تاريخ الدفع",
    academyName: "اسم الأكاديمية",
    academyNameAr: "اسم الأكاديمية (عربي)",
    logoUrl: "رابط الشعار",
    metaPixelId: "معرف Meta Pixel",
    googleTagId: "معرف Google Tag",
    tiktokPixelId: "معرف TikTok Pixel",
    defaultLanguage: "اللغة الافتراضية",
    currency: "العملة",
    marketingPixels: "بيكسلات التسويق",
    pixelsDesc: "ربط بيكسلات الإعلانات لتتبع التحويلات وتحسين الحملات.",
    saveSettings: "حفظ الإعدادات",
    generalSettings: "الإعدادات العامة",
    search: "بحث...",
    filter: "تصفية",
    all: "الكل",
    noData: "لا توجد بيانات",
    viewDetails: "عرض التفاصيل",
    actions: "الإجراءات",
    confirmDelete: "هل أنت متأكد من حذف هذا العنصر؟",
    yes: "نعم",
    no: "لا",
    titleAr: "العنوان (عربي)",
    order: "الترتيب",
    type: "النوع",
    students_in_course: "الطلاب",
    monthly_revenue: "الإيرادات الشهرية",
    financial_overview: "نظرة مالية",
    total_transactions: "إجمالي المعاملات",
    language: "اللغة",
    theme: "المظهر",
    dark: "داكن",
    light: "فاتح",
    system: "النظام",
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("lms_language") as Language;
    return saved === "en" || saved === "ar" ? saved : "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("lms_language", lang);
  };

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    const fontLink = document.getElementById("arabic-font");
    if (language === "ar" && !fontLink) {
      const link = document.createElement("link");
      link.id = "arabic-font";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
    if (language === "ar") {
      document.body.style.fontFamily = "'Cairo', sans-serif";
    } else {
      document.body.style.fontFamily = "";
    }
  }, [language]);

  const t = (key: string) => translations[language]?.[key] ?? key;

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
