import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { TrainingSession, Player } from '../types';

interface SessionDetailPageProps {
  sessions: TrainingSession[];
  players: Player[];
}

const SessionDetailPage: React.FC<SessionDetailPageProps> = ({ sessions, players }) => {
  const { sessionId } = useParams<{ sessionId: string }>();

  const session = sessions.find(s => s.id === sessionId);
  const player = session ? players.find(p => p.id === session.jugadorId) : null;

  if (!session || !player) {
    return <div className="text-center py-10 text-app-secondary">Sesión no encontrada o cargando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-app-accent mb-2">Detalles del Entrenamiento</h1>
      <p className="text-xl text-app-secondary mb-6">
        Jugador: {player.name} | Fecha: {new Date(session.fecha).toLocaleDateString('es-ES')}
      </p>

      <div className="bg-app-surface p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-app-accent mb-4">Ejercicios Realizados</h2>
        {session.ejercicios.length > 0 ? (
          <ul className="space-y-3 list-disc list-inside">
            {session.ejercicios.map((ex, index) => (
              <li key={index} className="text-app-primary">
                {ex.tipo} - {ex.area} - {ex.ejercicio} 
                <span className="text-app-secondary text-sm"> (Tiempo: {ex.tiempoCantidad} min, Intensidad: {ex.intensidad})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-app-secondary">No se registraron ejercicios en esta sesión.</p>
        )}
      </div>

      {session.observaciones && (
        <div className="bg-app-surface p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-semibold text-app-accent mb-4">Observaciones</h2>
          <p className="text-app-primary whitespace-pre-wrap">{session.observaciones}</p>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link to={`/player/${player.id}`} className="app-link font-medium">
          &larr; Volver al Perfil de {player.name}
        </Link>
      </div>
    </div>
  );
};

export default SessionDetailPage;