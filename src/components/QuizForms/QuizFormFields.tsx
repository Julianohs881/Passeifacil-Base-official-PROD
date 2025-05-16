
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorOption, VisibilityOption } from "@/types";
import { ColorSelector } from "./ColorSelector";
import { VisibilitySelector } from "./VisibilitySelector";
import { CourseYearSelector } from "./CourseYearSelector";

interface QuizFormFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  color: ColorOption;
  setColor: (color: ColorOption) => void;
  visibility: VisibilityOption;
  setVisibility: (visibility: VisibilityOption) => void;
  faculty: string;
  setFaculty: (faculty: string) => void;
  courseYear: string;
  setCourseYear: (courseYear: string) => void;
  course: string;
  setCourse: (course: string) => void;
}

export const QuizFormFields: React.FC<QuizFormFieldsProps> = ({
  title,
  setTitle,
  color,
  setColor,
  visibility,
  setVisibility,
  faculty,
  setFaculty,
  courseYear,
  setCourseYear,
  course,
  setCourse,
}) => {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="title" className="text-right">
          Título
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="col-span-3"
          placeholder="Ex: Matemática Avançada"
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="faculty" className="text-right">
          Faculdade
        </Label>
        <Input
          id="faculty"
          value={faculty}
          onChange={(e) => setFaculty(e.target.value)}
          className="col-span-3"
          placeholder="Ex: Engenharia"
        />
      </div>

      <CourseYearSelector 
        courseYear={courseYear}
        setCourseYear={setCourseYear}
      />

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="course" className="text-right">
          Curso/Matéria
        </Label>
        <Input
          id="course"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          className="col-span-3"
          placeholder="Ex: Cálculo I"
        />
      </div>
      
      <ColorSelector color={color} setColor={setColor} />
      <VisibilitySelector visibility={visibility} setVisibility={setVisibility} />
    </div>
  );
};
