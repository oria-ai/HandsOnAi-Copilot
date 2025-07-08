import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useAnalytics } from '../../contexts/AnalyticsProvider';

interface QuestionOpenProps {
  content: {
    questionText: string;
    placeholder?: string;
    systemPrompt?: string;
    [key: string]: any;
  };
  moduleId: number;
  stepId: number;
  screenId: number;
  onAnswer?: (answer: string) => void;
}

export const QuestionOpen: React.FC<QuestionOpenProps> = ({ 
  content, 
  moduleId, 
  stepId, 
  screenId,
  onAnswer 
}) => {
  const { logEvent } = useAnalytics();
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  const handleSubmit = async () => {
    if (!answer.trim()) return;

    setSubmitted(true);
    setIsLoadingFeedback(true);
    
    logEvent({
      eventType: 'OPEN_QUESTION_SUBMITTED',
      moduleId,
      stepId,
      screenId,
      eventData: {
        questionText: content.questionText,
        answer: answer,
        answerLength: answer.length
      }
    });

    // TODO: Implement AI feedback API call
    // For now, we'll simulate feedback
    setTimeout(() => {
      setFeedback('תשובה מעניינת! זה כיוון טוב לחשיבה על הנושא.');
      setIsLoadingFeedback(false);
      
      logEvent({
        eventType: 'AI_FEEDBACK_RECEIVED',
        moduleId,
        stepId,
        screenId,
        eventData: {
          questionText: content.questionText,
          answer: answer,
          feedbackReceived: true
        }
      });
    }, 2000);

    if (onAnswer) {
      onAnswer(answer);
    }
  };

  const handleTextChange = (value: string) => {
    setAnswer(value);
    
    // Log typing activity (throttled)
    if (value.length % 10 === 0) {
      logEvent({
        eventType: 'OPEN_QUESTION_TYPING',
        moduleId,
        stepId,
        screenId,
        eventData: {
          questionText: content.questionText,
          currentLength: value.length
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        {content.questionText}
      </h3>

      <div className="space-y-3">
        <Textarea
          value={answer}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={content.placeholder || 'הכנס את תשובתך כאן...'}
          disabled={submitted}
          className="min-h-[120px] resize-none"
          dir="rtl"
        />
        
        <div className="text-sm text-gray-500 text-right">
          {answer.length} תווים
        </div>
      </div>

      {!submitted && (
        <Button 
          onClick={handleSubmit}
          disabled={!answer.trim()}
          className="w-full"
        >
          שלח תשובה
        </Button>
      )}

      {submitted && (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">התשובה שלך:</h4>
            <p className="text-blue-800 whitespace-pre-wrap">{answer}</p>
          </div>

          {isLoadingFeedback && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">מכין משוב...</span>
              </div>
            </div>
          )}

          {feedback && !isLoadingFeedback && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">משוב AI:</h4>
              <p className="text-green-800">{feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
