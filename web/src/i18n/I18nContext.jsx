import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations, detectLanguage } from './translations'

const I18nContext = createContext()

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    // Detect language on mount
    const detectedLang = detectLanguage()
    setLanguage(detectedLang)
  }, [])

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key
  }

  const value = {
    language,
    setLanguage,
    t
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}
