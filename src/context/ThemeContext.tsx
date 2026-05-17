import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { temaClaro, temaOscuro, type Tema } from '../theme/colors'

const CLAVE_TEMA = '@ModoZen:theme_v2'

type ThemeMode = 'light' | 'dark'

interface ThemeContextType {
  themeMode: ThemeMode
  theme: Tema
  toggleTheme: () => void
  setThemeMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark')

  useEffect(() => {
    const cargar = async () => {
      try {
        const guardado = await AsyncStorage.getItem(CLAVE_TEMA)
        if (guardado === 'light' || guardado === 'dark') {
          setThemeModeState(guardado)
        }
      } catch {}
    }
    cargar()
  }, [])

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode)
    try {
      await AsyncStorage.setItem(CLAVE_TEMA, mode)
    } catch {}
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark')
  }, [themeMode, setThemeMode])

  const theme = themeMode === 'dark' ? temaOscuro : temaClaro

  return (
    <ThemeContext.Provider value={{ themeMode, theme, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider')
  return ctx
}
