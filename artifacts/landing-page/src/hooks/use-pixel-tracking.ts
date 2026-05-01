import { useEffect } from 'react';
import { useGetSettings, getGetSettingsQueryKey } from '@workspace/api-client-react';
import { useQuery } from '@tanstack/react-query';

export function usePixelTracking() {
  const { data: settings } = useGetSettings({
    query: {
      queryKey: getGetSettingsQueryKey(),
    }
  });

  useEffect(() => {
    if (!settings) return;

    // Meta Pixel
    if (settings.metaPixelId && !document.getElementById('meta-pixel')) {
      const script = document.createElement('script');
      script.id = 'meta-pixel';
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${settings.metaPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
    }

    // Google Tag Manager
    if (settings.googleTagId && !document.getElementById('google-tag')) {
      const script = document.createElement('script');
      script.id = 'google-tag';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${settings.googleTagId}`;
      document.head.appendChild(script);

      const scriptInline = document.createElement('script');
      scriptInline.id = 'google-tag-inline';
      scriptInline.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${settings.googleTagId}');
      `;
      document.head.appendChild(scriptInline);
    }

    // TikTok Pixel
    if (settings.tiktokPixelId && !document.getElementById('tiktok-pixel')) {
      const script = document.createElement('script');
      script.id = 'tiktok-pixel';
      script.innerHTML = `
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load('${settings.tiktokPixelId}');
          ttq.page();
        }(window, document, 'ttq');
      `;
      document.head.appendChild(script);
    }
  }, [settings]);

  const trackPurchase = (value: number, currency: string = 'USD') => {
    // Meta
    if (window.fbq) {
      window.fbq('track', 'Purchase', { value, currency });
    }
    // GTM
    if (window.gtag) {
      window.gtag('event', 'purchase', { value, currency });
    }
    // TikTok
    if (window.ttq) {
      window.ttq.track('CompletePayment', { value, currency });
    }
  };

  return { trackPurchase };
}

declare global {
  interface Window {
    fbq?: any;
    gtag?: any;
    ttq?: any;
  }
}
