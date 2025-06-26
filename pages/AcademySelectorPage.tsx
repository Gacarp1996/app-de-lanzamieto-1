// pages/AcademySelectorPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAcademy } from '../contexts/AcademyContext';
import { createAcademy, joinAcademy, getAcademiesForUser } from '../Database/FirebaseAcademies';
import { Academy } from '../types';

const AcademySelectorPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { selectAcademy } = useAcademy();
  const [userAcademies, setUserAcademies] = useState<Academy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newAcademyName, setNewAcademyName] = useState('');
  const [joinShareId, setJoinShareId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAcademies = useCallback(async () => {
    if (currentUser) {
      setIsLoading(true);
      const academies = await getAcademiesForUser(currentUser.uid);
      setUserAcademies(academies);
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchAcademies();
  }, [fetchAcademies]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (currentUser && newAcademyName.trim()) {
      try {
        await createAcademy(newAcademyName, currentUser.uid);
        setNewAcademyName('');
        setSuccess(`¡Academia "${newAcademyName}" creada!`);
        fetchAcademies();
      } catch (e) {
        setError('Error al crear la academia.');
      }
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (currentUser && joinShareId.trim()) {
      try {
        const joinedAcademy = await joinAcademy(joinShareId, currentUser.uid);
        if (joinedAcademy) {
          setJoinShareId('');
          setSuccess(`¡Te uniste a "${joinedAcademy.name}"!`);
          fetchAcademies();
        } else {
          setError("ID de academia no válido o incorrecto.");
        }
      } catch (e) {
        setError("Error al unirse a la academia.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-app-background">
      <div className="w-full max-w-4xl p-8 space-y-8 bg-app-surface rounded-lg shadow-xl m-4">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-app-accent">Bienvenido a TenisCoaching</h1>
            <p className="text-app-secondary mt-2">Para continuar, selecciona una academia, crea una nueva o únete a una existente.</p>
        </div>

        {isLoading ? (
            <div className="text-center">Cargando academias...</div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-center">Mis Academias</h2>
              {userAcademies.length > 0 ? (
                <ul className="space-y-3 max-w-md mx-auto">
                  {userAcademies.map(academy => (
                    <li key={academy.id}>
                      <button
                        onClick={() => selectAcademy(academy)}
                        className="w-full text-left p-4 bg-gray-700 rounded-lg shadow-md hover:bg-app-accent hover:text-white transition-colors"
                      >
                        <p className="font-bold text-lg">{academy.name}</p>
                        <p className="text-xs text-gray-400">ID para compartir: <span className="font-mono bg-gray-800 px-1 rounded">{academy.shareId}</span></p>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-app-secondary text-center">Aún no eres miembro de ninguna academia.</p>
              )}
            </div>

            {error && <p className="text-red-500 text-center bg-red-100 p-2 rounded-md">{error}</p>}
            {success && <p className="text-green-500 text-center bg-green-100 p-2 rounded-md">{success}</p>}

            <div className="grid md:grid-cols-2 gap-8 border-t border-gray-700 pt-8">
              <form onSubmit={handleCreate} className="space-y-3">
                <h3 className="text-xl font-semibold text-center">Crear una nueva Academia</h3>
                <input
                  type="text"
                  value={newAcademyName}
                  onChange={e => setNewAcademyName(e.target.value)}
                  placeholder="Nombre de la academia"
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md"
                />
                <button type="submit" className="w-full p-2 bg-green-600 hover:bg-green-700 rounded-md">Crear</button>
              </form>

              <form onSubmit={handleJoin} className="space-y-3">
                <h3 className="text-xl font-semibold text-center">Unirse a una Academia</h3>
                <input
                  type="text"
                  value={joinShareId}
                  onChange={e => setJoinShareId(e.target.value.toUpperCase())}
                  placeholder="ID para compartir de 6 caracteres"
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md uppercase"
                  maxLength={6}
                />
                <button type="submit" className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded-md">Unirse</button>
              </form>
            </div>
          </>
        )}
         <div className="text-center pt-8 border-t border-gray-700">
            <button onClick={logout} className="text-gray-400 hover:text-app-accent underline">
                Cerrar sesión
            </button>
        </div>
      </div>
    </div>
  );
};

export default AcademySelectorPage;