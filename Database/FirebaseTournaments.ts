// Database/FirebaseTournaments.ts
import { db } from "../firebase/firebase-config";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { Tournament } from "../types";

const tournamentsCollection = collection(db, "tournaments");

export const addTournament = async (tournamentData: Omit<Tournament, "id" | "academyId">, academyId: string) => {
    if (!academyId) throw new Error("El ID de la academia es obligatorio para crear un torneo.");
    await addDoc(tournamentsCollection, { ...tournamentData, academyId });
};

export const getTournaments = async (academyId: string): Promise<Tournament[]> => {
    if (!academyId) return [];
    const q = query(tournamentsCollection, where("academyId", "==", academyId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tournament));
};

export const updateTournament = async (id: string, dataToUpdate: Partial<Tournament>) => {
    const tournamentDoc = doc(db, "tournaments", id);
    await updateDoc(tournamentDoc, dataToUpdate);
};

export const deleteTournament = async (id: string) => {
    const tournamentDoc = doc(db, "tournaments", id);
    await deleteDoc(tournamentDoc);
};