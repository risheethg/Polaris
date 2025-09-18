import React, { createContext, useState, useContext, useMemo, ReactNode, useEffect } from 'react';

interface DebugContextType {
  isDebugMode: boolean;
  setIsDebugMode: (value: boolean) => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export const DebugProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDebugMode, setIsDebugMode] = useState(() => {
    return localStorage.getItem('polaris-debug-mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('polaris-debug-mode', String(isDebugMode));
  }, [isDebugMode]);

  const value = useMemo(() => ({ isDebugMode, setIsDebugMode }), [isDebugMode]);

  return (
    <DebugContext.Provider value={value}>
      {children}
    </DebugContext.Provider>
  );
};

export const useDebug = () => {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
};