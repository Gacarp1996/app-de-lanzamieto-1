// App.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { TrainingProvider } from './contexts/TrainingContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AcademyProvider, useAcademy } from './contexts/AcademyContext';

import { getPlayers } from "./Database/FirebasePlayers";
import { getObjectives } from './Database/FirebaseObjectives';
import { getSessions } from './Database/FirebaseSessions';
import { getTournaments } from './Database/FirebaseTournaments';

import GlobalHeader from './components/GlobalHeader';
import ProtectedRoute from './components/protectedRoute';
import LoginPage from './pages/LoginPage';
import AcademySelectorPage from './pages/AcademySelectorPage';
import HomePage from './pages/HomePage';
import PlayersListPage from './pages/PlayersListPage';
import StartTrainingPage from './pages/StartTrainingPage';
import TrainingSessionPage from './pages/TrainingSessionPage';
import PlayerProfilePage from './pages/PlayerProfilePage';
import EditObjectivesPage from './pages/EditObjectivesPage';
import SessionDetailPage from './pages/SessionDetailPage';

import { Player, Objective, TrainingSession, Tournament } from './types';

// Layout principal que contiene toda la app después de seleccionar academia
const AppLayout: React.FC<{ academyId: string }> = ({ academyId }) => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [objectives, setObjectives] = useState<Objective[]>([]);
    const [sessions, setSessions] = useState<TrainingSession[]>([]);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!academyId) return;
        setLoading(true);
        try {
            const [playersData, objectivesData, sessionsData, tournamentsData] = await Promise.all([
                getPlayers(academyId),
                getObjectives(academyId),
                getSessions(academyId),
                getTournaments(academyId)
            ]);
            setPlayers(playersData);
            setObjectives(objectivesData);
            setSessions(sessionsData);
            setTournaments(tournamentsData);
        } catch (error) {
            console.error("Error fetching data for academy:", error);
        } finally {
            setLoading(false);
        }
    }, [academyId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return <div className="text-center py-10">Cargando datos de la academia...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col pt-[60px]">
            <GlobalHeader />
            <main className="container mx-auto p-4 flex-grow">
                 <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/players" element={<PlayersListPage players={players} onDataChange={fetchData} />} />
                    <Route path="/start-training" element={<StartTrainingPage players={players} />} />
                    <Route path="/player/:playerId" element={<PlayerProfilePage players={players} objectives={objectives} sessions={sessions} tournaments={tournaments} onDataChange={fetchData} />} />
                    
                    {/* 👇 ESTA ES LA RUTA CLAVE QUE SOLUCIONA EL PROBLEMA 👇 */}
                    <Route path="/player/:playerId/edit-objectives" element={<EditObjectivesPage players={players} allObjectives={objectives} onDataChange={fetchData} />} />
                    
                    <Route path="/training/:playerIds" element={<TrainingSessionPage allPlayers={players} allObjectives={objectives} allTournaments={tournaments} onDataChange={fetchData} />} />
                    <Route path="/session/:sessionId" element={<SessionDetailPage sessions={sessions} players={players} />} />
                    
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
        </div>
    );
};

// ... El resto del archivo es el mismo que te pasé antes ...
const AppContent: React.FC = () => { /* ... */ };
const App: React.FC = () => { /* ... */ };

// (Asegúrate de tener el resto del código para AppContent y App aquí)