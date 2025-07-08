import React, { useRef, useEffect } from 'react';
import { useAnalytics } from '../../contexts/AnalyticsProvider';

interface VideoDisplayProps {
  content: {
    videoUrl: string;
    title?: string;
    description?: string;
    [key: string]: any;
  };
  moduleId: number;
  stepId: number;
  screenId: number;
}

export const VideoDisplay: React.FC<VideoDisplayProps> = ({ 
  content, 
  moduleId, 
  stepId, 
  screenId 
}) => {
  const { logEvent } = useAnalytics();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Log video view event
    logEvent({
      eventType: 'VIDEO_VIEW',
      moduleId,
      stepId,
      screenId,
      eventData: { videoUrl: content.videoUrl }
    });

    startTimeRef.current = Date.now();

    return () => {
      // Log video view duration on unmount
      const duration = Date.now() - startTimeRef.current;
      logEvent({
        eventType: 'VIDEO_VIEW_DURATION',
        moduleId,
        stepId,
        screenId,
        eventData: { 
          videoUrl: content.videoUrl,
          viewDuration: duration
        }
      });
    };
  }, [content.videoUrl, moduleId, stepId, screenId, logEvent]);

  const handleVideoInteraction = (eventType: string, eventData?: any) => {
    logEvent({
      eventType,
      moduleId,
      stepId,
      screenId,
      eventData: {
        videoUrl: content.videoUrl,
        ...eventData
      }
    });
  };

  return (
    <div className="w-full">
      {content.title && (
        <h3 className="text-lg font-semibold mb-2">{content.title}</h3>
      )}
      
      {content.description && (
        <p className="text-gray-600 mb-4">{content.description}</p>
      )}
      
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          ref={iframeRef}
          src={content.videoUrl}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={() => handleVideoInteraction('VIDEO_LOADED')}
          title={content.title || 'Video'}
        />
      </div>
    </div>
  );
};
