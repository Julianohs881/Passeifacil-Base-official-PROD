
import React from "react";

interface QuestionExplanationProps {
  explanation: string;
  isVisible: boolean;
}

const QuestionExplanation: React.FC<QuestionExplanationProps> = ({
  explanation,
  isVisible,
}) => {
  if (!isVisible || !explanation) {
    return null;
  }

  // Function to render the statement with proper line breaks
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-md w-full">
      <p className="font-medium text-blue-800 mb-1">Explicação:</p>
      <div className="text-blue-700 whitespace-pre-line">
        {renderFormattedText(explanation)}
      </div>
    </div>
  );
};

export default QuestionExplanation;
