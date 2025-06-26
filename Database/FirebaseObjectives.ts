// Database/FirebaseObjectives.ts
import { db } from "../firebase/firebase-config";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { Objective } from "../types";

const objectivesCollection = collection(db, "objectives");

export const addObjective = async (objectiveData: Omit<Objective, "id" | "academyId">, academyId: string) => {
    if (!academyId) throw new Error("El ID de la academia es obligatorio para crear un objetivo.");
    await addDoc(objectivesCollection, { ...objectiveData, academyId });
};

export const getObjectives = async (academyId: string): Promise<Objective[]> => {
    if (!academyId) return [];
    const q = query(objectivesCollection, where("academyId", "==", academyId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Objective));
};

export const updateObjective = async (id: string, dataToUpdate: Partial<Objective>) => {
    const objectiveDoc = doc(db, "objectives", id);
    await updateDoc(objectiveDoc, dataToUpdate);
};

export const deleteObjective = async (id: string) => {
    const objectiveDoc = doc(db, "objectives", id);
    await deleteDoc(objectiveDoc);
};