# Modo Zen

Aplicacion mobile de meditacion desarrollada con React Native y TypeScript.

## Desarrollo

Instalar dependencias:

```sh
npm install
```

Levantar Metro:

```sh
npm start
```

Ejecutar en Android:

```sh
npm run android
```

## Build Android release

Generar APK release:

```sh
cd android
.\gradlew assembleRelease
```

APK generada:

`android/app/build/outputs/apk/release/app-release.apk`

## Firma para publicacion

El proyecto hoy soporta dos modos:

- Si existe `android/key.properties`, la release usa tu keystore privada.
- Si no existe, hace fallback a la firma debug para demo.

Usa `android/key.properties.example` como base para crear tu archivo real `android/key.properties`.

## Documentacion util

- `docs/install-android-apk.md`
- `docs/portfolio-mode-zen.md`
