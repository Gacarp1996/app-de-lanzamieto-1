import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Tournament, TournamentImportance } from '../types';
import { TOURNAMENT_IMPORTANCE_LEVELS } from '../constants';

interface TournamentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tournamentData: Omit<Tournament, 'id' | 'jugadorId'>) => void;
  playerId: string;
  existingTournament: Tournament | null;
}

const TournamentFormModal: React.FC<TournamentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingTournament,
}) => {
  const [nombreTorneo, setNombreTorneo] = useState('');
  const [gradoImportancia, setGradoImportancia] = useState<TournamentImportance>(TOURNAMENT_IMPORTANCE_LEVELS[2]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (existingTournament) {
      setNombreTorneo(existingTournament.nombreTorneo);
      setGradoImportancia(existingTournament.gradoImportancia);
      setFechaInicio(existingTournament.fechaInicio.split('T')[0]);
      setFechaFin(existingTournament.fechaFin.split('T')[0]);
      setError('');
    } else {
      setNombreTorneo('');
      setGradoImportancia(TOURNAMENT_IMPORTANCE_LEVELS[2]);
      setFechaInicio('');
      setFechaFin('');
      setError('');
    }
  }, [existingTournament, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombreTorneo.trim()) {
      setError('El nombre del torneo no puede estar vacío.');
      return;
    }
    if (!fechaInicio || !fechaFin) {
      setError('Debe seleccionar una fecha de inicio y una fecha de fin.');
      return;
    }
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      setError('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }

    onSave({
      nombreTorneo: nombreTorneo.trim(),
      gradoImportancia,
      fechaInicio: new Date(fechaInicio + 'T00:00:00Z').toISOString(), 
      fechaFin: new Date(fechaFin + 'T00:00:00Z').toISOString(),
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingTournament ? 'Editar Torneo' : 'Agregar Nuevo Torneo'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombreTorneo" className="block text-sm font-medium text-app-secondary mb-1">
            Nombre del Torneo
          </label>
          <input
            type="text"
            id="nombreTorneo"
            value={nombreTorneo}
            onChange={(e) => setNombreTorneo(e.target.value)}
            className="w-full p-2 app-input rounded-md"
            required
          />
        </div>

        <div>
          <label htmlFor="gradoImportancia" className="block text-sm font-medium text-app-secondary mb-1">
            Grado de Importancia
          </label>
          <select
            id="gradoImportancia"
            value={gradoImportancia}
            onChange={(e) => setGradoImportancia(e.target.value as TournamentImportance)}
            className="w-full p-2 app-input rounded-md"
          >
            {TOURNAMENT_IMPORTANCE_LEVELS.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fechaInicio" className="block text-sm font-medium text-app-secondary mb-1">
              Fecha de Inicio
            </label>
            <input
              type="date"
              id="fechaInicio"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full p-2 app-input rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="fechaFin" className="block text-sm font-medium text-app-secondary mb-1">
              Fecha de Fin
            </label>
            <input
              type="date"
              id="fechaFin"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full p-2 app-input rounded-md"
              required
            />
          </div>
        </div>

        {error && <p className="text-[var(--color-action-danger-bg)] text-sm">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            className="app-button btn-success text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex-grow"
          >
            {existingTournament ? 'Guardar Cambios' : 'Agregar Torneo'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="app-button btn-secondary text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex-grow"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TournamentFormModal;
