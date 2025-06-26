// Database/FirebaseSessions.ts
import { db } from "../firebase/firebase-config";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where } from "firebase/firestore";
import { TrainingSession } from "../types";

const sessionsCollection = collection(db, "sessions");

export const addSession = async (sessionData: Omit<TrainingSession, "id" | "academyId">, academyId: string) => {
    if (!academyId) throw new Error("El ID de la academia es obligatorio para crear una sesión.");
    const docRef = await addDoc(sessionsCollection, { ...sessionData, academyId });
    return docRef.id;
};

export const getSessions = async (academyId: string): Promise<TrainingSession[]> => {
    if (!academyId) return [];
    const q = query(sessionsCollection, where("academyId", "==", academyId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TrainingSession));
};

export const deleteSession = async (sessionId: string): Promise<void> => {
    if (!sessionId) throw new Error('ID de sesión no proporcionado');
    const sessionDoc = doc(db, "sessions", sessionId);
    await deleteDoc(sessionDoc);
};

export const updateSession = async (sessionId: string, updates: Partial<Omit<TrainingSession, "id">>): Promise<void> => {
    if (!sessionId) throw new Error('ID de sesión no proporcionado');
    const sessionDoc = doc(db, "sessions", sessionId);
    await updateDoc(sessionDoc, updates);
};