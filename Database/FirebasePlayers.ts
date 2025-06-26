// database/FirebasePlayers.ts


// Database/FirebasePlayers.ts

import { db } from "../firebase/firebase-config";
import { collection, addDoc, getDocs, updateDoc, query, where } from "firebase/firestore";
import { Player } from "../types";
import { doc, getDoc } from "firebase/firestore";

// Referencia a la colección 'players' en Firestore
const playersCollection = collection(db, "players");

// Función para agregar un jugador a Firestore
export const addPlayer = async (playerData: Omit<Player, "id">, academyId: string) => {
  if (!academyId) {
    throw new Error("No se puede crear un jugador sin academyId");
  }
  
  try {
    const docRef = await addDoc(playersCollection, { 
      ...playerData, 
      academyId 
    });
    console.log("Jugador agregado con ID:", docRef.id);
  } catch (error) {
    console.error("Error al agregar jugador:", error);
    throw error;
  }
};

// Puede actualizar cualquier campo de un jugador, incluido su 'estado'.
export const updatePlayer = async (id: string, dataToUpdate: Partial<Player>) => {
  try {
    const playerDoc = doc(db, "players", id);
    await updateDoc(playerDoc, dataToUpdate);
    console.log("Jugador actualizado con éxito:", id);
  } catch (error) {
    console.error("Error al actualizar jugador:", error);
  }
};

// Función para obtener todos los jugadores desde Firestore
export const getPlayers = async (academyId?: string): Promise<Player[]> => {
  if (!academyId) {
    console.warn("No se proporcionó academyId, devolviendo array vacío");
    return [];
  }
  
  try {
    const q = query(playersCollection, where("academyId", "==", academyId));
    const querySnapshot = await getDocs(q);
    
    const players: Player[] = querySnapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Player, "id">;
      return {
        id: doc.id,
        ...data,
      };
    });
    
    console.log(`Jugadores obtenidos para academia ${academyId}:`, players.length);
    return players;
  } catch (error) {
    console.error("Error al obtener jugadores:", error);
    return [];
  }
};

// Función para obtener un jugador por ID
export const getPlayerById = async (id: string): Promise<Player | null> => {
  try {
    const docRef = doc(db, "players", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as Omit<Player, "id">;
      return { id: docSnap.id, ...data };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error al obtener jugador por ID:", error);
    return null;
  }
};