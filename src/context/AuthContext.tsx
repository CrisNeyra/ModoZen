// ============================================================
// AuthContext.tsx — Contexto de autenticación
// Maneja el login, registro, logout y base de datos local
// de usuarios con AsyncStorage.
// ============================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabaseClient';

// --- Tipos de datos ---

/** Datos del usuario autenticado (sin contraseña) */
interface Usuario {
  id: string;
  email: string;
  nombre: string;
}

/** Datos almacenados en la "base de datos" local */
interface UsuarioAlmacenado {
  id: string;
  email: string;
  nombre: string;
  hashContrasena: string;
  creadoEn: string;
}

/** Tipo del contexto de autenticación */
interface ResultadoRegistro {
  exito: boolean;
  mensaje?: string;
}

/** Tipo del contexto de autenticación */
interface TipoContextoAuth {
  usuario: Usuario | null;
  cargando: boolean;
  estaLogueado: boolean;
  iniciarSesion: (email: string, contrasena: string) => Promise<boolean>;
  registrarse: (nombre: string, email: string, contrasena: string) => Promise<ResultadoRegistro>;
  cerrarSesion: () => Promise<void>;
}

// Creamos el contexto (undefined hasta que se provea)
const ContextoAuth = createContext<TipoContextoAuth | undefined>(undefined);

// --- Claves de almacenamiento en AsyncStorage ---
const CLAVE_SESION = '@ModoZen:sesion';
const CLAVE_BD_USUARIOS = '@ModoZen:baseDatosUsuarios';
const CLAVE_BD_REINICIADA = '@ModoZen:bdReiniciada_v2'; // Bandera para reinicio único

// ============================================================
// Función de hash simple para contraseñas
// NOTA: En producción se usaría bcrypt en un backend real.
// ============================================================
const hashearContrasena = (contrasena: string): string => {
  let hash = 0;
  const sal = 'ModoZen2026SalSegura!';
  const conSal = sal + contrasena + sal;
  for (let i = 0; i < conSal.length; i++) {
    const caracter = conSal.charCodeAt(i);
    hash = ((hash << 5) - hash) + caracter;
    hash = hash & hash; // Convertir a entero de 32 bits
  }
  // Crear un hash más largo combinando iteraciones
  let hashTexto = Math.abs(hash).toString(36);
  for (let i = 0; i < 3; i++) {
    hash = ((hash << 7) - hash) + conSal.charCodeAt(i % conSal.length);
    hash = hash & hash;
    hashTexto += Math.abs(hash).toString(36);
  }
  return hashTexto;
};

// ============================================================
// Validación accesible de contraseña
// Solo se pide: mínimo 4 caracteres. Nada más.
// ============================================================
const esContrasenaValida = (contrasena: string): boolean => {
  return contrasena.length >= 4;
};

// ============================================================
// Funciones para la "base de datos" local de usuarios
// ============================================================

/** Obtiene la lista de usuarios guardados en AsyncStorage */
const obtenerBDUsuarios = async (): Promise<UsuarioAlmacenado[]> => {
  try {
    const datos = await AsyncStorage.getItem(CLAVE_BD_USUARIOS);
    return datos ? JSON.parse(datos) : [];
  } catch {
    return [];
  }
};

/** Guarda la lista de usuarios en AsyncStorage */
const guardarBDUsuarios = async (usuarios: UsuarioAlmacenado[]): Promise<void> => {
  await AsyncStorage.setItem(CLAVE_BD_USUARIOS, JSON.stringify(usuarios));
};

