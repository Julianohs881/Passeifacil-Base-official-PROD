
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";

export interface FilterValues {
  search: string;
  faculty: string;
  course: string;
  courseYear: string;
}

interface ExploreFiltersProps {
  filters: FilterValues;
  faculties: string[];
  courseYears: string[];
  courses: string[];
  onFilterChange: (filters: FilterValues) => void;
  onClearFilters: () => void;
}

const ExploreFilters = ({ 
  filters, 
  faculties, 
  courseYears, 
  courses, 
  onFilterChange, 
  onClearFilters 
}: ExploreFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  // Verificar se há filtros ativos
  const hasActiveFilters = filters.search || filters.faculty || filters.course || filters.courseYear;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-lg">Filtros</CardTitle>
            {hasActiveFilters && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
          
          {/* Botão de expandir/colapsar no mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Ocultar
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Mostrar
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      {/* Conteúdo dos filtros - sempre visível no desktop, condicional no mobile */}
      <div className={`md:block ${isExpanded ? 'block' : 'hidden'}`}>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Nome do quiz..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="faculty">Faculdade</Label>
              <Select value={filters.faculty} onValueChange={(value) => handleFilterChange('faculty', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma faculdade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-faculties">Todas</SelectItem>
                  {faculties.map((faculty) => (
                    <SelectItem key={faculty} value={faculty}>
                      {faculty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course">Curso</Label>
              <Select value={filters.course} onValueChange={(value) => handleFilterChange('course', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um curso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-courses">Todos</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseYear">Ano</Label>
              <Select value={filters.courseYear} onValueChange={(value) => handleFilterChange('courseYear', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-years">Todos</SelectItem>
                  {courseYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button 
              variant="ghost" 
              onClick={onClearFilters}
              className="border-0"
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </div>
      
      {/* Filtros compactos no mobile quando colapsado */}
      <div className={`md:hidden ${!isExpanded ? 'block' : 'hidden'}`}>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Busca sempre visível */}
            <div className="space-y-2">
              <Label htmlFor="search-mobile">Buscar</Label>
              <Input
                id="search-mobile"
                placeholder="Nome do quiz..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            
            {/* Filtros ativos em chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {filters.faculty && filters.faculty !== 'all-faculties' && (
                  <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {filters.faculty}
                  </div>
                )}
                {filters.course && filters.course !== 'all-courses' && (
                  <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {filters.course}
                  </div>
                )}
                {filters.courseYear && filters.courseYear !== 'all-years' && (
                  <div className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    {filters.courseYear}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default ExploreFilters;
