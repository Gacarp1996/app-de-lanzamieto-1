// pages/StartTrainingPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '../types';

interface StartTrainingPageProps {
  players: Player[];
}

const StartTrainingPage: React.FC<StartTrainingPageProps> = ({ players }) => {
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const navigate = useNavigate();

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayerIds(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleStartSession = () => {
    if (selectedPlayerIds.length > 0) {
      const ids = selectedPlayerIds.join(',');
      navigate(`/training/${ids}`);
    }
  };
  
  const activePlayers = players.filter(p => p.estado === 'activo');

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Comenzar Entrenamiento</h1>

      {activePlayers.length > 0 ? (
        <div className="bg-app-surface p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Selecciona los jugadores:</h2>
          <div className="space-y-3">
            {activePlayers.map(player => (
              <label
                key={player.id}
                className={`flex items-center p-4 rounded-md cursor-pointer transition-all ${
                  selectedPlayerIds.includes(player.id)
                    ? 'bg-app-accent text-white shadow-inner'
                    : 'bg-app-surface-alt hover:bg-gray-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedPlayerIds.includes(player.id)}
                  onChange={() => handlePlayerToggle(player.id)}
                  className="hidden" // Ocultamos el checkbox real
                />
                <span className="font-medium text-lg">{player.name}</span>
              </label>
            ))}
          </div>
          <button
            onClick={handleStartSession}
            disabled={selectedPlayerIds.length === 0}
            className="mt-6 w-full app-button btn-success disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Comenzar Sesión ({selectedPlayerIds.length})
          </button>
        </div>
      ) : (
        <div className="text-center p-8 bg-app-surface rounded-lg">
          <p className="text-app-secondary text-lg">No tienes jugadores activos.</p>
          <p className="mt-2 text-app-secondary">Por favor, ve a la sección de "Gestión de Jugadores" para agregar uno.</p>
        </div>
      )}
    </div>
  );
};

export default StartTrainingPage;