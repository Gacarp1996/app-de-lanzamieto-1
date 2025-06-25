import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Player, Objective, TrainingSession, Tournament, ObjectiveEstado, TrainingType, ChartDataPoint, IntensityDataPoint } from '../types';
import { OBJECTIVE_ESTADOS, MAX_ACTIVE_OBJECTIVES } from '../constants';
import AreaPieChart from '../components/AreaPieChart';
import IntensityLineChart from '../components/IntensityLineChart';
import TournamentFormModal from '../components/TournamentFormModal';
import Modal from '../components/Modal';
import { addTournament, updateTournament, deleteTournament } from '../Database/FirebaseTournaments';
import { updatePlayer } from '../Database/FirebasePlayers';
import { deleteSession } from '../Database/FirebaseSessions';

// --- PROPS INTERFACE ---
interface PlayerProfilePageProps {
  players: Player[];
  objectives: Objective[];
  sessions: TrainingSession[];
  tournaments: Tournament[];
  onDataChange: () => void;
}

type Tab = "perfil" | "trainings" | "objectives" | "tournaments";

// --- HELPER FUNCTION ---
// Función helper para parsear el tiempo y convertirlo a minutos
const parseTimeToMinutes = (tiempoCantidad: string): number => {
  if (!tiempoCantidad) return 0;
  const cleanTime = tiempoCantidad.trim().toLowerCase();
  const pureNumber = parseFloat(cleanTime);
  if (!isNaN(pureNumber) && cleanTime === pureNumber.toString()) return pureNumber;
  const minuteMatch = cleanTime.match(/(\d+\.?\d*)\s*(m|min|mins|minuto|minutos)/);
  if (minuteMatch) return parseFloat(minuteMatch[1]);
  const hourMatch = cleanTime.match(/(\d+\.?\d*)\s*(h|hr|hrs|hora|horas)/);
  if (hourMatch) return parseFloat(hourMatch[1]) * 60;
  const mixedMatch = cleanTime.match(/(\d+)\s*(h|hr|hrs|hora|horas)?\s*:?\s*(\d+)\s*(m|min|mins|minuto|minutos)?/);
  if (mixedMatch) return (parseFloat(mixedMatch[1]) || 0) * 60 + (parseFloat(mixedMatch[3]) || 0);
  return 0;
};

