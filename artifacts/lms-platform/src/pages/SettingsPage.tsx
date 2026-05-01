import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import {
  useGetSettings,
  useUpdateSettings,
  getGetSettingsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Settings, Megaphone, Globe } from "lucide-react";

interface SettingsForm {
  academyName: string;
  academyNameAr: string;
  logoUrl: string;
  metaPixelId: string;
  googleTagId: string;
  tiktokPixelId: string;
  defaultLanguage: "en" | "ar";
  currency: string;
}

export default function SettingsPage() {
  const { t } = useI18n();
  const qc = useQueryClient();

  const { data: settings, isLoading } = useGetSettings({
    query: { queryKey: getGetSettingsQueryKey() },
  });

  const updateSettings = useUpdateSettings({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        toast.success("Settings saved");
      },
      onError: () => toast.error("Failed to save settings"),
    },
  });

  const { register, handleSubmit, reset } = useForm<SettingsForm>();

  useEffect(() => {
    if (settings) {
      reset({
        academyName: settings.academyName,
        academyNameAr: settings.academyNameAr ?? "",
        logoUrl: settings.logoUrl ?? "",
        metaPixelId: settings.metaPixelId ?? "",
        googleTagId: settings.googleTagId ?? "",
        tiktokPixelId: settings.tiktokPixelId ?? "",
        defaultLanguage: settings.defaultLanguage,
        currency: settings.currency,
      });
    }
  }, [settings, reset]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-card border border-card-border rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">{t("settings")}</h1>

      <form
        onSubmit={handleSubmit((data) =>
          updateSettings.mutate({
            data: {
              academyName: data.academyName,
              academyNameAr: data.academyNameAr || undefined,
              logoUrl: data.logoUrl || undefined,
              metaPixelId: data.metaPixelId || undefined,
              googleTagId: data.googleTagId || undefined,
              tiktokPixelId: data.tiktokPixelId || undefined,
              defaultLanguage: data.defaultLanguage,
              currency: data.currency,
            },
          })
        )}
        className="space-y-6"
      >
        <div className="bg-card border border-card-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">{t("generalSettings")}</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t("academyName")} *</label>
              <Input {...register("academyName", { required: true })} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">{t("academyNameAr")}</label>
              <Input {...register("academyNameAr")} className="mt-1" dir="rtl" placeholder="اسم الأكاديمية" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">{t("logoUrl")}</label>
            <Input {...register("logoUrl")} className="mt-1" placeholder="https://..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t("defaultLanguage")}</label>
              <select
                {...register("defaultLanguage")}
                className="mt-1 w-full h-9 px-3 border border-input rounded-md bg-background text-sm"
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">{t("currency")}</label>
              <select
                {...register("currency")}
                className="mt-1 w-full h-9 px-3 border border-input rounded-md bg-background text-sm"
              >
                <option value="USD">USD ($)</option>
                <option value="SAR">SAR (ر.س)</option>
                <option value="AED">AED (د.إ)</option>
                <option value="EGP">EGP (ج.م)</option>
                <option value="KWD">KWD (د.ك)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Megaphone className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">{t("marketingPixels")}</h2>
          </div>
          <p className="text-xs text-muted-foreground">{t("pixelsDesc")}</p>

          <div className="space-y-4 pt-1">
            <div className="border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">f</span>
                </div>
                <label className="text-sm font-medium">Meta (Facebook) Pixel</label>
              </div>
              <Input
                {...register("metaPixelId")}
                placeholder="Enter your Meta Pixel ID (e.g. 1234567890123456)"
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Fires Purchase event on payments. ViewContent on every page.
              </p>
            </div>

            <div className="border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-red-500 flex items-center justify-center">
                  <Globe className="w-3.5 h-3.5 text-white" />
                </div>
                <label className="text-sm font-medium">Google Tag Manager</label>
              </div>
              <Input
                {...register("googleTagId")}
                placeholder="Enter your GTM ID (e.g. GTM-XXXXXXX or G-XXXXXXXXXX)"
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Fires purchase event and page_view on navigation.
              </p>
            </div>

            <div className="border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-black flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">T</span>
                </div>
                <label className="text-sm font-medium">TikTok Pixel</label>
              </div>
              <Input
                {...register("tiktokPixelId")}
                placeholder="Enter your TikTok Pixel ID"
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Fires CompletePayment event on successful payments.
              </p>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={updateSettings.isPending}>
          {updateSettings.isPending ? t("loading") : t("saveSettings")}
        </Button>
      </form>
    </div>
  );
}
