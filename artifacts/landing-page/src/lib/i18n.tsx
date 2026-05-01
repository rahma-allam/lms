import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Language = 'en' | 'ar';

type Translations = Record<string, string>;

const en: Translations = {
  'nav.home': 'Home',
  'nav.courses': 'Courses',
  'nav.features': 'Features',
  'nav.testimonials': 'Testimonials',
  'hero.title': 'Unlock Your True Potential',
  'hero.subtitle': 'Expert-led video courses trusted by thousands of students across the Arab world. Learn at your own pace, on your own schedule.',
  'hero.cta.join': 'Join Now',
  'hero.cta.explore': 'Explore Courses',
  'features.title': 'Why Choose EduAcademy Pro?',
  'features.subtitle': 'Everything you need to succeed in one place.',
  'feature.1.title': 'Secure Video Content',
  'feature.1.desc': 'High-quality, encrypted video lessons available 24/7 on any device.',
  'feature.2.title': 'Automated Progress Tracking',
  'feature.2.desc': 'Monitor your performance with detailed analytics and progress reports.',
  'feature.3.title': 'Easy Online Payments',
  'feature.3.desc': 'Secure and flexible payment options designed for your convenience.',
  'courses.title': 'Our Top Courses',
  'courses.subtitle': 'Join thousands of students learning from the best.',
  'courses.buy': 'Buy Now',
  'courses.students': 'students',
  'howitworks.title': 'How It Works',
  'howitworks.subtitle': 'Your journey to success in three simple steps.',
  'howitworks.step1': 'Register',
  'howitworks.step1.desc': 'Create your secure account in seconds.',
  'howitworks.step2': 'Pay',
  'howitworks.step2.desc': 'Choose a course and pay securely online.',
  'howitworks.step3': 'Start Learning',
  'howitworks.step3.desc': 'Access your materials instantly.',
  'testimonials.title': 'Student Success Stories',
  'testimonials.subtitle': 'Hear from our global community of learners.',
  'trust.title': '100% Secure Payment',
  'trust.guarantee': '30-Day Money-Back Guarantee',
  'footer.tagline': 'Empowering minds across the Arab world with world-class online education.',
  'footer.rights': 'All rights reserved.',
};

const ar: Translations = {
  'nav.home': 'الرئيسية',
  'nav.courses': 'الدورات',
  'nav.features': 'المميزات',
  'nav.testimonials': 'آراء الطلاب',
  'hero.title': 'اكتشف إمكانياتك الحقيقية',
  'hero.subtitle': 'دورات فيديو يقدمها خبراء، موثوقة من آلاف الطلاب في جميع أنحاء العالم العربي. تعلم بالسرعة التي تناسبك وفي وقتك الخاص.',
  'hero.cta.join': 'انضم الآن',
  'hero.cta.explore': 'استعرض الكورسات',
  'features.title': 'لماذا تختار إيديو أكاديمي برو؟',
  'features.subtitle': 'كل ما تحتاجه للنجاح في مكان واحد.',
  'feature.1.title': 'محتوى فيديو آمن',
  'feature.1.desc': 'دروس فيديو عالية الجودة ومشفرة متاحة على مدار الساعة على أي جهاز.',
  'feature.2.title': 'تتبع تلقائي للتقدم',
  'feature.2.desc': 'راقب أداءك مع تحليلات مفصلة وتقارير تقدم مستمرة.',
  'feature.3.title': 'دفع إلكتروني سهل',
  'feature.3.desc': 'خيارات دفع مرنة وآمنة مصممة لراحتك.',
  'courses.title': 'أفضل كورساتنا',
  'courses.subtitle': 'انضم لآلاف الطلاب وتعلم من الأفضل.',
  'courses.buy': 'اشتر الآن',
  'courses.students': 'طالب',
  'howitworks.title': 'كيف يعمل',
  'howitworks.subtitle': 'رحلتك نحو النجاح في ثلاث خطوات بسيطة.',
  'howitworks.step1': 'سجّل',
  'howitworks.step1.desc': 'أنشئ حسابك الآمن في ثوانٍ.',
  'howitworks.step2': 'ادفع',
  'howitworks.step2.desc': 'اختر كورس وادفع بأمان عبر الإنترنت.',
  'howitworks.step3': 'ابدأ التعلم',
  'howitworks.step3.desc': 'احصل على المواد التعليمية فوراً.',
  'testimonials.title': 'قصص نجاح طلابنا',
  'testimonials.subtitle': 'استمع من مجتمع المتعلمين لدينا.',
  'trust.title': 'دفع آمن 100٪',
  'trust.guarantee': 'ضمان استرداد الأموال لمدة 30 يومًا',
  'footer.tagline': 'تمكين العقول في جميع أنحاء العالم العربي بتعليم إلكتروني عالمي المستوى.',
  'footer.rights': 'جميع الحقوق محفوظة.',
};

const translations = { en, ar };

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('lang');
    return (saved as Language) || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.setAttribute('lang', lang);
  }, [lang]);

  const t = (key: string) => {
    return translations[lang][key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
