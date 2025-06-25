import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { TrainingProvider } from './contexts/TrainingContext';
import { AuthProvider } from './contexts/AuthContext'; // Importar AuthProvider
import { getPlayers } from "./Database/FirebasePlayers";
import { getObjectives } from './Database/FirebaseObjectives';
import { getSessions } from './Database/FirebaseSessions';
import { getTournaments } from './Database/FirebaseTournaments';

// Componentes y Páginas
import GlobalHeader from './components/GlobalHeader';
import ProtectedRoute from './components/ProtectedRoute'; // Importar Ruta Protegida
import LoginPage from './pages/LoginPage'; // Importar página de Login
import PlayersListPage from './pages/PlayersListPage';
import HomePage from './pages/HomePage';
import StartTrainingPage from './pages/StartTrainingPage';
import TrainingSessionPage from './pages/TrainingSessionPage';
import PlayerProfilePage from './pages/PlayerProfilePage';
import EditObjectivesPage from './pages/EditObjectivesPage';
import ObjectiveDetailPage from './pages/ObjectiveDetailPage';
import SessionDetailPage from './pages/SessionDetailPage';
import { Player, Objective, TrainingSession, Tournament } from './types';

// Componente principal para el layout de la aplicación
const AppLayout: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  const fetchData = async () => {
    setPlayers(await getPlayers());
    setObjectives(await getObjectives());
    setSessions(await getSessions());
    setTournaments(await getTournaments());
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <TrainingProvider>
      <div className="min-h-screen flex flex-col pt-[60px]">
        <GlobalHeader />
        {/* El nav ya no es necesario aquí si se protege todo */}
        <main className="container mx-auto p-4 flex-grow">
          <Routes>
                {/* Las rutas que quieres proteger van dentro de ProtectedRoute */}
                <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/players" element={<ProtectedRoute><PlayersListPage players={players} onDataChange={fetchData} /></ProtectedRoute>} />
                <Route path="/player/:playerId" element={<ProtectedRoute><PlayerProfilePage players={players} objectives={objectives} sessions={sessions} tournaments={tournaments} onDataChange={fetchData} /></ProtectedRoute>} />
                <Route path="/start-training" element={<ProtectedRoute><StartTrainingPage players={players} /></ProtectedRoute>} />
                <Route path="/training/:playerId" element={<ProtectedRoute><TrainingSessionPage allPlayers={players} allObjectives={objectives} allTournaments={tournaments} onDataChange={fetchData}/></ProtectedRoute>} />
                <Route path="/session/:sessionId" element={<ProtectedRoute><SessionDetailPage sessions={sessions} players={players} /></ProtectedRoute>} />
                <Route path="/objective/:objectiveId/edit" element={<ProtectedRoute><ObjectiveDetailPage allObjectives={objectives} players={players} onDataChange={fetchData} /></ProtectedRoute>} />
                <Route path="/player/:playerId/edit-objectives" element={<ProtectedRoute><EditObjectivesPage players={players} allObjectives={objectives} onDataChange={fetchData} /></ProtectedRoute>} />
          </Routes>
        </main>
        <footer className="bg-app-footer text-center text-sm p-3 text-app-footer">
          © 2024 TenisCoaching App
        </footer>
      </div>
    </TrainingProvider>
  );
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <HashRouter>
        <AuthProvider> {/* AuthProvider envuelve todo */}
          <Routes>
            {/* La ruta de Login queda FUERA del layout principal */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Todas las demás rutas usan el AppLayout y están protegidas */}
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </AuthProvider>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;