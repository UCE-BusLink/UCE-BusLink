export interface TrustPenalty {
  id: string;
  tipo: string;
  razon: string;
  puntosRestados: number;
  fechaInicio: string;
  fechaExpiracion: string | null;
  estado: string;
}

export interface TrustScoreHistory {
  fecha: string;
  evento: string;
  cambio: number;
  puntuacionResultante: number;
}

export interface TrustScore {
  id: string;
  usuarioId: string;
  puntuacion: number;
  nivel: string;
  reservasTotales: number;
  reservasCompletadas: number;
  noShows: number;
  cancelacionesUltimo30dias: number;
  penalizacionesActivas: TrustPenalty[];
  trendultimos7dias: number;
  proximaRevision: string | null;
  historico: TrustScoreHistory[];
}

export interface UserStats {
  viajesTotales: number;
  viajesTotalesCompletados: number;
  kmTotalesViajados: number;
  horasTotalesEnTransito: number;
  diasActivo: number;
  tiempoPromedioEspera: number;
  rutasFrecuentes: any[];
}

export interface UserPreferences {
  notificacionesHabilitadas: boolean;
  notificacionesEmail: boolean;
  compartirUbicacion: boolean;
  visibilidadPerfil: string;
}

export interface UserProfileDto {
  id: string;
  email: string;
  nombres: string;
  apellidos: string;
  rol: string;
  estado: string;
  fotoPerfil: string | null;
  telefonoContacto: string | null;
  direccion: string | null;
  fechaNacimiento: string | null;
  generoCorreo: string;
  carrera: string | null;
  numeroDocumento: string | null;
  fechaPrimerLogin: string;
  fechaUltimoLogin: string;
  fechaCreacionCuenta: string;
}

export interface UserProfileResponse {
  usuario: UserProfileDto;
  puntuacionConfianza: TrustScore;
  estadisticas: UserStats;
  preferencias: UserPreferences;
}

export interface UpdateUserProfileRequest {
  telefonoContacto?: string;
  direccion?: string;
  carrera?: string;
  numeroDocumento?: string;
  fechaNacimiento?: string;
}
