// contexts/AcademyContext.tsx

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Academy } from '../types';

interface AcademyContextType {
  selectedAcademy: Academy | null;
  selectAcademy: (academy: Academy | null) => void;
}

const AcademyContext = createContext<AcademyContextType | undefined>(undefined);

export const useAcademy = () => {
  const context = useContext(AcademyContext);
  if (!context) throw new Error('useAcademy debe ser usado dentro de un AcademyProvider');
  return context;
};

export const AcademyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedAcademy, setSelectedAcademy] = useState<Academy | null>(() => {
    const saved = localStorage.getItem('selectedAcademy');
    return saved ? JSON.parse(saved) : null;
  });

  const selectAcademy = (academy: Academy | null) => {
    setSelectedAcademy(academy);
    if (academy) {
      localStorage.setItem('selectedAcademy', JSON.stringify(academy));
    } else {
      localStorage.removeItem('selectedAcademy');
    }
  };

  return (
    <AcademyContext.Provider value={{ selectedAcademy, selectAcademy }}>
      {children}
    </AcademyContext.Provider>
  );
};