// Database/FirebaseAcademies.ts
import { db } from "../firebase/firebase-config";
import { collection, addDoc, getDocs, query, where, updateDoc, arrayUnion, doc, DocumentData, QuerySnapshot } from "firebase/firestore";
import { Academy } from "../types";
import { customAlphabet } from 'nanoid';

const academiesCollection = collection(db, "academies");
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

export const createAcademy = async (academyName: string, directorId: string): Promise<string> => {
  const shareId = nanoid();
  // Esta es la estructura que debe coincidir con la Interfaz Omit<Academy, "id">
  const newAcademy: Omit<Academy, "id"> = {
    name: academyName,
    shareId,
    idDirector: directorId,
    entrenadores: [], 
  };
  const docRef = await addDoc(academiesCollection, newAcademy);
  return docRef.id;
};

export const joinAcademy = async (shareId: string, userId: string): Promise<Academy | null> => {
  const q = query(academiesCollection, where("shareId", "==", shareId.toUpperCase()));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    console.error("No se encontró ninguna academia con ese ID.");
    return null;
  }

  const academyDoc = querySnapshot.docs[0];
  const academyData = { id: academyDoc.id, ...academyDoc.data() } as Academy;

  if (academyData.idDirector !== userId && !academyData.entrenadores.includes(userId)) {
      await updateDoc(doc(db, "academies", academyDoc.id), {
        entrenadores: arrayUnion(userId)
      });
      return { ...academyData, entrenadores: [...academyData.entrenadores, userId] };
  }

  return academyData;
};

export const getAcademiesForUser = async (userId: string): Promise<Academy[]> => {
  const directorQuery = query(academiesCollection, where("idDirector", "==", userId));
  const entrenadorQuery = query(academiesCollection, where("entrenadores", "array-contains", userId));

  const [directorSnapshot, entrenadorSnapshot] = await Promise.all([
    getDocs(directorQuery),
    getDocs(entrenadorQuery)
  ]);

  const academiesMap = new Map<string, Academy>();

  const processSnapshot = (snapshot: QuerySnapshot<DocumentData>) => {
    snapshot.docs.forEach(doc => {
      if (!academiesMap.has(doc.id)) {
        academiesMap.set(doc.id, { id: doc.id, ...doc.data() } as Academy);
      }
    });
  };

  processSnapshot(directorSnapshot);
  processSnapshot(entrenadorSnapshot);

  return Array.from(academiesMap.values());
};