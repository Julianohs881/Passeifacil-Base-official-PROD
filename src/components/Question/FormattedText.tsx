
import React from "react";

interface FormattedTextProps {
  text: string;
}

const FormattedText: React.FC<FormattedTextProps> = ({ text }) => {
  return (
    <>
      {text.split('\n').map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < text.split('\n').length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
};

export default FormattedText;
