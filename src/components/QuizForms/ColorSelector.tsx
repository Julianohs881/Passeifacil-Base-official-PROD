
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ColorOption, QUIZ_COLORS } from "@/types";

interface ColorSelectorProps {
  color: ColorOption;
  setColor: (color: ColorOption) => void;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  color,
  setColor,
}) => {
  return (
    <div className="grid grid-cols-4 items-start gap-4">
      <Label className="text-right pt-2">Cor</Label>
      <RadioGroup
        value={color}
        onValueChange={(value) => setColor(value as ColorOption)}
        className="col-span-3 flex flex-wrap gap-2"
      >
        {QUIZ_COLORS.map((colorOption) => (
          <div key={colorOption} className="flex items-center space-x-2">
            <RadioGroupItem
              value={colorOption}
              id={colorOption}
              className="sr-only"
            />
            <Label
              htmlFor={colorOption}
              className={`h-8 w-8 rounded-full cursor-pointer ring-offset-background transition-all hover:scale-110 ${colorOption} ${
                color === colorOption
                  ? "ring-2 ring-offset-2 ring-slate-950"
                  : ""
              }`}
            />
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};
