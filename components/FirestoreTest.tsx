import { useEffect } from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "../firebase/firebase-config"; // Asegurate que la ruta sea correcta

export default function FirestoreTest() {
  useEffect(() => {
    const db = getFirestore(app);
    const testWrite = async () => {
      try {
        const docRef = await addDoc(collection(db, "testData"), {
          name: "Gabriel",
          createdAt: new Date()
        });
        console.log("🟢 Documento escrito con ID:", docRef.id);
      } catch (error) {
        console.error("🔴 Error al escribir:", error);
      }
    };
    testWrite();
  }, []);

  return <div>Probando escritura en Firestore...</div>;
}
