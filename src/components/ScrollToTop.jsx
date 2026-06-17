import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. إيقاف استرجاع السكرول التلقائي من المتصفح عشان مايرجعكش لتحت
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // 2. سكرول فوري تحسباً للصفحات الخفيفة
    window.scrollTo(0, 0);

    // 3. سكرول بعد رسم الصفحة (عشان الـ Lazy Loading والـ Suspense)
    const timeoutId = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100); // 100 ملي ثانية كافية جداً لضمان رسم الـ DOM

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
}