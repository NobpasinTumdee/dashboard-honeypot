import 'i18next';
import enTranslation from '../public/locales/en/translation.json';

// กำหนด type ของภาษาทั้งหมดที่ใช้ในโปรเจกต์
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof enTranslation; // ใช้ typeof เพื่อกำหนดโครงสร้างของไฟล์ translation.json
    };
  }
}