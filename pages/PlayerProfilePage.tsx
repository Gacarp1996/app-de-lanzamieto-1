// pages/PlayerProfilePage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Player, Objective, TrainingSession, Tournament, ObjectiveEstado, TrainingType, TrainingArea, ChartDataPoint, LoggedExercise, IntensityDataPoint } from '../types';
import { OBJECTIVE_ESTADOS, MAX_ACTIVE_OBJECTIVES, EXERCISE_HIERARCHY } from '../constants';
import AreaPieChart from '../components/AreaPieChart';
import IntensityLineChart from '../components/IntensityLineChart';
import TournamentFormModal from '../components/TournamentFormModal';
import Modal from '../components/Modal';
import { addTournament, updateTournament, deleteTournament } from '../Database/FirebaseTournaments';
import { updatePlayer } from '../Database/FirebasePlayers';
import { deleteSession } from '../Database/FirebaseSessions';
import { useAcademy } from '../contexts/AcademyContext'; // <--- CORRECCIÓN: Ahora sí lo usaremos

interface PlayerProfilePageProps {
  players: Player[];
  objectives: Objective[];
  sessions: TrainingSession[];
  tournaments: Tournament[];
  onDataChange: () => void;
}

type Tab = "perfil" | "trainings" | "objectives" | "tournaments";

// Función helper para parsear el tiempo y convertirlo a minutos
const parseTimeToMinutes = (tiempoCantidad: string): number => {
  const cleanTime = tiempoCantidad.trim().toLowerCase();
  const pureNumber = parseFloat(cleanTime);
  if (!isNaN(pureNumber) && cleanTime === pureNumber.toString()) return pureNumber;
  const minuteMatch = cleanTime.match(/(\d+\.?\d*)\s*(m|min|mins|minuto|minutos)/);
  if (minuteMatch) return parseFloat(minuteMatch[1]);
  const hourMatch = cleanTime.match(/(\d+\.?\d*)\s*(h|hr|hrs|hora|horas)/);
  if (hourMatch) return parseFloat(hourMatch[1]) * 60;
  const mixedMatch = cleanTime.match(/(\d+)\s*(h|hr|hrs|hora|horas)?\s*:?\s*(\d+)\s*(m|min|mins|minuto|minutos)?/);
  if (mixedMatch) {
    const hours = parseFloat(mixedMatch[1]) || 0;
    const minutes = parseFloat(mixedMatch[3]) || 0;
    return hours * 60 + minutes;
  }
  return 0;
};

