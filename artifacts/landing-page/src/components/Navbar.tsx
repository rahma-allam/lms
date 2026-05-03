import { useI18n } from "@/lib/i18n";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Languages, UserCircle, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter"; // لاستخدام التنقل بين الصفحات

export default function Navbar() {
  const { lang, setLang, t } = useI18n();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [, navigate] = useLocation();

  // التحقق من وجود مستخدم مسجل (بشكل مبدئي من LocalStorage)
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    // فحص إذا كان الطالب مسجل دخول عند تحميل الصفحة
    const savedUser = localStorage.getItem("student");
    if (savedUser) setUser(JSON.parse(savedUser));

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("student");
    setUser(null);
    navigate("/");
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled
          ? "bg-background/80 backdrop-blur-md border-border shadow-sm py-3"
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl leading-none">E</span>
          </div>
          <span className="font-bold text-xl hidden sm:inline-block">EduAcademy Pro</span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">{t('nav.features')}</a>
          <a href="#courses" className="text-sm font-medium hover:text-primary transition-colors">{t('nav.courses')}</a>
          <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">{t('nav.testimonials')}</a>
        </nav>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="rounded-full"
            title="Toggle Language"
          >
            <Languages className="h-5 w-5" />
          </Button>
          
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
            title="Toggle Theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <div className="h-6 w-[1px] bg-border mx-1 hidden sm:block" />

          {/* Auth Buttons - تظهر بناءً على حالة تسجيل الدخول */}
          {user ? (
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                className="gap-2 hidden sm:flex"
                onClick={() => navigate("/profile")}
              >
                <UserCircle className="w-5 h-5" />
                {user.name}
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                {lang === "ar" ? "خروج" : "Logout"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2"
                onClick={() => navigate("/login")}
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden xs:inline">{lang === "ar" ? "دخول" : "Login"}</span>
              </Button>
              
              <Button 
                size="sm" 
                className="rounded-full px-5" 
                onClick={() => navigate("/register")}
              >
                {lang === "ar" ? "ابدأ الآن" : "Join Now"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}