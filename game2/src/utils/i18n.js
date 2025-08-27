// Internationalization utility

import enTranslations from '../locales/en.json';
import koTranslations from '../locales/ko.json';

const translations = {
  en: enTranslations,
  ko: koTranslations
};

class I18n {
  constructor() {
    this.currentLanguage = localStorage.getItem('gameLanguage') || 'en';
    this.listeners = [];
  }

  // Get current language
  getLanguage() {
    return this.currentLanguage;
  }

  // Set language and notify listeners
  setLanguage(lang) {
    if (translations[lang]) {
      this.currentLanguage = lang;
      localStorage.setItem('gameLanguage', lang);
      this.notifyListeners();
    }
  }

  // Get translation by key path (e.g., 'game.title')
  t(key) {
    const keys = key.split('.');
    let value = translations[this.currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return value || key;
  }

  // Subscribe to language changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of language change
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentLanguage));
  }

  // Get all available languages
  getAvailableLanguages() {
    return Object.keys(translations);
  }
}

// Create singleton instance
const i18n = new I18n();
export default i18n;