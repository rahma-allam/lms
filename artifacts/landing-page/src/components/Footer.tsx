import { useI18n } from "@/lib/i18n";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl leading-none">E</span>
              </div>
              <span className="font-bold text-xl">EduAcademy Pro</span>
            </div>
            <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed">
              {t("footer.tagline")}
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-foreground">Links</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-muted-foreground hover:text-primary transition-colors">{t("nav.features")}</a></li>
              <li><a href="#courses" className="text-muted-foreground hover:text-primary transition-colors">{t("nav.courses")}</a></li>
              <li><a href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors">{t("nav.testimonials")}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-foreground">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} EduAcademy Pro. {t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
}
