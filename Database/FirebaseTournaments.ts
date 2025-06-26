// Database/FirebaseTournaments.ts

import { db } from "../firebase/firebase-config";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { Tournament } from "../types";

const tournamentsCollection = collection(db, "tournaments");

export const addTournament = async (tournamentData: Omit<Tournament, "id">, academyId: string) => {
  if (!academyId) {
    throw new Error("No se puede crear un torneo sin academyId");
  }
  
  try {
    const docRef = await addDoc(tournamentsCollection, { 
      ...tournamentData, 
      academyId 
    });
    console.log("Torneo agregado con ID:", docRef.id);
  } catch (error) {
    console.error("Error al agregar torneo:", error);
    throw error;
  }
};

export const getTournaments = async (academyId?: string): Promise<Tournament[]> => {
  if (!academyId) {
    console.warn("No se proporcionó academyId, devolviendo array vacío");
    return [];
  }
  
  try {
    const q = query(tournamentsCollection, where("academyId", "==", academyId));
    const querySnapshot = await getDocs(q);
    
    const tournaments: Tournament[] = querySnapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Tournament, "id">;
      return {
        id: doc.id,
        ...data,
      };
    });
    
    console.log(`Torneos obtenidos para academia ${academyId}:`, tournaments.length);
    return tournaments;
  } catch (error) {
    console.error("Error al obtener torneos:", error);
    return [];
  }
};

// Función para actualizar torneo
export const updateTournament = async (id: string, dataToUpdate: Partial<Tournament>) => {
    try {
        const tournamentDoc = doc(db, "tournaments", id);
        await updateDoc(tournamentDoc, dataToUpdate);
        console.log("Torneo actualizado con éxito:", id);
    } catch (error) {
        console.error("Error al actualizar torneo:", error);
    }
};

// Función para borrar torneo
export const deleteTournament = async (id: string) => {
    try {
        const tournamentDoc = doc(db, "tournaments", id);
        await deleteDoc(tournamentDoc);
        console.log("Torneo eliminado con éxito:", id);
    } catch (error) {
        console.error("Error al eliminar torneo:", error);
    }
};