const PlayerProfilePage: React.FC<PlayerProfilePageProps> = ({ players, objectives, sessions, tournaments, onDataChange }) => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const { selectedAcademy } = useAcademy(); // <--- CORRECCIÓN: Obtenemos la academia activa

  // ... (Todos tus demás estados se mantienen igual)
  const [player, setPlayer] = useState<Player | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("perfil");
  const [edad, setEdad] = useState<number | ''>('');
  const [altura, setAltura] = useState<number | ''>('');
  const [peso, setPeso] = useState<number | ''>('');
  const [pesoIdeal, setPesoIdeal] = useState<number | ''>('');
  const [brazoDominante, setBrazoDominante] = useState<'Derecho' | 'Izquierdo'>('Derecho');
  const [canalComunicacion, setCanalComunicacion] = useState('');
  const [ojoDominante, setOjoDominante] = useState<'Derecho' | 'Izquierdo'>('Derecho');
  const [historiaDeportiva, setHistoriaDeportiva] = useState('');
  const [lesionesActuales, setLesionesActuales] = useState('');
  const [lesionesPasadas, setLesionesPasadas] = useState('');
  const [frecuenciaSemanal, setFrecuenciaSemanal] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [drillDownPath, setDrillDownPath] = useState<string[]>([]);
  const [areaChartTitle, setAreaChartTitle] = useState<string>("Distribución por Tipo");
  const [intensityChartTitle, setIntensityChartTitle] = useState<string>("Progresión de Intensidad");
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  
  // ... (Tu useEffect y tus useMemo se mantienen igual)
  useEffect(() => {
    const foundPlayer = players.find(p => p.id === playerId);
    if (foundPlayer) {
      setPlayer(foundPlayer);
      setEdad((foundPlayer as any).edad || '');
      setAltura((foundPlayer as any).altura || '');
      setPeso((foundPlayer as any).peso || '');
      setPesoIdeal((foundPlayer as any).pesoIdeal || '');
      setBrazoDominante((foundPlayer as any).brazoDominante || 'Derecho');
      setCanalComunicacion((foundPlayer as any).canalComunicacion || '');
      setOjoDominante((foundPlayer as any).ojoDominante || 'Derecho');
      setHistoriaDeportiva((foundPlayer as any).historiaDeportiva || '');
      setLesionesActuales((foundPlayer as any).lesionesActuales || '');
      setLesionesPasadas((foundPlayer as any).lesionesPasadas || '');
      setFrecuenciaSemanal((foundPlayer as any).frecuenciaSemanal || '');
    } else if (players.length > 0) {
      navigate('/players');
    }
  }, [playerId, players, navigate]);

  const playerAllObjectives = useMemo(() => objectives.filter(obj => obj.jugadorId === playerId), [objectives, playerId]);
  const playerActualObjectivesCount = useMemo(() => playerAllObjectives.filter(obj => obj.estado === 'actual-progreso').length, [playerAllObjectives]);
  const playerTournaments = useMemo(() => tournaments.filter(t => t.jugadorId === playerId).sort((a,b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()), [tournaments, playerId]);
  const dateFilteredSessions = useMemo(() => {
    let s = sessions.filter(s => (s as any).jugadorId === playerId);
    if (startDate) { const start = new Date(startDate); start.setHours(0,0,0,0); s = s.filter(session => new Date(session.fecha) >= start); }
    if (endDate) { const end = new Date(endDate); end.setHours(23,59,59,999); s = s.filter(session => new Date(session.fecha) <= end); }
    return s.sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [sessions, playerId, startDate, endDate]);
  const drillDownData = useMemo((): ChartDataPoint[] => {
    const timeSums: Record<string, number> = {};
    if (drillDownPath.length === 0) { setAreaChartTitle("Distribución por Tipo (minutos)"); dateFilteredSessions.forEach(s => s.ejercicios.forEach(ex => { const minutes = parseTimeToMinutes(ex.tiempoCantidad); timeSums[ex.tipo] = (timeSums[ex.tipo] || 0) + minutes; })); return Object.entries(timeSums).map(([name, value]) => ({ name, value, type: 'TrainingType' })); }
    else if (drillDownPath.length === 1) { const type = drillDownPath[0] as TrainingType; setAreaChartTitle(`${type}: Por Área (minutos)`); dateFilteredSessions.forEach(s => s.ejercicios.forEach(ex => { if(ex.tipo === type) { const minutes = parseTimeToMinutes(ex.tiempoCantidad); timeSums[ex.area] = (timeSums[ex.area] || 0) + minutes; }})); return Object.entries(timeSums).map(([name, value]) => ({ name, value, type: 'TrainingArea' })); }
    else { const [type, area] = drillDownPath; setAreaChartTitle(`${type} - ${area}: Por Ejercicio (minutos)`); dateFilteredSessions.forEach(s => s.ejercicios.forEach(ex => { if(ex.tipo === type && ex.area === area) { const minutes = parseTimeToMinutes(ex.tiempoCantidad); timeSums[ex.ejercicio] = (timeSums[ex.ejercicio] || 0) + minutes; }})); return Object.entries(timeSums).map(([name, value]) => ({ name, value, type: 'Exercise' })); }
  }, [dateFilteredSessions, drillDownPath]);
  const intensityChartData = useMemo((): IntensityDataPoint[] => {
    let title = "Progresión de Intensidad (General)";
    const data = dateFilteredSessions.map(session => {
        let relevantExercises = session.ejercicios;
        if(drillDownPath.length === 1) { const type = drillDownPath[0] as TrainingType; relevantExercises = session.ejercicios.filter(ex => ex.tipo === type); title = `Intensidad (${type})`;}
        else if (drillDownPath.length === 2) { const [type, area] = drillDownPath; relevantExercises = session.ejercicios.filter(ex => ex.tipo === type && ex.area === area); title = `Intensidad (${type} - ${area})`;}
        const avg = relevantExercises.length > 0 ? relevantExercises.reduce((sum, ex) => sum + ex.intensidad, 0) / relevantExercises.length : 0;
        return { ...session, avgIntensity: avg };
    }).filter(s => s.avgIntensity > 0).map(s => ({ fecha: new Date(s.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }), intensidad: parseFloat(s.avgIntensity.toFixed(1)) }));
    setIntensityChartTitle(title);
    return data.reverse();
  }, [dateFilteredSessions, drillDownPath]);

  // --- CORRECCIÓN: Se agrega academyId a las funciones de base de datos ---
  const handleSaveTournament = async (data: Omit<Tournament, 'id' | 'jugadorId' | 'academyId'>) => {
    if (!selectedAcademy) return alert("Error: No se ha seleccionado una academia.");
    const tournamentData = { ...data, jugadorId: playerId! };
    if (editingTournament) {
      await updateTournament(editingTournament.id, tournamentData);
    } else {
      await addTournament(tournamentData, selectedAcademy.id);
    }
    onDataChange();
    setIsTournamentModalOpen(false);
  };

  const handleProfileSave = async () => {
    if (!player) return;
    const profileData: Partial<Player> = { 
        edad: Number(edad) || undefined, 
        altura: Number(altura) || undefined, 
        peso: Number(peso) || undefined, 
        pesoIdeal: Number(pesoIdeal) || undefined, 
        brazoDominante, canalComunicacion, ojoDominante, historiaDeportiva, lesionesActuales, lesionesPasadas, frecuenciaSemanal, 
    };
    await updatePlayer(player.id, profileData); // updatePlayer no necesita academyId porque busca por el ID único del documento
    onDataChange();
    alert("Perfil actualizado.");
  };

  // ... (el resto de tus funciones se mantienen igual, ya que no interactúan con la BD o ya estaban correctas)
  const handlePieSliceClick = (dataPoint: ChartDataPoint) => { if (!dataPoint.name || (drillDownPath.length > 1 && dataPoint.type === 'Exercise')) return; if (drillDownPath.length < 2) { const currentType = drillDownPath[0] as TrainingType; if (drillDownPath.length === 0 || EXERCISE_HIERARCHY[currentType]?.[dataPoint.name as TrainingArea]) { setDrillDownPath(prev => [...prev, dataPoint.name]); } } };
  const handleBreadcrumbClick = (index: number) => setDrillDownPath(drillDownPath.slice(0, index));
  const resetDateFilters = () => { setStartDate(''); setEndDate(''); };
  const handleOpenAddTournamentModal = () => { setEditingTournament(null); setIsTournamentModalOpen(true); };
  const handleEditTournamentClick = (tournament: Tournament) => { setEditingTournament(tournament); setIsTournamentModalOpen(true); };
  const handleDeleteTournament = async (id: string) => { if (window.confirm("¿Seguro?")) { await deleteTournament(id); onDataChange(); }};
  const handleArchivePlayer = () => setIsArchiveModalOpen(true);
  const confirmArchivePlayer = async () => { if(player) { await updatePlayer(player.id, { estado: 'archivado' }); onDataChange(); navigate('/players'); }};
  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); if (window.confirm("¿Estás seguro de que quieres eliminar este entrenamiento? Esta acción no se puede deshacer.")) { await deleteSession(sessionId); onDataChange(); alert("Entrenamiento eliminado."); } };
  
  if (!player) return <div className="text-center py-10 text-app-secondary">Cargando...</div>;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  // --- El JSX se mantiene exactamente igual que el tuyo, no hay cambios aquí ---
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <Modal isOpen={isArchiveModalOpen} onClose={() => setIsArchiveModalOpen(false)} title="Confirmar Archivar">
        <p>¿Archivar a <strong>{player.name}</strong>?</p>
        <div className="flex justify-end space-x-3 mt-4"><button onClick={() => setIsArchiveModalOpen(false)} className="app-button btn-secondary">Cancelar</button><button onClick={confirmArchivePlayer} className="app-button btn-warning">Sí, Archivar</button></div>
      </Modal>
      {isTournamentModalOpen && playerId && <TournamentFormModal isOpen={isTournamentModalOpen} onClose={() => setIsTournamentModalOpen(false)} onSave={handleSaveTournament} playerId={playerId} existingTournament={editingTournament} />}
      <div className="mb-6 p-6 sm:p-8 bg-app-surface rounded-lg shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-3xl sm:text-4xl font-bold text-app-accent mb-2 break-words">{player.name}</h1>
              <p className="text-sm sm:text-base text-app-secondary">
                <span className="inline-block px-3 py-1 rounded-full bg-app-surface-alt">
                  Estado: <span className="font-medium">{player.estado}</span>
                </span>
              </p>
            </div>
            {player.estado === 'activo' && (<button onClick={handleArchivePlayer} className="app-button btn-warning w-full sm:w-auto px-4 py-2 text-sm sm:text-base">Archivar Jugador</button>)}
        </div>
      </div>
      <div className="mb-6 border-b border-app overflow-x-auto">
        <nav className="flex space-x-1 sm:space-x-4 min-w-max px-2 sm:px-0">
          <button onClick={() => setActiveTab("perfil")} className={`py-3 px-3 sm:px-4 font-medium text-sm sm:text-base ${activeTab === "perfil" ? "border-b-2 border-app-accent text-app-accent" : "text-app-secondary"}`}>Perfil</button>
          <button onClick={() => setActiveTab("trainings")} className={`py-3 px-3 sm:px-4 font-medium text-sm sm:text-base ${activeTab === "trainings" ? "border-b-2 border-app-accent text-app-accent" : "text-app-secondary"}`}>Entrenamientos</button>
          <button onClick={() => setActiveTab("objectives")} className={`py-3 px-3 sm:px-4 font-medium text-sm sm:text-base ${activeTab === "objectives" ? "border-b-2 border-app-accent text-app-accent" : "text-app-secondary"}`}>Objetivos ({playerActualObjectivesCount}/{MAX_ACTIVE_OBJECTIVES})</button>
          <button onClick={() => setActiveTab("tournaments")} className={`py-3 px-3 sm:px-4 font-medium text-sm sm:text-base ${activeTab === "tournaments" ? "border-b-2 border-app-accent text-app-accent" : "text-app-secondary"}`}>Torneos</button>
        </nav>
      </div>
      {activeTab === "objectives" && (
        <section className="bg-app-surface p-6 rounded-lg shadow">
          {/* 👇 TU LINK ESTABA PERFECTO. EL PROBLEMA ERA LA RUTA EN App.tsx 👇 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Objetivos</h2>
            <Link to={`/player/${playerId}/edit-objectives`} className="app-button btn-primary">Gestionar</Link>
          </div>
          {(Object.keys(OBJECTIVE_ESTADOS) as ObjectiveEstado[]).map(estado => {
            const objectivesInState = playerAllObjectives.filter(obj => obj.estado === estado);
            if (objectivesInState.length === 0) return null;
            return (
              <div key={estado} className="mb-6">
                <h3 className="text-xl font-semibold border-b pb-2">{OBJECTIVE_ESTADOS[estado]} ({objectivesInState.length})</h3>
                <ul className="space-y-3 mt-3">{objectivesInState.map(obj => (<li key={obj.id} className="bg-app-surface-alt p-4 rounded"><Link to={`/objective/${obj.id}/edit`} className="text-app-primary"><p>{obj.textoObjetivo}</p></Link></li>))}</ul>
              </div>
            );
          })}
          {playerAllObjectives.length === 0 && <p>No hay objetivos.</p>}
        </section>
      )}
      {/* ... El resto de tu JSX para las otras pestañas ... */}
    </div>
  );
};

export default PlayerProfilePage;