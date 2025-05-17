
import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Question } from "@/types";

interface QuestionOptionsProps {
  question: Question;
  userAnswer?: number;
  handleAnswer: (optionIndex: number) => void;
}

const QuestionOptions: React.FC<QuestionOptionsProps> = ({
  question,
  userAnswer,
  handleAnswer,
}) => {
  const isAnswered = userAnswer !== undefined;

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
    <div className="space-y-3 mt-6 w-full">
      {question.options.map((option, index) => {
        const optionId = `option-${question.id}-${index}`;
        const isSelected = userAnswer === index;
        const isCorrectOption = question.correct_index === index;

        let optionClass =
          "p-3 sm:p-4 border rounded-lg cursor-pointer transition-all w-full break-words";

        if (!isAnswered) {
          optionClass += " hover:bg-gray-50";
        } else if (isSelected) {
          optionClass += isCorrectOption
            ? " bg-green-50 border-green-300"
            : " bg-red-50 border-red-300";
        } else if (isCorrectOption) {
          optionClass += " bg-green-50 border-green-300";
        }

        return (
          <div
            key={optionId}
            className={optionClass}
            onClick={() => !isAnswered && handleAnswer(index)}
          >
            <div className="flex items-start">
              <div className="mr-3 mt-0.5 flex-shrink-0">
                <span
                  className={`flex items-center justify-center h-6 w-6 rounded-full text-sm font-medium ${
                    isAnswered && isCorrectOption
                      ? "bg-green-100 text-green-800"
                      : isAnswered && isSelected
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
              </div>
              <div className="flex-1 pr-6">
                {renderFormattedText(option)}
              </div>
              {isAnswered && isSelected && isCorrectOption && (
                <CheckCircle className="h-5 w-5 text-green-600 ml-2 mt-0.5 flex-shrink-0 absolute right-6" />
              )}
              {isAnswered && isSelected && !isCorrectOption && (
                <XCircle className="h-5 w-5 text-red-600 ml-2 mt-0.5 flex-shrink-0 absolute right-6" />
              )}
              {isAnswered && !isSelected && isCorrectOption && (
                <CheckCircle className="h-5 w-5 text-green-600 ml-2 mt-0.5 flex-shrink-0 absolute right-6" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuestionOptions;
