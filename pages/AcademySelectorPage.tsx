// pages/AcademySelectorPage.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAcademy } from '../contexts/AcademyContext';
import { createAcademy, joinAcademy, getAcademiesForUser } from '../Database/FirebaseAcademies';
import { Academy } from '../types';

const AcademySelectorPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { selectAcademy } = useAcademy();
  const [userAcademies, setUserAcademies] = useState<Academy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para los formularios
  const [newAcademyName, setNewAcademyName] = useState('');
  const [joinShareId, setJoinShareId] = useState('');

  const fetchAcademies = async () => {
    if (currentUser) {
      setIsLoading(true);
      const academies = await getAcademiesForUser(currentUser.uid);
      setUserAcademies(academies);
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAcademies();
  }, [currentUser]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser && newAcademyName.trim()) {
      await createAcademy(newAcademyName, currentUser.uid);
      setNewAcademyName('');
      fetchAcademies(); // Recargar la lista
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser && joinShareId.trim()) {
      const success = await joinAcademy(joinShareId, currentUser.uid);
      if(success) {
        setJoinShareId('');
        fetchAcademies(); // Recargar la lista
      } else {
        alert("ID de academia no válido o incorrecto.");
      }
    }
  };
  
  if (isLoading) return <div>Cargando academias...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-app-accent">Selecciona tu Academia</h1>
      
      {/* Lista de Academias del Usuario */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Mis Academias</h2>
        {userAcademies.length > 0 ? (
          <ul className="space-y-3">
            {userAcademies.map(academy => (
              <li key={academy.id}>
                <button 
                  onClick={() => selectAcademy(academy)} 
                  className="w-full p-4 bg-app-surface rounded-lg shadow hover:bg-app-surface-alt"
                >
                  {academy.name} (ID para compartir: {academy.shareId})
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-app-secondary">Aún no eres miembro de ninguna academia.</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Crear Academia */}
        <form onSubmit={handleCreate} className="bg-app-surface p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-3">Crear una nueva Academia</h2>
          <input
            type="text"
            value={newAcademyName}
            onChange={e => setNewAcademyName(e.target.value)}
            placeholder="Nombre de la academia"
            className="w-full p-2 app-input mb-3"
          />
          <button type="submit" className="app-button btn-success w-full">Crear</button>
        </form>
        
        {/* Unirse a Academia */}
        <form onSubmit={handleJoin} className="bg-app-surface p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-3">Unirse a una Academia</h2>
          <input
            type="text"
            value={joinShareId}
            onChange={e => setJoinShareId(e.target.value)}
            placeholder="ID para compartir"
            className="w-full p-2 app-input mb-3"
          />
          <button type="submit" className="app-button btn-primary w-full">Unirse</button>
        </form>
      </div>
    </div>
  );
};

export default AcademySelectorPage;