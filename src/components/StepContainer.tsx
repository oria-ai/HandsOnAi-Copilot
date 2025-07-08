import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ScreenContainer } from './ScreenContainer';
import { useStepData } from '../hooks/useModuleData';
import { useAnalytics } from '../contexts/AnalyticsProvider';

interface StepContainerProps {
  stepId: number;
  moduleId: number;
  onStepComplete?: () => void;
  onSkip?: () => void;
}

export const StepContainer: React.FC<StepContainerProps> = ({ 
  stepId, 
  moduleId, 
  onStepComplete,
  onSkip 
}) => {
  const { stepData, loading, error } = useStepData(stepId);
  const { logEvent } = useAnalytics();
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [screenStartTime, setScreenStartTime] = useState(Date.now());

  useEffect(() => {
    if (stepData) {
      // Log step view
      logEvent({
        eventType: 'STEP_VIEW',
        moduleId,
        stepId,
        eventData: {
          stepType: stepData.type,
          totalScreens: stepData.screens.length
        }
      });
    }
  }, [stepData, moduleId, stepId, logEvent]);

  useEffect(() => {
    // Log screen view and duration
    if (stepData && stepData.screens[currentScreenIndex]) {
      const screen = stepData.screens[currentScreenIndex];
      
      logEvent({
        eventType: 'SCREEN_VIEW',
        moduleId,
        stepId,
        screenId: screen.screenId,
        eventData: {
          screenOrder: screen.order,
          screenIndex: currentScreenIndex
        }
      });

      setScreenStartTime(Date.now());

      return () => {
        // Log screen view duration on unmount
        const duration = Date.now() - screenStartTime;
        logEvent({
          eventType: 'SCREEN_VIEW_DURATION',
          moduleId,
          stepId,
          screenId: screen.screenId,
          eventData: {
            screenOrder: screen.order,
            viewDuration: duration
          }
        });
      };
    }
  }, [currentScreenIndex, stepData, moduleId, stepId, logEvent, screenStartTime]);

  const handleNext = () => {
    if (!stepData) return;

    if (currentScreenIndex < stepData.screens.length - 1) {
      setCurrentScreenIndex(currentScreenIndex + 1);
      logEvent({
        eventType: 'NAVIGATION_NEXT',
        moduleId,
        stepId,
        screenId: stepData.screens[currentScreenIndex].screenId,
        eventData: {
          fromScreen: currentScreenIndex,
          toScreen: currentScreenIndex + 1
        }
      });
    } else {
      // Step completed
      logEvent({
        eventType: 'STEP_COMPLETED',
        moduleId,
        stepId,
        eventData: {
          stepType: stepData.type,
          totalScreens: stepData.screens.length
        }
      });
      
      if (onStepComplete) {
        onStepComplete();
      }
    }
  };

  const handlePrevious = () => {
    if (currentScreenIndex > 0) {
      setCurrentScreenIndex(currentScreenIndex - 1);
      logEvent({
        eventType: 'NAVIGATION_PREVIOUS',
        moduleId,
        stepId,
        screenId: stepData?.screens[currentScreenIndex].screenId,
        eventData: {
          fromScreen: currentScreenIndex,
          toScreen: currentScreenIndex - 1
        }
      });
    }
  };

  const handleSkip = () => {
    logEvent({
      eventType: 'STEP_SKIPPED',
      moduleId,
      stepId,
      screenId: stepData?.screens[currentScreenIndex].screenId,
      eventData: {
        stepType: stepData?.type,
        skippedFromScreen: currentScreenIndex,
        totalScreens: stepData?.screens.length
      }
    });

    if (onSkip) {
      onSkip();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">טוען תוכן...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-red-800 font-medium mb-2">שגיאה בטעינת התוכן</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!stepData || !stepData.screens.length) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">לא נמצא תוכן עבור שלב זה</p>
      </div>
    );
  }

  const currentScreen = stepData.screens[currentScreenIndex];
  const isLastScreen = currentScreenIndex === stepData.screens.length - 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {stepData.header}
        </h2>
        {stepData.screens.length > 1 && (
          <div className="mt-2 text-sm text-gray-500">
            מסך {currentScreenIndex + 1} מתוך {stepData.screens.length}
          </div>
        )}
      </div>

      {/* Screen Content */}
      <ScreenContainer 
        screen={currentScreen}
        moduleId={moduleId}
        stepId={stepId}
      />

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="text-gray-600 hover:text-gray-800"
          >
            דלג
          </Button>
          
          {currentScreenIndex > 0 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
            >
              הקודם
            </Button>
          )}
        </div>

        <Button
          onClick={handleNext}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLastScreen ? 'סיים' : 'הבא'}
        </Button>
      </div>

      {/* Progress indicator for multi-screen steps */}
      {stepData.screens.length > 1 && (
        <div className="flex justify-center space-x-2">
          {stepData.screens.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === currentScreenIndex
                  ? 'bg-blue-600'
                  : index < currentScreenIndex
                  ? 'bg-blue-300'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
