// types.ts
export interface Academy {
  id: string;
  name: string;
  shareId: string;
  idDirector: string; // Campo para el UID del director
  entrenadores: string[]; // Array de UIDs de los entrenadores
}

export interface Player {
  id: string;
  name: string;
  estado: 'activo' | 'archivado';
  academyId: string;
}

export interface Objective {
  id: string;
  jugadorId: string;
  textoObjetivo: string;
  estado: ObjectiveEstado;
  academyId: string;
}

export interface TrainingSession {
  id: string;
  // Si una sesión puede tener varios jugadores, esto es mejor:
  playerIds: string[]; 
  fecha: string;
  ejercicios: LoggedExercise[];
  academyId: string;
  observaciones?: string;
}

export interface Tournament {
  id: string;
  jugadorId: string;
  nombreTorneo: string;
  gradoImportancia: TournamentImportance;
  fechaInicio: string;
  fechaFin: string;
  academyId:string;
}

// --- El resto de tus tipos (sin cambios) ---
export type ObjectiveEstado = 'actual-progreso' | 'consolidacion' | 'incorporado';

export enum TrainingType {
  CANASTO = "Canasto",
  PELOTA_VIVA = "Pelota viva",
}

export interface LoggedExercise {
  id: string;
  tipo: TrainingType;
  area: TrainingArea;
  ejercicio: string;
  tiempoCantidad: string;
  intensidad: number;
}

export enum TrainingArea {
  FONDO = "Fondo",
  RED = "Red",
  PRIMERAS_PELOTAS = "Primeras Pelotas",
  PUNTOS = "Puntos",
}

export type TournamentImportance = 'Muy importante' | 'Importante' | 'Importancia media' | 'Poco importante' | 'Nada importante';