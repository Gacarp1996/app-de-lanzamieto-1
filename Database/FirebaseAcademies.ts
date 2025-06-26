// Database/FirebaseAcademies.ts

import { db } from "../firebase/firebase-config";
import { collection, addDoc, getDocs, query, where, updateDoc, arrayUnion, doc } from "firebase/firestore";
import { Academy } from "../types";
import { customAlphabet } from 'nanoid';

const academiesCollection = collection(db, "academies");

// Generador de ID para compartir (6 caracteres, alfanumérico, mayúsculas)
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

export const createAcademy = async (academyName: string, ownerId: string): Promise<string> => {
  const shareId = nanoid();
  const newAcademy: Omit<Academy, "id"> = {
    name: academyName,
    shareId,
    ownerId,
    members: [ownerId], // El creador es el primer miembro
  };
  const docRef = await addDoc(academiesCollection, newAcademy);
  return docRef.id;
};

export const joinAcademy = async (shareId: string, userId: string): Promise<boolean> => {
  const q = query(academiesCollection, where("shareId", "==", shareId.toUpperCase()));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    console.error("No se encontró ninguna academia con ese ID.");
    return false;
  }

  const academyDoc = querySnapshot.docs[0];
  await updateDoc(doc(db, "academies", academyDoc.id), {
    members: arrayUnion(userId)
  });
  return true;
};

export const getAcademiesForUser = async (userId: string): Promise<Academy[]> => {
  const q = query(academiesCollection, where("members", "array-contains", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Academy));
};