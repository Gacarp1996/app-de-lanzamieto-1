// pages/PlayersListPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Player } from '../types';
import { addPlayer, updatePlayer } from '../Database/FirebasePlayers';
import { useAcademy } from '../contexts/AcademyContext';

interface PlayersListPageProps {
  players: Player[];
  onDataChange: () => void;
}

const PlayersListPage: React.FC<PlayersListPageProps> = ({ players, onDataChange }) => {
  const { selectedAcademy } = useAcademy();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim() || !selectedAcademy) return;

    const newPlayerData = {
      name: newPlayerName.trim(),
      estado: 'activo' as const,
    };
    
    await addPlayer(newPlayerData, selectedAcademy.id);
    setNewPlayerName('');
    onDataChange();
  };
  
  const handleSaveEdit = async (id: string, newName: string) => {
      if (!newName.trim()) { // Evita guardar nombres vacíos
          setEditingPlayer(null);
          return;
      }
      await updatePlayer(id, { name: newName });
      setEditingPlayer(null);
      onDataChange();
  };

  const activePlayers = players.filter(p => p.estado === 'activo');
  const archivedPlayers = players.filter(p => p.estado === 'archivado');

  return (
    <div>
        <h1 className="text-2xl font-bold mb-4">Gestión de Jugadores</h1>
        
        <form onSubmit={handleAddPlayer} className="mb-6 p-4 bg-gray-800 rounded-lg flex items-center gap-4">
            <input 
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Nombre del nuevo jugador"
                className="p-2 border rounded bg-gray-700 border-gray-600 flex-grow"
            />
            <button type="submit" className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Agregar Jugador
            </button>
        </form>

        <div className="grid md:grid-cols-2 gap-8">
            <div>
                <h2 className="text-xl font-semibold mb-2">Jugadores Activos</h2>
                <ul className="space-y-2">
                    {activePlayers.map(player => (
                        <li key={player.id} className="p-2 bg-gray-800 rounded flex justify-between items-center">
                            {editingPlayer?.id === player.id ? (
                                <input 
                                    type="text" 
                                    defaultValue={player.name}
                                    onBlur={(e) => handleSaveEdit(player.id, e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(player.id, (e.target as HTMLInputElement).value)}
                                    className="bg-gray-700 p-1 rounded"
                                    autoFocus
                                />
                            ) : (
                                <>
                                    <Link to={`/player/${player.id}`} className="text-blue-400 hover:underline">
                                        {player.name}
                                    </Link>
                                    <button onClick={() => setEditingPlayer(player)} className="ml-4 text-sm text-gray-400 hover:text-white">Editar</button>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* 👇 AQUÍ ESTÁ LA CORRECCIÓN 👇 */}
            {/* Añadimos la lista para los jugadores archivados */}
            <div>
                <h2 className="text-xl font-semibold mb-2">Jugadores Archivados</h2>
                {archivedPlayers.length > 0 ? (
                    <ul className="space-y-2">
                        {archivedPlayers.map(player => (
                            <li key={player.id} className="p-2 bg-gray-900 rounded text-gray-500">
                                {player.name}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No hay jugadores archivados.</p>
                )}
            </div>
        </div>
    </div>
  );
};

export default PlayersListPage;