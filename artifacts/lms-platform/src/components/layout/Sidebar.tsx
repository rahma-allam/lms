import { Link, useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { LayoutDashboard, BookOpen, Users, CreditCard, Settings, GraduationCap, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { key: "dashboard", icon: LayoutDashboard, href: "/" },
  { key: "courses", icon: BookOpen, href: "/courses" },
  { key: "students", icon: Users, href: "/students" },
  { key: "payments", icon: CreditCard, href: "/payments" },
  { key: "settings", icon: Settings, href: "/settings" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useI18n();
  const [location] = useLocation();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 start-0 z-30 w-64 bg-sidebar border-e border-sidebar-border flex flex-col transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sidebar-foreground text-sm tracking-tight">EduAcademy Pro</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ key, icon: Icon, href }) => {
            const isActive = href === "/" ? location === href : location.startsWith(href);
            return (
              <Link
                key={key}
                href={href}
                onClick={onClose}
                className={cn("sidebar-nav-item", isActive && "active")}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {t(key)}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary/30 flex items-center justify-center text-sidebar-primary text-sm font-semibold">
              A
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">Academy Admin</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">admin@academy.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
