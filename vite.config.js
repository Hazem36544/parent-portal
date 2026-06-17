import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // التأكد من الحفاظ على مسار المستودع الخاص بك
  base: '/parent-portal/', 
  build: {
    // رفع الحد الأقصى للتحذير إلى 1000 كيلوبايت
    chunkSizeWarningLimit: 1000, 
    
    rollupOptions: {
      output: {
        // فصل المكتبات الخارجية (مثل React وغيرها) في ملف منفصل اسمه vendor
        // هذا سيجعل المتصفح يحتفظ بها في الـ Cache لتسريع التحميل للآباء
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})