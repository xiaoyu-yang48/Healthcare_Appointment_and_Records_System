// src/utils/i18n.js
import en from './locales/en.json';
import zh from './locales/zh.json';

const LANGUAGES = { en, zh };

export function getLanguage() {
  // 默认英语，可根据 localStorage 或浏览器设置切换
  return localStorage.getItem('lang') || 'en';
}

export function t(key) {
  const lang = getLanguage();
  const keys = key.split('.');
  let value = LANGUAGES[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // 如果找不到对应的翻译，返回原始键
    }
  }
  
  return value || key;
}

export function setLanguage(lang) {
  if (LANGUAGES[lang]) {
    localStorage.setItem('lang', lang);
    window.location.reload();
  }
}
