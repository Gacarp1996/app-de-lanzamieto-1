// contexts/AcademyContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Academy } from '../types';

interface AcademyContextType {
  selectedAcademy: Academy | null;
  selectAcademy: (academy: Academy | null) => void;
}

const AcademyContext = createContext<AcademyContextType | undefined>(undefined);

export const AcademyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedAcademy, setSelectedAcademy] = useState<Academy | null>(null);

  const selectAcademy = (academy: Academy | null) => {
    setSelectedAcademy(academy);
    // Podrías guardar la academia seleccionada en localStorage para persistencia
  };

  return (
    <AcademyContext.Provider value={{ selectedAcademy, selectAcademy }}>
      {children}
    </AcademyContext.Provider>
  );
};

export const useAcademy = () => {
  const context = useContext(AcademyContext);
  if (context === undefined) {
    throw new Error('useAcademy must be used within an AcademyProvider');
  }
  return context;
};