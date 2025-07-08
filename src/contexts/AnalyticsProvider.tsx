import React, { createContext, useContext, ReactNode } from 'react';
import { analyticsAPI } from '../lib/api';

interface AnalyticsContextType {
  logEvent: (eventData: {
    eventType: string;
    moduleId: number;
    stepId: number;
    screenId?: number;
    eventData?: any;
  }) => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const logEvent = async (eventData: {
    eventType: string;
    moduleId: number;
    stepId: number;
    screenId?: number;
    eventData?: any;
  }) => {
    try {
      await analyticsAPI.logEvent(eventData);
      console.log('Event logged:', eventData);
    } catch (error) {
      console.error('Failed to log event:', error);
      // Don't throw error to avoid breaking user experience
    }
  };

  return (
    <AnalyticsContext.Provider value={{ logEvent }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
