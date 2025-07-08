import { useState, useEffect } from 'react';
import { contentAPI } from '../lib/api';

export interface StepData {
  stepId: number;
  type: string;
  header: string;
  screens: {
    screenId: number;
    order: number;
    components: {
      componentId: number;
      type: string;
      slot: string;
      content: any;
    }[];
  }[];
}

export interface ModuleData {
  id: number;
  title: string;
  description?: string;
  iconPath?: string;
  steps: {
    id: number;
    title: string;
    type: string;
    order: number;
  }[];
}

export const useModuleData = (moduleId?: number) => {
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [currentModule, setCurrentModule] = useState<ModuleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const modulesData = await contentAPI.getModules();
        setModules(modulesData);
        
        if (moduleId) {
          const moduleData = await contentAPI.getModule(moduleId);
          setCurrentModule(moduleData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch modules');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [moduleId]);

  return {
    modules,
    currentModule,
    loading,
    error,
    refetch: () => {
      setError(null);
      const fetchModules = async () => {
        try {
          setLoading(true);
          const modulesData = await contentAPI.getModules();
          setModules(modulesData);
          
          if (moduleId) {
            const moduleData = await contentAPI.getModule(moduleId);
            setCurrentModule(moduleData);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch modules');
        } finally {
          setLoading(false);
        }
      };
      fetchModules();
    }
  };
};

export const useStepData = (stepId?: number) => {
  const [stepData, setStepData] = useState<StepData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stepId) {
      setLoading(false);
      return;
    }

    const fetchStep = async () => {
      try {
        setLoading(true);
        const data = await contentAPI.getStep(stepId);
        setStepData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch step');
      } finally {
        setLoading(false);
      }
    };

    fetchStep();
  }, [stepId]);

  return {
    stepData,
    loading,
    error,
    refetch: () => {
      if (!stepId) return;
      
      setError(null);
      const fetchStep = async () => {
        try {
          setLoading(true);
          const data = await contentAPI.getStep(stepId);
          setStepData(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch step');
        } finally {
          setLoading(false);
        }
      };
      fetchStep();
    }
  };
};

export const useUserProgress = () => {
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const progressData = await contentAPI.getProgress();
        setProgress(progressData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch progress');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const updateProgress = async (progressData: {
    stepId: number;
    status: string;
    progressPercent?: number;
    lastScreen?: number;
  }) => {
    try {
      await contentAPI.updateProgress(progressData);
      // Refetch progress after update
      const updatedProgress = await contentAPI.getProgress();
      setProgress(updatedProgress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress');
    }
  };

  return {
    progress,
    loading,
    error,
    updateProgress
  };
};
