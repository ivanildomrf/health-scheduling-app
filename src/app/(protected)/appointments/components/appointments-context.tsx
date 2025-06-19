"use client";

import { createContext, ReactNode, useContext } from "react";

interface AppointmentsContextType {
  onRefresh?: () => void;
}

const AppointmentsContext = createContext<AppointmentsContextType>({});

export const useAppointmentsContext = () => {
  return useContext(AppointmentsContext);
};

interface AppointmentsProviderProps {
  children: ReactNode;
  onRefresh?: () => void;
}

export const AppointmentsProvider = ({
  children,
  onRefresh,
}: AppointmentsProviderProps) => {
  return (
    <AppointmentsContext.Provider value={{ onRefresh }}>
      {children}
    </AppointmentsContext.Provider>
  );
};
