import { db } from "../firebase/firebase-config";
// Importamos las herramientas que necesitamos
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Tournament } from "../types";

const tournamentsCollection = collection(db, "tournaments");

export const addTournament = async (tournamentData: Omit<Tournament, "id">) => {
  try {
    const docRef = await addDoc(tournamentsCollection, tournamentData);
    console.log("Torneo agregado con ID:", docRef.id);
  } catch (error) {
    console.error("Error al agregar torneo:", error);
  }
};

export const getTournaments = async (): Promise<Tournament[]> => {
  try {
    const querySnapshot = await getDocs(tournamentsCollection);
    const tournaments: Tournament[] = querySnapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Tournament, "id">;
      return {
        id: doc.id,
        ...data,
      };
    });
    return tournaments;
  } catch (error) {
    console.error("Error al obtener torneos:", error);
    return [];
  }
};

// --- ¡NUEVA FUNCIÓN PARA ACTUALIZAR! ---
export const updateTournament = async (id: string, dataToUpdate: Partial<Tournament>) => {
    try {
        const tournamentDoc = doc(db, "tournaments", id);
        await updateDoc(tournamentDoc, dataToUpdate);
        console.log("Torneo actualizado con éxito:", id);
    } catch (error) {
        console.error("Error al actualizar torneo:", error);
    }
};

// --- ¡NUEVA FUNCIÓN PARA BORRAR! ---
export const deleteTournament = async (id: string) => {
    try {
        const tournamentDoc = doc(db, "tournaments", id);
        await deleteDoc(tournamentDoc);
        console.log("Torneo eliminado con éxito:", id);
    } catch (error) {
        console.error("Error al eliminar torneo:", error);
    }
};