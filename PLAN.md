# Plan de Implementación — ModoZen

## Resumen de Archivos

| Archivo | Acción | Feature |
|---|---|---|
| `src/components/CircularTimer.tsx` | CREAR | 1. Timer |
| `src/screens/TemporizadorScreen.tsx` | CREAR | 1. Timer |
| `src/navigation/AppNavigator.tsx` | MODIFICAR | 1, 3 |
| `src/screens/index.ts` | MODIFICAR | 1, 3 |
| `src/screens/HomeScreen.tsx` | MODIFICAR | 1, 2, 3 |
| `src/screens/ReflexionScreen.tsx` | MODIFICAR | 2. Carrusel |
| `src/components/Dashboard.tsx` | CREAR | 3. Dashboard |
| `src/screens/ProgresoScreen.tsx` | MODIFICAR | 3 |
| `src/context/ThemeContext.tsx` | CREAR | 4. Tema |
| `src/theme/colors.ts` | MODIFICAR | 4 |
| `App.tsx` | MODIFICAR | 4 |
| `src/context/LanguageContext.tsx` | MODIFICAR | 2, 3 (traducciones) |
| `src/screens/AjustesScreen.tsx` | MODIFICAR | 4 |

---

## Feature 1 — Temporizador Circular

**`src/components/CircularTimer.tsx`**
- Props: `durationMinutes`, `onComplete`, `autoStart?`
- Anillo circular con 2 semicírculos rotados
- Estados: `idle | running | paused | done`
- Botones Iniciar / Pausar / Detener
- Tiempo restante en formato `mm:ss`
- Al llegar a 0: `Vibration.vibrate(500)` + animación

**`src/screens/TemporizadorScreen.tsx`**
- Selector de duración (3/5/10/15 min)
- Renderiza `CircularTimer`
- Fondo con gradiente

---

## Feature 2 — Guía Zen Carrusel

**`src/screens/ReflexionScreen.tsx`**
- `ScrollView` horizontal con `pagingEnabled` (3 páginas)
- Paso 1: Chips de emociones
- Paso 2: TextInput + botón
- Paso 3: Modal con mensaje (se mantiene)
- Indicador de progreso: dots animados

---

## Feature 3 — Dashboard

**`src/components/Dashboard.tsx`**
- Calcula últimos 7 días
- Barras verticales animadas
- Etiquetas de días

**`src/screens/ProgresoScreen.tsx`**
- Reemplazar barras inline por `Dashboard`

---

## Feature 4 — Temas Claro/Oscuro

**`src/context/ThemeContext.tsx`**
- Persiste en AsyncStorage
- Hook `useTheme()` → `{ theme, themeMode, toggleTheme }`

**`src/theme/colors.ts`**
- `temaClaro` y `temaOscuro` como objetos

**`src/screens/AjustesScreen.tsx`**
- Toggle Switch funcional

---

## Orden de Implementación

1. ThemeContext (feature 4)
2. CircularTimer + TemporizadorScreen (feature 1)
3. Dashboard (feature 3)
4. Carrusel Guía Zen (feature 2)
