
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CourseYearSelectorProps {
  courseYear: string;
  setCourseYear: (courseYear: string) => void;
}

export const CourseYearSelector: React.FC<CourseYearSelectorProps> = ({
  courseYear,
  setCourseYear,
}) => {
  const courseYearOptions = [
    "1º ano",
    "2º ano",
    "3º ano",
    "4º ano",
    "5º ano",
    "6º ano",
    "Pós-graduação",
  ];

  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="courseYear" className="text-right">
        Ano do Curso
      </Label>
      <Select value={courseYear} onValueChange={setCourseYear}>
        <SelectTrigger className="col-span-3">
          <SelectValue placeholder="Selecione o ano do curso" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none-specified">Não especificado</SelectItem>
          {courseYearOptions.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