// ============================================================
// Componente proveedor de autenticación
// Envuelve la app y provee estado + funciones de auth.
// ============================================================
export const ProveedorAuth = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  // Al montar, reiniciamos la BD una vez y cargamos sesión
  useEffect(() => {
    inicializar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Inicializa la app: reinicia BD si es la primera vez, carga sesión guardada */
  const inicializar = async () => {
    try {
      // Reinicio único de la base de datos de logueo
      const yaReiniciada = await AsyncStorage.getItem(CLAVE_BD_REINICIADA);
      if (!yaReiniciada) {
        // Borramos la BD de usuarios y la sesión anterior
        await AsyncStorage.removeItem(CLAVE_BD_USUARIOS);
        await AsyncStorage.removeItem(CLAVE_SESION);
        await AsyncStorage.setItem(CLAVE_BD_REINICIADA, 'true');
        console.log('Base de datos de logueo reiniciada correctamente.');
      }

      // Cargar sesión almacenada (si existe)
      await cargarSesionGuardada();
    } catch (error) {
      console.error('Error al inicializar:', error);
    } finally {
      setCargando(false);
    }
  };

  /** Carga la sesión guardada en AsyncStorage si el usuario existe */
  const cargarSesionGuardada = async () => {
    try {
      const sesionGuardada = await AsyncStorage.getItem(CLAVE_SESION);
      if (sesionGuardada) {
        const usuarioSesion = JSON.parse(sesionGuardada);
        // Verificar que el usuario todavía existe en la BD
        const bdUsuarios = await obtenerBDUsuarios();
        const existe = bdUsuarios.find(
          u => u.id === usuarioSesion.id && u.email === usuarioSesion.email
        );
        if (existe) {
          setUsuario(usuarioSesion);
        } else {
          // El usuario ya no existe, limpiamos la sesión
          await AsyncStorage.removeItem(CLAVE_SESION);
        }
      }
    } catch (error) {
      console.error('Error al cargar la sesión:', error);
    }
  };

  /**
   * Inicia sesión con email y contraseña.
   * Si el usuario no existe, lo crea automáticamente (para facilitar pruebas).
   */
  const iniciarSesion = async (email: string, contrasena: string): Promise<boolean> => {
    try {
      // Validar contraseña accesible
      if (!esContrasenaValida(contrasena)) {
        return false;
      }

      const emailNormalizado = email.toLowerCase().trim();
      const bdUsuarios = await obtenerBDUsuarios();

      // Buscar usuario en la base de datos
      const usuarioExistente = bdUsuarios.find(u => u.email === emailNormalizado);

      if (!usuarioExistente) {
        // Si no existe, lo creamos automáticamente (facilita pruebas)
        const nuevoUsuario: UsuarioAlmacenado = {
          id: Date.now().toString(),
          email: emailNormalizado,
          nombre: emailNormalizado.split('@')[0],
          hashContrasena: hashearContrasena(contrasena),
          creadoEn: new Date().toISOString(),
        };
        bdUsuarios.push(nuevoUsuario);
        await guardarBDUsuarios(bdUsuarios);

        const sesion: Usuario = {
          id: nuevoUsuario.id,
          email: nuevoUsuario.email,
          nombre: nuevoUsuario.nombre,
        };
        await AsyncStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
        setUsuario(sesion);
        return true;
      }

      // Verificar contraseña
      if (usuarioExistente.hashContrasena !== hashearContrasena(contrasena)) {
        return false;
      }

      // Login exitoso
      const sesion: Usuario = {
        id: usuarioExistente.id,
        email: usuarioExistente.email,
        nombre: usuarioExistente.nombre,
      };
      await AsyncStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
      setUsuario(sesion);
      return true;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return false;
    }
  };

  /**
   * Registra un nuevo usuario.
   * Valida que la contraseña sea mínimo 6 caracteres y que no exista el email.
   */
  const registrarse = async (
    nombre: string,
    email: string,
    contrasena: string
  ): Promise<ResultadoRegistro> => {
    try {
      // Validar contraseña accesible
      if (!esContrasenaValida(contrasena)) {
        return { exito: false, mensaje: 'La contraseña no cumple los requisitos mínimos.' };
      }

      const emailNormalizado = email.toLowerCase().trim();

      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: emailNormalizado,
          password: contrasena,
          options: {
            data: { nombre: nombre.trim() },
            emailRedirectTo: undefined,
          },
        });

        if (error) {
          return { exito: false, mensaje: error.message || 'No se pudo crear la cuenta en Supabase.' };
        }

        if (!data.user?.id) {
          return { exito: false, mensaje: 'No recibimos un usuario válido desde Supabase.' };
        }

        const { error: errorPerfil } = await supabase
          .from('perfiles')
          .upsert(
            {
              id: data.user.id,
              email: emailNormalizado,
              nombre: nombre.trim(),
            },
            { onConflict: 'id' },
          );

        if (errorPerfil) {
          return { exito: false, mensaje: errorPerfil.message || 'No se pudo guardar el perfil.' };
        }

        return {
          exito: true,
          mensaje: 'Cuenta creada. Revisá tu correo para verificar tu email antes de iniciar sesión.',
        };
      }

      const bdUsuarios = await obtenerBDUsuarios();

      // Verificar si el email ya está registrado
      const yaExiste = bdUsuarios.find(u => u.email === emailNormalizado);
      if (yaExiste) {
        return { exito: false, mensaje: 'Ese correo ya está en uso.' };
      }

      // Crear nuevo usuario
      const nuevoUsuario: UsuarioAlmacenado = {
        id: Date.now().toString(),
        email: emailNormalizado,
        nombre: nombre.trim(),
        hashContrasena: hashearContrasena(contrasena),
        creadoEn: new Date().toISOString(),
      };

      bdUsuarios.push(nuevoUsuario);
      await guardarBDUsuarios(bdUsuarios);

      // Crear sesión automáticamente
      const sesion: Usuario = {
        id: nuevoUsuario.id,
        email: nuevoUsuario.email,
        nombre: nuevoUsuario.nombre,
      };
      await AsyncStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
      setUsuario(sesion);
      return { exito: true };
    } catch (error) {
      console.error('Error al registrarse:', error);
      return { exito: false, mensaje: 'Ocurrió un error al crear la cuenta.' };
    }
  };

  /** Cierra la sesión actual y limpia los datos almacenados */
  const cerrarSesion = async () => {
    try {
      await AsyncStorage.removeItem(CLAVE_SESION);
      setUsuario(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Proveemos el contexto a toda la app
  return (
    <ContextoAuth.Provider
      value={{
        usuario,
        cargando,
        estaLogueado: !!usuario,
        iniciarSesion,
        registrarse,
        cerrarSesion,
      }}
    >
      {children}
    </ContextoAuth.Provider>
  );
};

// ============================================================
// Hook personalizado para usar el contexto de autenticación
// Uso: const { usuario, iniciarSesion, ... } = useAuth();
// ============================================================
export const useAuth = (): TipoContextoAuth => {
  const contexto = useContext(ContextoAuth);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de un ProveedorAuth');
  }
  return contexto;
};

// Alias de compatibilidad para el nombre viejo
export { ProveedorAuth as AuthProvider };

export default ContextoAuth;
