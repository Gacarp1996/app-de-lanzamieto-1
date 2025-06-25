import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '../types';

const LOCAL_STORAGE_KEY = 'inProgressTrainingSession';

export interface SessionExercise {
  id: string;
  tipo: any;
  area: any;
  ejercicio: string;
  tiempoCantidad: string;
  intensidad: number;
  loggedForPlayerId: string;
  loggedForPlayerName: string;
}

interface TrainingContextType {
  isSessionActive: boolean;
  participants: Player[];
  exercises: SessionExercise[];
  setParticipants: React.Dispatch<React.SetStateAction<Player[]>>;
  startSession: (players: Player[]) => void;
  addExercise: (exercise: SessionExercise) => void;
  endSession: () => void;
  loadSession: () => boolean;
}

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

export const TrainingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [participants, setParticipants] = useState<Player[]>([]);
  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const navigate = useNavigate();

  // Al cargar la app por primera vez, solo revisamos si hay algo en localStorage.
  useEffect(() => {
    const savedSession = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedSession) {
      setIsSessionActive(true);
    }
  }, []);

  // Guardamos el estado en localStorage CADA VEZ que los participantes o ejercicios cambian.
  useEffect(() => {
    // Si no hay participantes, no hay sesión activa, así que no guardamos nada.
    if (participants.length === 0) return;
    
    const sessionData = JSON.stringify({ participants, exercises });
    localStorage.setItem(LOCAL_STORAGE_KEY, sessionData);
  }, [participants, exercises]);


  const loadSession = useCallback(() => {
    const savedSession = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedSession) {
      const { participants: savedParticipants, exercises: savedExercises } = JSON.parse(savedSession);
      if (savedParticipants && savedParticipants.length > 0) {
        setParticipants(savedParticipants);
        setExercises(savedExercises || []);
        setIsSessionActive(true);
        return true;
      }
    }
    return false;
  }, []);

  const startSession = useCallback((players: Player[]) => {
    setParticipants(players);
    setExercises([]);
    setIsSessionActive(true);
    const playerIds = players.map(p => p.id).join(',');
    navigate(`/training/${playerIds}`);
  }, [navigate]);

  const addExercise = useCallback((exercise: SessionExercise) => {
    setExercises(prev => [...prev, exercise]);
  }, []);

  // ESTA ES LA FUNCIÓN CLAVE MEJORADA
  const endSession = useCallback(() => {
    // 1. Limpiamos el localStorage.
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    // 2. Reiniciamos los estados a su valor inicial.
    setParticipants([]);
    setExercises([]);
    setIsSessionActive(false);
  }, []);

  return (
    <TrainingContext.Provider value={{ isSessionActive, participants, exercises, setParticipants, startSession, addExercise, endSession, loadSession }}>
      {children}
    </TrainingContext.Provider>
  );
};

export const useTraining = (): TrainingContextType => {
  const context = useContext(TrainingContext);
  if (!context) throw new Error('useTraining debe ser usado dentro de un TrainingProvider');
  return context;
};