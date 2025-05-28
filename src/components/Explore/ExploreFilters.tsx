
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent>
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
    </Card>
  );
};

export default ExploreFilters;
