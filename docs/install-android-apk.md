# Instalar la APK en Android

## Archivo generado

La APK release actual queda en:

`android/app/build/outputs/apk/release/app-release.apk`

## Opcion 1: instalar desde la PC con USB

1. Activar `Opciones de desarrollador` y `Depuracion USB` en el celular.
2. Conectar el telefono por USB.
3. Verificar que ADB detecte el dispositivo:

```powershell
adb devices
```

4. Instalar la APK:

```powershell
adb install -r android\app\build\outputs\apk\release\app-release.apk
```

## Opcion 2: copiar la APK al telefono

1. Copiar `app-release.apk` al almacenamiento del celular.
2. Abrir el archivo desde la app de Archivos.
3. Aceptar `Instalar apps desconocidas` si Android lo pide.
4. Instalar la app.

## Si queres volver a generar la APK

Desde la carpeta `android`:

```powershell
.\gradlew assembleRelease
```

## Nota sobre la firma

Hoy la release compila aunque no exista un keystore privado, porque el proyecto hace fallback a la firma debug.
Para una publicacion real conviene crear tu propio keystore y completar `android/key.properties` a partir de `android/key.properties.example`.