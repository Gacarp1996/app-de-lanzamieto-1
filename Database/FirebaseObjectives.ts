// Database/FirebaseObjectives.ts

import { db } from "../firebase/firebase-config";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { Objective } from "../types";

const objectivesCollection = collection(db, "objectives");

export const addObjective = async (objectiveData: Omit<Objective, "id">, academyId: string) => {
  if (!academyId) {
    throw new Error("No se puede crear un objetivo sin academyId");
  }
  
  try {
    const docRef = await addDoc(objectivesCollection, { 
      ...objectiveData, 
      academyId 
    });
    console.log("Objetivo agregado con ID:", docRef.id);
  } catch (error) {
    console.error("Error al agregar objetivo:", error);
    throw error;
  }
};

export const getObjectives = async (academyId?: string): Promise<Objective[]> => {
  if (!academyId) {
    console.warn("No se proporcionó academyId, devolviendo array vacío");
    return [];
  }
  
  try {
    const q = query(objectivesCollection, where("academyId", "==", academyId));
    const querySnapshot = await getDocs(q);
    
    const objectives: Objective[] = querySnapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Objective, "id">;
      return {
        id: doc.id,
        ...data,
      };
    });
    
    console.log(`Objetivos obtenidos para academia ${academyId}:`, objectives.length);
    return objectives;
  } catch (error) {
    console.error("Error al obtener objetivos:", error);
    return [];
  }
};

// Esta función ahora puede actualizar cualquier campo del objetivo
export const updateObjective = async (id: string, dataToUpdate: Partial<Objective>) => {
  try {
    const objectiveDoc = doc(db, "objectives", id);
    await updateDoc(objectiveDoc, dataToUpdate);
    console.log("Objetivo actualizado con éxito:", id);
  } catch (error) {
    console.error("Error al actualizar objetivo:", error);
  }
};

// Función para borrar objetivo
export const deleteObjective = async (id: string) => {
  try {
    const objectiveDoc = doc(db, "objectives", id);
    await deleteDoc(objectiveDoc);
    console.log("Objetivo eliminado con éxito:", id);
  } catch (error) {
    console.error("Error al eliminar objetivo:", error);
  }
};