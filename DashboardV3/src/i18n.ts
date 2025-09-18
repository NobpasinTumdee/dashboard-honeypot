import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
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