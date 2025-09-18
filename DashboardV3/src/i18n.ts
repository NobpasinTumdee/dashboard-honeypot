import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'], // ให้ตรวจหาภาษาจาก localStorage ก่อน แล้วค่อยจากเบราว์เซอร์
      caches: ['localStorage'], // ให้บันทึกภาษาที่เลือกไว้ใน localStorage
    },
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    // นี่คือการกำหนดค่าเริ่มต้นเพื่อให้ TypeScript รู้จัก
    // ควรตั้งชื่อ namespace ให้ตรงกับชื่อไฟล์ (translation.json)
    ns: ['translation'],
    defaultNS: 'translation',
  });

export default i18n;