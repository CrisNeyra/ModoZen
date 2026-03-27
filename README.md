# Modo Zen

Aplicación mobile de meditación y bienestar construida con React Native y TypeScript. El proyecto reúne sesiones guiadas, música ambiente persistente, videos relajantes, seguimiento básico del progreso y una experiencia visual orientada a transmitir calma desde el primer segundo de uso.

## Qué incluye

- Autenticación local con persistencia.
- Home principal con acceso a sesiones, sonidos, historias, progreso y ajustes.
- Reproductor global de música ambiente con mini-player flotante.
- Caminatas meditativas con instrucciones guiadas y audio asociado.
- Videos relajantes categorizados con vista previa.
- Splash screen personalizada y experiencia de arranque cuidada en Android e iOS.

## Stack

- React Native 0.83
- React 19
- TypeScript
- React Navigation
- AsyncStorage
- react-native-video
- react-native-linear-gradient

## Requisitos

- Node.js 20 o superior.
- Android Studio con SDK de Android configurado.
- JDK compatible con React Native 0.83.
- Git LFS instalado para descargar correctamente los assets multimedia del repositorio.

## Clonar el proyecto

```bash
git clone https://github.com/CrisNeyra/ModoZen.git
cd ModoZen
git lfs pull
npm install
```

## Desarrollo local

Iniciar Metro:

```bash
npm start
```

Ejecutar en Android:

```bash
npm run android
```

## Generar APK

Build release:

```powershell
cd android
.\gradlew assembleRelease
```

Archivo generado:

```text
android/app/build/outputs/apk/release/app-release.apk
```

Si querés una build de prueba rápida:

```powershell
cd android
.\gradlew assembleDebug
```

## Firma Android

El proyecto soporta dos escenarios:

- Si existe `android/key.properties`, la release usa tu keystore privada.
- Si no existe, hace fallback a firma debug para demos internas.

Podés usar `android/key.properties.example` como base para crear tu archivo real `android/key.properties`.

## Estructura general

```text
src/
	assets/        Recursos multimedia
	components/    Componentes reutilizables
	context/       Estado global y providers
	navigation/    Navegación principal
	screens/       Pantallas de la app
	theme/         Colores y estilos base
```

## Documentación útil

- [Instalación de APK](docs/install-android-apk.md)
- [Resumen para portfolio](docs/portfolio-mode-zen.md)

## Notas

- Este repositorio usa Git LFS para videos y audios pesados.
- Si al clonar faltan archivos multimedia, ejecutá `git lfs pull`.
