
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Filter, Search, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useInterestAreas, InterestArea } from "@/hooks/useInterestAreas";
import { getIconComponent } from "@/utils/iconMapper";

export interface FilterValues {
  search: string;
  faculty: string;
  course: string;
  courseYear: string;
  areaOfInterest: string;
  subareaOfInterest: string;
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
  const isMobile = useIsMobile();
  const { interestAreas, loading: interestAreasLoading, getSubareasForArea } = useInterestAreas();
  const [availableSubareas, setAvailableSubareas] = useState<any[]>([]);
  
  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    
    // Se a área mudou, limpar a temática
    if (key === 'areaOfInterest') {
      newFilters.subareaOfInterest = 'all-subareas';
    }
    
    onFilterChange(newFilters);
  };

  // Atualizar temáticas quando a área mudar
  useEffect(() => {
    if (filters.areaOfInterest && filters.areaOfInterest !== 'all-areas') {
      const subareas = getSubareasForArea(filters.areaOfInterest);
      setAvailableSubareas(subareas);
    } else {
      setAvailableSubareas([]);
    }
  }, [filters.areaOfInterest, getSubareasForArea]);

  // Verificar se há filtros ativos
  const hasActiveFilters = filters.search || filters.faculty || filters.course || filters.courseYear || filters.areaOfInterest || filters.subareaOfInterest;

  // Contar filtros ativos para exibir no badge
  const activeFiltersCount = [
    filters.search,
    filters.faculty !== 'all-faculties' ? filters.faculty : null,
    filters.course !== 'all-courses' ? filters.course : null,
    filters.courseYear !== 'all-years' ? filters.courseYear : null,
    filters.areaOfInterest !== 'all-areas' ? filters.areaOfInterest : null,
    filters.subareaOfInterest !== 'all-subareas' ? filters.subareaOfInterest : null
  ].filter(Boolean).length;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-lg">Filtros</CardTitle>
            {hasActiveFilters && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-blue-600 font-medium">
                  {activeFiltersCount} ativo{activeFiltersCount !== 1 ? 's' : ''}
                </span>
              </div>
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
          {/* Layout responsivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Campo de busca */}
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Nome do quiz..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 h-9 text-sm"
                />
                {filters.search && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterChange('search', '')}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Filtro de Faculdade */}
            <div className="space-y-2">
              <Label htmlFor="faculty" className="text-sm font-medium">Faculdade</Label>
              <Select value={filters.faculty} onValueChange={(value) => handleFilterChange('faculty', value)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todas as faculdades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-faculties">Todas</SelectItem>
                  {faculties.map((faculty) => (
                    <SelectItem key={faculty} value={faculty} className="text-sm">
                      {faculty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Curso */}
            <div className="space-y-2">
              <Label htmlFor="course" className="text-sm font-medium">Curso</Label>
              <Select value={filters.course} onValueChange={(value) => handleFilterChange('course', value)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todos os cursos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-courses">Todos</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course} value={course} className="text-sm">
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Ano */}
            <div className="space-y-2">
              <Label htmlFor="courseYear" className="text-sm font-medium">Ano</Label>
              <Select value={filters.courseYear} onValueChange={(value) => handleFilterChange('courseYear', value)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todos os anos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-years">Todos</SelectItem>
                  {courseYears.map((year) => (
                    <SelectItem key={year} value={year} className="text-sm">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Área de Interesse */}
            <div className="space-y-2">
              <Label htmlFor="areaOfInterest" className="text-sm font-medium">Área de Interesse</Label>
              <Select 
                value={filters.areaOfInterest} 
                onValueChange={(value) => handleFilterChange('areaOfInterest', value)}
                disabled={interestAreasLoading}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder={interestAreasLoading ? "Carregando..." : "Todas as áreas"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-areas">Todas</SelectItem>
                  {interestAreas.map((area) => (
                    <SelectItem key={area.id} value={area.id} className="text-sm">
                      <div className="flex items-center gap-2">
                        {area.icon && (
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs"
                            style={{ backgroundColor: area.color || '#6B7280' }}
                          >
                            {getIconComponent(area.icon, "h-3 w-3 text-white", 12)}
                          </div>
                        )}
                        <span>{area.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Temática (só aparece se uma área for selecionada) */}
            {filters.areaOfInterest && filters.areaOfInterest !== 'all-areas' && availableSubareas.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="subareaOfInterest" className="text-sm font-medium">Temática</Label>
                <Select 
                  value={filters.subareaOfInterest} 
                  onValueChange={(value) => handleFilterChange('subareaOfInterest', value)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Todas as temáticas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-subareas">Todas</SelectItem>
                    {availableSubareas.map((subarea) => (
                      <SelectItem key={subarea.id} value={subarea.id} className="text-sm">
                        {subarea.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Botão de limpar filtros */}
          {hasActiveFilters && (
            <div className="flex justify-end mt-4">
              <Button 
                variant="ghost" 
                onClick={onClearFilters}
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-0"
              >
                <X className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </div>
      
      {/* Filtros compactos no mobile quando colapsado */}
      <div className={`md:hidden ${!isExpanded ? 'block' : 'hidden'}`}>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Busca sempre visível com design compacto */}
            <div className="space-y-2">
              <Label htmlFor="search-mobile" className="text-sm font-medium">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search-mobile"
                  placeholder="Nome do quiz..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 h-9 text-sm"
                />
                {filters.search && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterChange('search', '')}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Filtros ativos em chips compactos */}
            {hasActiveFilters && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Filtros ativos:</Label>
                <div className="flex flex-wrap gap-2">
                  {filters.faculty && filters.faculty !== 'all-faculties' && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      <span>🏛️ {filters.faculty}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFilterChange('faculty', 'all-faculties')}
                        className="h-4 w-4 p-0 hover:bg-blue-200 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {filters.course && filters.course !== 'all-courses' && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      <span>📚 {filters.course}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFilterChange('course', 'all-courses')}
                        className="h-4 w-4 p-0 hover:bg-green-200 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {filters.courseYear && filters.courseYear !== 'all-years' && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      <span>📅 {filters.courseYear}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFilterChange('courseYear', 'all-years')}
                        className="h-4 w-4 p-0 hover:bg-purple-200 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {filters.areaOfInterest && filters.areaOfInterest !== 'all-areas' && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                      <span>🎯 {interestAreas.find(area => area.id === filters.areaOfInterest)?.name || 'Área'}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFilterChange('areaOfInterest', 'all-areas')}
                        className="h-4 w-4 p-0 hover:bg-orange-200 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default ExploreFilters;