// --- COMPONENT ---
const PlayerProfilePage: React.FC<PlayerProfilePageProps> = ({ players, objectives, sessions, tournaments, onDataChange }) => {
  // --- HOOKS ---
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();

  // --- STATE ---
  const [player, setPlayer] = useState<Player | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("perfil");
  
  // State for Profile Form
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

  // State for Trainings Tab
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [drillDownPath, setDrillDownPath] = useState<string[]>([]);
  const [areaChartTitle, setAreaChartTitle] = useState<string>("Distribución por Tipo (minutos)");
  const [intensityChartTitle, setIntensityChartTitle] = useState<string>("Progresión de Intensidad");

  // State for Modals & Notifications
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [tournamentToDelete, setTournamentToDelete] = useState<Tournament | null>(null);
  const [notification, setNotification] = useState<string>('');


  // --- EFFECTS ---
  // Effect to set player data when props change
  useEffect(() => {
    const foundPlayer = players.find(p => p.id === playerId);
    if (foundPlayer) {
      setPlayer(foundPlayer);
      setEdad(foundPlayer.edad || '');
      setAltura(foundPlayer.altura || '');
      setPeso(foundPlayer.peso || '');
      setPesoIdeal(foundPlayer.pesoIdeal || '');
      setBrazoDominante(foundPlayer.brazoDominante || 'Derecho');
      setCanalComunicacion(foundPlayer.canalComunicacion || '');
      setOjoDominante(foundPlayer.ojoDominante || 'Derecho');
      setHistoriaDeportiva(foundPlayer.historiaDeportiva || '');
      setLesionesActuales(foundPlayer.lesionesActuales || '');
      setLesionesPasadas(foundPlayer.lesionesPasadas || '');
      setFrecuenciaSemanal(foundPlayer.frecuenciaSemanal || '');
    } else if (players.length > 0) {
      // If players are loaded but this one isn't found, redirect.
      navigate('/players');
    }
  }, [playerId, players, navigate]);

  // Effect to clear notification message after a few seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);


  // --- MEMOIZED CALCULATIONS ---
  const playerAllObjectives = useMemo(() => objectives.filter(obj => obj.jugadorId === playerId), [objectives, playerId]);
  const playerActualObjectivesCount = useMemo(() => playerAllObjectives.filter(obj => obj.estado === 'actual-progreso').length, [playerAllObjectives]);
  const playerTournaments = useMemo(() => tournaments.filter(t => t.jugadorId === playerId).sort((a,b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()), [tournaments, playerId]);
  
  const dateFilteredSessions = useMemo(() => {
    let s = sessions.filter(s => s.jugadorId === playerId);
    if (startDate) { const start = new Date(startDate); start.setHours(0,0,0,0); s = s.filter(session => new Date(session.fecha) >= start); }
    if (endDate) { const end = new Date(endDate); end.setHours(23,59,59,999); s = s.filter(session => new Date(session.fecha) <= end); }
    return s.sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [sessions, playerId, startDate, endDate]);

  const drillDownData = useMemo((): ChartDataPoint[] => {
    const timeSums: Record<string, number> = {};
    let currentLevelType: ChartDataPoint['type'] = 'TrainingType';
    
    if (drillDownPath.length === 0) { 
        setAreaChartTitle("Distribución por Tipo (minutos)");
        dateFilteredSessions.forEach(s => s.ejercicios.forEach(ex => { 
            const minutes = parseTimeToMinutes(ex.tiempoCantidad);
            timeSums[ex.tipo] = (timeSums[ex.tipo] || 0) + minutes; 
        }));
        currentLevelType = 'TrainingType';
    } else if (drillDownPath.length === 1) { 
        const type = drillDownPath[0] as TrainingType; 
        setAreaChartTitle(`${type}: Por Área (minutos)`);
        dateFilteredSessions.forEach(s => s.ejercicios.forEach(ex => { 
            if(ex.tipo === type) {
                const minutes = parseTimeToMinutes(ex.tiempoCantidad);
                timeSums[ex.area] = (timeSums[ex.area] || 0) + minutes; 
            }
        }));
        currentLevelType = 'TrainingArea';
    } else { 
        const [type, area] = drillDownPath; 
        setAreaChartTitle(`${type} - ${area}: Por Ejercicio (minutos)`);
        dateFilteredSessions.forEach(s => s.ejercicios.forEach(ex => { 
            if(ex.tipo === type && ex.area === area) {
                const minutes = parseTimeToMinutes(ex.tiempoCantidad);
                timeSums[ex.ejercicio] = (timeSums[ex.ejercicio] || 0) + minutes; 
            }
        }));
        currentLevelType = 'Exercise';
    }
    return Object.entries(timeSums)
        .map(([name, value]) => ({ name, value: Math.round(value), type: currentLevelType }))
        .filter(item => item.value > 0);
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
  
  // --- EVENT HANDLERS ---
  const handlePieSliceClick = (dataPoint: ChartDataPoint) => {
    if (!dataPoint.name || dataPoint.type === 'Exercise') return;
    if (drillDownPath.length < 2) {
      setDrillDownPath(prev => [...prev, dataPoint.name]);
    }
  };

  const handleBreadcrumbClick = (index: number) => setDrillDownPath(drillDownPath.slice(0, index));
  const resetDateFilters = () => { setStartDate(''); setEndDate(''); };
  
  // Profile Handlers
  const handleProfileSave = async () => { 
    if (!player) return; 
    const profileData: Partial<Player> = { edad: Number(edad) || undefined, altura: Number(altura) || undefined, peso: Number(peso) || undefined, pesoIdeal: Number(pesoIdeal) || undefined, brazoDominante, canalComunicacion, ojoDominante, historiaDeportiva, lesionesActuales, lesionesPasadas, frecuenciaSemanal, }; 
    try {
        await updatePlayer(player.id, profileData); 
        onDataChange(); 
        setNotification("Perfil actualizado con éxito.");
    } catch (error) {
        console.error("Error updating profile:", error);
        setNotification("Error al actualizar el perfil.");
    }
  };
  
  // Tournament Handlers
  const handleOpenAddTournamentModal = () => { setEditingTournament(null); setIsTournamentModalOpen(true); };
  const handleEditTournamentClick = (tournament: Tournament) => { setEditingTournament(tournament); setIsTournamentModalOpen(true); };
  const handleSaveTournament = async (data: Omit<Tournament, 'id'|'jugadorId'>) => { 
      try {
        if (editingTournament) await updateTournament(editingTournament.id, data); 
        else await addTournament({ ...data, jugadorId: playerId! }); 
        onDataChange(); 
        setIsTournamentModalOpen(false); 
        setNotification(`Torneo ${editingTournament ? 'actualizado' : 'guardado'} con éxito.`);
      } catch (error) {
        console.error("Error saving tournament:", error);
        setNotification("Error al guardar el torneo.");
      }
  };
  const confirmDeleteTournament = async () => {
    if (!tournamentToDelete) return;
    try {
        await deleteTournament(tournamentToDelete.id);
        onDataChange();
        setNotification("Torneo eliminado con éxito.");
    } catch (error) {
        console.error("Error deleting tournament:", error);
        setNotification("Error al eliminar el torneo.");
    } finally {
        setTournamentToDelete(null);
    }
  };

  // Session Handlers
  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    try {
        await deleteSession(sessionToDelete);
        onDataChange();
        setNotification("Entrenamiento eliminado con éxito.");
    } catch (error) {
        console.error("Error deleting session:", error);
        setNotification("Error al eliminar el entrenamiento.");
    } finally {
        setSessionToDelete(null);
    }
  };

  // Archive Handlers
  const handleArchivePlayer = () => setIsArchiveModalOpen(true);
  const confirmArchivePlayer = async () => { 
    if(!player) return;
    try {
        await updatePlayer(player.id, { estado: 'archivado' }); 
        onDataChange(); 
        navigate('/players');
    } catch(error) {
        console.error("Error archiving player:", error);
        setNotification("Error al archivar el jugador.");
        setIsArchiveModalOpen(false);
    }
  };

  // --- RENDER ---
  if (!player) return <div className="text-center py-10 text-app-secondary">Cargando perfil del jugador...</div>;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      {/* --- MODALS --- */}
      <Modal isOpen={isArchiveModalOpen} onClose={() => setIsArchiveModalOpen(false)} title="Confirmar Archivar Jugador">
        <p className="text-app-secondary mb-6">¿Estás seguro de que quieres archivar a <strong>{player.name}</strong>?</p>
        <div className="flex justify-end space-x-3 mt-4"><button onClick={() => setIsArchiveModalOpen(false)} className="app-button btn-secondary">Cancelar</button><button onClick={confirmArchivePlayer} className="app-button btn-warning">Sí, Archivar</button></div>
      </Modal>

      <Modal isOpen={!!sessionToDelete} onClose={() => setSessionToDelete(null)} title="Confirmar Eliminar Sesión">
        <p className="text-app-secondary mb-6">¿Estás seguro de que quieres eliminar esta sesión de entrenamiento? Esta acción no se puede deshacer.</p>
        <div className="flex justify-end space-x-3 mt-4"><button onClick={() => setSessionToDelete(null)} className="app-button btn-secondary">Cancelar</button><button onClick={confirmDeleteSession} className="app-button btn-danger">Sí, Eliminar</button></div>
      </Modal>

      <Modal isOpen={!!tournamentToDelete} onClose={() => setTournamentToDelete(null)} title="Confirmar Eliminar Torneo">
        <p className="text-app-secondary mb-6">¿Estás seguro de que quieres eliminar el torneo <strong>{tournamentToDelete?.nombreTorneo}</strong>?</p>
        <div className="flex justify-end space-x-3 mt-4"><button onClick={() => setTournamentToDelete(null)} className="app-button btn-secondary">Cancelar</button><button onClick={confirmDeleteTournament} className="app-button btn-danger">Sí, Eliminar</button></div>
      </Modal>

      {isTournamentModalOpen && playerId && <TournamentFormModal isOpen={isTournamentModalOpen} onClose={() => setIsTournamentModalOpen(false)} onSave={handleSaveTournament} playerId={playerId} existingTournament={editingTournament} />}
      
      {/* --- NOTIFICATION BANNER --- */}
      {notification && (
        <div className="bg-app-success text-white p-3 rounded-lg text-center mb-4 shadow-lg animate-pulse">
            {notification}
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="mb-6 p-6 sm:p-8 bg-app-surface rounded-lg shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-3xl sm:text-4xl font-bold text-app-accent mb-2 break-words">{player.name}</h1>
              <p className={`text-sm sm:text-base capitalize`}>
                <span className={`inline-block px-3 py-1 rounded-full ${player.estado === 'activo' ? 'bg-app-success/20 text-app-success' : 'bg-app-warning/20 text-app-warning'}`}>
                  Estado: <span className="font-medium">{player.estado}</span>
                </span>
              </p>
            </div>
            {player.estado === 'activo' && (
              <button onClick={handleArchivePlayer} className="app-button btn-warning w-full sm:w-auto px-4 py-2 text-sm sm:text-base">
                Archivar Jugador
              </button>
            )}
        </div>
      </div>
      
      {/* --- TABS --- */}
      <div className="mb-6 border-b border-app overflow-x-auto">
        <nav className="flex space-x-1 sm:space-x-4 min-w-max px-2 sm:px-0">
          <button onClick={() => setActiveTab("perfil")} className={`py-3 px-3 sm:px-4 font-medium text-sm sm:text-base ${activeTab === "perfil" ? "border-b-2 border-app-accent text-app-accent" : "text-app-secondary"}`}>Perfil</button>
          <button onClick={() => setActiveTab("trainings")} className={`py-3 px-3 sm:px-4 font-medium text-sm sm:text-base ${activeTab === "trainings" ? "border-b-2 border-app-accent text-app-accent" : "text-app-secondary"}`}>Entrenamientos</button>
          <button onClick={() => setActiveTab("objectives")} className={`py-3 px-3 sm:px-4 font-medium text-sm sm:text-base ${activeTab === "objectives" ? "border-b-2 border-app-accent text-app-accent" : "text-app-secondary"}`}>Objetivos ({playerActualObjectivesCount}/{MAX_ACTIVE_OBJECTIVES})</button>
          <button onClick={() => setActiveTab("tournaments")} className={`py-3 px-3 sm:px-4 font-medium text-sm sm:text-base ${activeTab === "tournaments" ? "border-b-2 border-app-accent text-app-accent" : "text-app-secondary"}`}>Torneos</button>
        </nav>
      </div>
      
      {/* --- TAB CONTENT: PERFIL --- */}
      {activeTab === "perfil" && (
        <section className="bg-app-surface p-4 sm:p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-semibold text-app-accent mb-6 sm:mb-8">Información Detallada</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Profile form fields... */}
          </div>
          <div className="mt-8 sm:mt-10 text-center sm:text-right">
            <button onClick={handleProfileSave} className="app-button btn-success px-6 py-3 text-base sm:text-lg font-semibold">
              Guardar Cambios del Perfil
            </button>
          </div>
        </section>
      )}

      {/* --- TAB CONTENT: TRAININGS --- */}
      {activeTab === "trainings" && (
        <section>
          <div className="bg-app-surface p-4 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold text-app-accent mb-3">Filtrar por Fecha</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-end">
              <div><label htmlFor="startDate" className="block text-sm font-medium text-app-secondary">Desde</label><input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 app-input rounded-md"/></div>
              <div><label htmlFor="endDate" className="block text-sm font-medium text-app-secondary">Hasta</label><input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 app-input rounded-md"/></div>
              <button onClick={resetDateFilters} className="app-button btn-secondary h-10">Limpiar</button>
            </div>
          </div>
          {dateFilteredSessions.length === 0 ? <p className="text-center p-6 bg-app-surface rounded-lg">No hay sesiones de entrenamiento para los filtros seleccionados.</p> : (
            <>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  {drillDownPath.length > 0 && (<nav className="mb-2 text-sm text-app-secondary"><button onClick={() => handleBreadcrumbClick(0)} className="hover:underline text-app-accent">Inicio</button>{drillDownPath.map((item, i) => (<span key={i}> &gt; <button onClick={() => handleBreadcrumbClick(i + 1)} className="hover:underline text-app-accent">{item}</button></span>))}</nav>)}
                  <AreaPieChart data={drillDownData} chartTitle={areaChartTitle} onSliceClick={handlePieSliceClick} height={384}/>
                </div>
                <IntensityLineChart data={intensityChartData} chartTitle={intensityChartTitle} />
              </div>
              <div className="bg-app-surface p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4 text-app-accent">Sesiones Registradas ({dateFilteredSessions.length})</h3>
                <ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {dateFilteredSessions.map(session => (
                    <li key={session.id} className="bg-app-surface-alt p-4 rounded-md shadow-sm group flex justify-between items-center transition-shadow hover:shadow-md">
                      <Link to={`/session/${session.id}`} className="flex-grow">
                        <p className="font-semibold text-app-primary">Fecha: {formatDate(session.fecha)}</p>
                        <p className="text-sm text-app-secondary">Ejercicios: {session.ejercicios.length}</p>
                      </Link>
                       <button 
                        onClick={() => setSessionToDelete(session.id)}
                        className="app-button btn-danger text-xs font-bold py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                        title="Eliminar permanentemente"
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </section>
      )}

       {/* --- TAB CONTENT: OBJECTIVES --- */}
      {activeTab === "objectives" && (
        <section className="bg-app-surface p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-semibold text-app-accent">Objetivos del Jugador</h2><Link to={`/player/${playerId}/edit-objectives`} className="app-button btn-primary">Gestionar Objetivos</Link></div>
          {(Object.keys(OBJECTIVE_ESTADOS) as ObjectiveEstado[]).map(estado => {
            const objectivesInState = playerAllObjectives.filter(obj => obj.estado === estado);
            if (objectivesInState.length === 0) return null;
            return (
              <div key={estado} className="mb-6">
                <h3 className="text-xl font-semibold border-b border-app pb-2 text-app-accent">{OBJECTIVE_ESTADOS[estado]} ({objectivesInState.length})</h3>
                <ul className="space-y-3 mt-3">{objectivesInState.map(obj => (<li key={obj.id} className="bg-app-surface-alt p-4 rounded-md shadow-sm transition-shadow hover:shadow-md"><Link to={`/objective/${obj.id}/edit`} className="text-app-primary block hover:text-app-accent"><p className="font-medium">{obj.textoObjetivo}</p></Link></li>))}</ul>
              </div>
            );
          })}
          {playerAllObjectives.length === 0 && <p className="text-app-secondary mt-4">No hay objetivos definidos para este jugador.</p>}
        </section>
      )}
      
      {/* --- TAB CONTENT: TOURNAMENTS --- */}
      {activeTab === "tournaments" && (
        <section className="bg-app-surface p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-semibold text-app-accent">Calendario de Torneos</h2><button onClick={handleOpenAddTournamentModal} className="app-button btn-success">Agregar Torneo</button></div>
          {playerTournaments.length === 0 ? <p className="text-app-secondary">No hay torneos programados.</p> : (
            <ul className="space-y-4">
              {playerTournaments.map(t => (<li key={t.id} className="bg-app-surface-alt p-4 rounded-md shadow-sm flex justify-between items-center"><div><h3 className="font-semibold text-app-primary">{t.nombreTorneo}</h3><p className="text-sm text-app-secondary">{t.gradoImportancia}</p><p className="text-xs text-app-secondary">{formatDate(t.fechaInicio)} - {formatDate(t.fechaFin)}</p></div><div className="space-x-2"><button onClick={() => handleEditTournamentClick(t)} className="app-button btn-primary text-sm">Editar</button><button onClick={() => setTournamentToDelete(t)} className="app-button btn-danger text-sm">Eliminar</button></div></li>))}
            </ul>
          )}
        </section>
      )}
      
      <div className="mt-8 text-center pb-8"><Link to="/players" className="app-link">&larr; Volver a la Lista de Jugadores</Link></div>
    </div>
  );
};

export default PlayerProfilePage;