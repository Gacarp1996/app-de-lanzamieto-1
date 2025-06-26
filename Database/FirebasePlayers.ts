// Database/FirebasePlayers.ts
import { db } from "../firebase/firebase-config";
import { collection, addDoc, getDocs, updateDoc, query, where, doc, getDoc } from "firebase/firestore";
import { Player } from "../types";

const playersCollection = collection(db, "players");

export const addPlayer = async (playerData: Omit<Player, "id" | "academyId">, academyId: string) => {
  if (!academyId) throw new Error("El ID de la academia es obligatorio para crear un jugador.");
  await addDoc(playersCollection, { ...playerData, academyId });
};

export const updatePlayer = async (id: string, dataToUpdate: Partial<Player>) => {
  const playerDoc = doc(db, "players", id);
  await updateDoc(playerDoc, dataToUpdate);
};

export const getPlayers = async (academyId: string): Promise<Player[]> => {
  if (!academyId) return [];
  const q = query(playersCollection, where("academyId", "==", academyId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
};

export const getPlayerById = async (id: string): Promise<Player | null> => {
  const docRef = doc(db, "players", id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Player : null;
};