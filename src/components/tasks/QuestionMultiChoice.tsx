import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useAnalytics } from '../../contexts/AnalyticsProvider';

interface QuestionMultiChoiceProps {
  content: {
    questionText: string;
    options: string[];
    correctAnswers?: number[];
    hint?: string;
    [key: string]: any;
  };
  moduleId: number;
  stepId: number;
  screenId: number;
  onAnswer?: (selectedOptions: number[]) => void;
}

export const QuestionMultiChoice: React.FC<QuestionMultiChoiceProps> = ({ 
  content, 
  moduleId, 
  stepId, 
  screenId,
  onAnswer 
}) => {
  const { logEvent } = useAnalytics();
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleOptionToggle = (optionIndex: number) => {
    const newSelected = selectedOptions.includes(optionIndex)
      ? selectedOptions.filter(i => i !== optionIndex)
      : [...selectedOptions, optionIndex];
    
    setSelectedOptions(newSelected);
    
    logEvent({
      eventType: 'QUESTION_OPTION_SELECTED',
      moduleId,
      stepId,
      screenId,
      eventData: {
        questionText: content.questionText,
        selectedOption: optionIndex,
        optionText: content.options[optionIndex],
        currentSelection: newSelected
      }
    });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowFeedback(true);
    
    const isCorrect = content.correctAnswers 
      ? JSON.stringify(selectedOptions.sort()) === JSON.stringify(content.correctAnswers.sort())
      : false;
    
    logEvent({
      eventType: 'QUESTION_SUBMITTED',
      moduleId,
      stepId,
      screenId,
      eventData: {
        questionText: content.questionText,
        selectedAnswers: selectedOptions,
        correctAnswers: content.correctAnswers,
        isCorrect,
        selectedTexts: selectedOptions.map(i => content.options[i])
      }
    });

    if (onAnswer) {
      onAnswer(selectedOptions);
    }
  };

  const isCorrect = content.correctAnswers 
    ? JSON.stringify(selectedOptions.sort()) === JSON.stringify(content.correctAnswers.sort())
    : false;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        {content.questionText}
      </h3>

      {content.hint && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-yellow-800 text-sm">
            💡 {content.hint}
          </p>
        </div>
      )}

      <div className="space-y-2">
        {content.options.map((option, index) => (
          <label
            key={index}
            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedOptions.includes(index)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${
              submitted && content.correctAnswers
                ? content.correctAnswers.includes(index)
                  ? 'border-green-500 bg-green-50'
                  : selectedOptions.includes(index) && !content.correctAnswers.includes(index)
                  ? 'border-red-500 bg-red-50'
                  : ''
                : ''
            }`}
          >
            <input
              type="checkbox"
              checked={selectedOptions.includes(index)}
              onChange={() => handleOptionToggle(index)}
              disabled={submitted}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-gray-900">{option}</span>
            {submitted && content.correctAnswers && content.correctAnswers.includes(index) && (
              <span className="ml-auto text-green-600">✓</span>
            )}
            {submitted && selectedOptions.includes(index) && content.correctAnswers && !content.correctAnswers.includes(index) && (
              <span className="ml-auto text-red-600">✗</span>
            )}
          </label>
        ))}
      </div>

      {!submitted && (
        <Button 
          onClick={handleSubmit}
          disabled={selectedOptions.length === 0}
          className="w-full"
        >
          שלח תשובה
        </Button>
      )}

      {showFeedback && submitted && content.correctAnswers && (
        <div className={`p-4 rounded-lg ${
          isCorrect 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`font-medium ${
            isCorrect ? 'text-green-800' : 'text-red-800'
          }`}>
            {isCorrect ? '✅ תשובה נכונה!' : '❌ תשובה לא נכונה'}
          </p>
          {!isCorrect && (
            <p className="text-red-700 text-sm mt-1">
              התשובות הנכונות: {content.correctAnswers.map(i => content.options[i]).join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
