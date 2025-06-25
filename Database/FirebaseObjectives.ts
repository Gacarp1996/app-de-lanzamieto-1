import { db } from "../firebase/firebase-config";
// Añadimos deleteDoc para poder borrar
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Objective } from "../types";

const objectivesCollection = collection(db, "objectives");

export const addObjective = async (objectiveData: Omit<Objective, "id">) => {
  try {
    const docRef = await addDoc(objectivesCollection, objectiveData);
    console.log("Objetivo agregado con ID:", docRef.id);
  } catch (error) {
    console.error("Error al agregar objetivo:", error);
  }
};

export const getObjectives = async (): Promise<Objective[]> => {
  try {
    const querySnapshot = await getDocs(objectivesCollection);
    const objectives: Objective[] = querySnapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Objective, "id">;
      return {
        id: doc.id,
        ...data,
      };
    });
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

// --- ¡NUEVA FUNCIÓN PARA BORRAR! ---
export const deleteObjective = async (id: string) => {
  try {
    const objectiveDoc = doc(db, "objectives", id);
    await deleteDoc(objectiveDoc);
    console.log("Objetivo eliminado con éxito:", id);
  } catch (error) {
    console.error("Error al eliminar objetivo:", error);
  }
};