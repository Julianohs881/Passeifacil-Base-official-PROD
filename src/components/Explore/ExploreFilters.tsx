
import { useState } from "react";
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormLabel } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

// Form schema type - making all fields required to match usage in Explore.tsx
export const formSchema = z.object({
  search: z.string(),
  faculty: z.string(),
  courseYear: z.string(),
  course: z.string(),
});

export type FilterValues = z.infer<typeof formSchema>;

interface ExploreFiltersProps {
  form: UseFormReturn<FilterValues>;
  faculties: string[];
  courseYears: string[];
  courses: string[];
  clearFilters: () => void;
}

const ExploreFilters = ({
  form,
  faculties,
  courseYears,
  courses,
  clearFilters,
}: ExploreFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);
  
  const activeFilters = Object.entries(form.watch()).filter(
    ([_, value]) => value && value.trim() !== ""
  ).length;

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input 
            placeholder="Buscar por título, faculdade ou curso..."
            value={form.watch("search")}
            onChange={(e) => form.setValue("search", e.target.value)}
            className="pl-10 pr-4 w-full"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`flex items-center gap-2 ${showFilters ? 'bg-blue-50 border-blue-500 text-blue-700' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filtros
            {activeFilters > 0 && (
              <Badge className="ml-1 bg-blue-500">
                {activeFilters}
              </Badge>
            )}
          </Button>
          
          {activeFilters > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
            >
              Limpar filtros
            </Button>
          )}
        </div>
      </div>
      
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-white rounded-lg shadow-sm">
          <div>
            <FormLabel>Faculdade</FormLabel>
            <Select
              value={form.watch("faculty")}
              onValueChange={(value) => form.setValue("faculty", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar faculdade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-faculties">Todas as faculdades</SelectItem>
                {faculties.map((faculty) => (
                  <SelectItem key={faculty} value={faculty}>
                    {faculty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <FormLabel>Ano do Curso</FormLabel>
            <Select
              value={form.watch("courseYear")}
              onValueChange={(value) => form.setValue("courseYear", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-years">Todos os anos</SelectItem>
                {courseYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <FormLabel>Curso/Matéria</FormLabel>
            <Select
              value={form.watch("course")}
              onValueChange={(value) => form.setValue("course", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-courses">Todos os cursos</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course} value={course}>
                    {course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreFilters;
