import React from 'react';

interface InstructionsProps {
  content: {
    text: string;
    [key: string]: any;
  };
}

export const Instructions: React.FC<InstructionsProps> = ({ content }) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="text-blue-900 text-sm font-medium">
        {content.text}
      </div>
    </div>
  );
};
