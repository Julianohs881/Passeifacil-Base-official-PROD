
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
  filters: FilterValues;
  faculties: string[];
  courseYears: string[];
  courses: string[];
  onFilterChange: (newFilters: FilterValues) => void;
  onClearFilters: () => void;
}

const ExploreFilters = ({
  filters,
  faculties,
  courseYears,
  courses,
  onFilterChange,
  onClearFilters,
}: ExploreFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);
  
  const activeFilters = Object.entries(filters).filter(
    ([_, value]) => value && value.trim() !== ""
  ).length;

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value });
  };

  const handleFacultyChange = (value: string) => {
    onFilterChange({ ...filters, faculty: value });
  };

  const handleCourseYearChange = (value: string) => {
    onFilterChange({ ...filters, courseYear: value });
  };

  const handleCourseChange = (value: string) => {
    onFilterChange({ ...filters, course: value });
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input 
            placeholder="Buscar por título, faculdade ou curso..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
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
              onClick={onClearFilters}
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
              value={filters.faculty}
              onValueChange={handleFacultyChange}
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
              value={filters.courseYear}
              onValueChange={handleCourseYearChange}
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
              value={filters.course}
              onValueChange={handleCourseChange}
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
