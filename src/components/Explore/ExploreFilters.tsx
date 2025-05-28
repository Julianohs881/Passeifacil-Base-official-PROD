
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExploreFiltersProps {
  filters: {
    search: string;
    faculty: string;
    course: string;
    year: string;
  };
  onFiltersChange: (filters: any) => void;
}

const ExploreFilters = ({ filters, onFiltersChange }: ExploreFiltersProps) => {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
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
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="Engenharia">Engenharia</SelectItem>
                <SelectItem value="Medicina">Medicina</SelectItem>
                <SelectItem value="Direito">Direito</SelectItem>
                <SelectItem value="Administração">Administração</SelectItem>
                <SelectItem value="Psicologia">Psicologia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course">Curso</Label>
            <Input
              id="course"
              placeholder="Nome do curso..."
              value={filters.course}
              onChange={(e) => handleFilterChange('course', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Ano</Label>
            <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="1">1º Ano</SelectItem>
                <SelectItem value="2">2º Ano</SelectItem>
                <SelectItem value="3">3º Ano</SelectItem>
                <SelectItem value="4">4º Ano</SelectItem>
                <SelectItem value="5">5º Ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button 
            variant="outline" 
            onClick={() => onFiltersChange({ search: '', faculty: '', course: '', year: '' })}
          >
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExploreFilters;
