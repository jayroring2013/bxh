import React, { createContext, useContext, useState } from 'react'
import { LOCALES } from '../locales.js'

const LangContext = createContext()

export function LangProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem('nt_lang') || 'vi'
  )

  const toggleLang = () => {
    const next = lang === 'vi' ? 'en' : 'vi'
    localStorage.setItem('nt_lang', next)
    setLang(next)
  }

  const t = (key, ...args) => {
    const val = LOCALES[lang]?.[key] ?? LOCALES['en']?.[key] ?? key
    return typeof val === 'function' ? val(...args) : val
  }

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
