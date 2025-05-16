
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase";
import { Quiz, parseColorOption } from "../types";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Eye, Filter, Search, School, Book } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// Extended Quiz type with creator info
interface ExtendedQuiz extends Quiz {
  createdBy: string;
}

const formSchema = z.object({
  search: z.string().optional(),
  faculty: z.string().optional(),
  courseYear: z.string().optional(),
  course: z.string().optional(),
});

type FilterValues = z.infer<typeof formSchema>;

const Explore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [quizzes, setQuizzes] = useState<ExtendedQuiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<ExtendedQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [faculties, setFaculties] = useState<string[]>([]);
  const [courseYears, setCourseYears] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const form = useForm<FilterValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: "",
      faculty: "",
      courseYear: "",
      course: "",
    },
  });
  
  const activeFilters = Object.entries(form.watch()).filter(
    ([_, value]) => value && value.trim() !== ""
  ).length;

  useEffect(() => {
    fetchPublicQuizzes();
  }, []);

  const fetchPublicQuizzes = async () => {
    try {
      setLoading(true);
      // Buscar apenas quizzes públicos
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("visibility", "public")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform the data para garantir que color é uma ColorOption válida
      const transformedData = (data || []).map(item => ({
        ...item,
        color: parseColorOption(item.color),
        // Sem tentar acessar o perfil do usuário por enquanto
        createdBy: "Usuário"
      })) as ExtendedQuiz[];
      
      setQuizzes(transformedData);
      setFilteredQuizzes(transformedData);
      
      // Extract unique values for filters
      const uniqueFaculties = Array.from(
        new Set(transformedData.map((quiz) => quiz.faculty).filter(Boolean))
      ) as string[];
      
      const uniqueCourseYears = Array.from(
        new Set(transformedData.map((quiz) => quiz.course_year).filter(Boolean))
      ) as string[];
      
      const uniqueCourses = Array.from(
        new Set(transformedData.map((quiz) => quiz.course).filter(Boolean))
      ) as string[];
      
      setFaculties(uniqueFaculties);
      setCourseYears(uniqueCourseYears);
      setCourses(uniqueCourses);
    } catch (error) {
      console.error("Error fetching public quizzes:", error);
      toast({
        title: "Erro ao carregar quizzes públicos",
        description: "Não foi possível carregar os quizzes públicos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (values: FilterValues) => {
    let result = [...quizzes];
    
    // Apply search filter
    if (values.search && values.search.trim() !== "") {
      const searchTerm = values.search.toLowerCase().trim();
      result = result.filter(quiz => 
        quiz.title.toLowerCase().includes(searchTerm) ||
        (quiz.faculty && quiz.faculty.toLowerCase().includes(searchTerm)) ||
        (quiz.course && quiz.course.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply faculty filter
    if (values.faculty && values.faculty.trim() !== "") {
      result = result.filter(quiz => 
        quiz.faculty === values.faculty
      );
    }
    
    // Apply course year filter
    if (values.courseYear && values.courseYear.trim() !== "") {
      result = result.filter(quiz => 
        quiz.course_year === values.courseYear
      );
    }
    
    // Apply course filter
    if (values.course && values.course.trim() !== "") {
      result = result.filter(quiz => 
        quiz.course === values.course
      );
    }
    
    setFilteredQuizzes(result);
  };

  const clearFilters = () => {
    form.reset({
      search: "",
      faculty: "",
      courseYear: "",
      course: "",
    });
    
    setFilteredQuizzes(quizzes);
  };
  
  const onSubmit = (values: FilterValues) => {
    applyFilters(values);
  };

  useEffect(() => {
    const subscription = form.watch(() => {
      form.handleSubmit(onSubmit)();
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch, quizzes]);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Explore Quizzes</h1>
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Button 
              onClick={() => navigate("/quizzes")}
              variant="outline"
              className="border-blue-500 text-blue-900"
            >
              Meus Quizzes
            </Button>
          </div>
        </div>
        
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
                    <SelectItem value="">Todas as faculdades</SelectItem>
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
                    <SelectItem value="">Todos os anos</SelectItem>
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
                    <SelectItem value="">Todos os cursos</SelectItem>
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
        
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D6EFD]"></div>
          </div>
        ) : filteredQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {filteredQuizzes.map((quiz) => (
              <Link
                key={quiz.id}
                to={`/quiz/${quiz.id}`}
                className="block"
              >
                <div className={`quiz-card ${quiz.color} p-5 flex flex-col justify-between h-52 relative rounded-lg shadow-md transition-transform hover:scale-105 hover:shadow-lg`}>
                  <div className="absolute top-3 left-3">
                    <span className="bg-white bg-opacity-70 text-xs px-2 py-1 rounded-full flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      Público
                    </span>
                  </div>
                  
                  {/* Visualizar se o usuário atual é o criador para exibir controles */}
                  {user && user.id === quiz.user_id && (
                    <div className="absolute top-3 right-3 bg-white bg-opacity-70 text-xs px-2 py-1 rounded-full">
                      Seu quiz
                    </div>
                  )}
                  
                  {/* Título do quiz centralizado */}
                  <div className="flex-grow flex items-center justify-center">
                    <h3 className="text-base font-medium text-white text-center">
                      {quiz.title}
                    </h3>
                  </div>
                  
                  {/* Informações do curso */}
                  <div className="mt-2 flex flex-col gap-1 text-white">
                    {quiz.faculty && (
                      <div className="flex items-center text-xs">
                        <School className="h-3 w-3 mr-1" />
                        {quiz.faculty}
                      </div>
                    )}
                    {quiz.course && (
                      <div className="flex items-center text-xs">
                        <Book className="h-3 w-3 mr-1" />
                        {quiz.course}
                        {quiz.course_year && ` - ${quiz.course_year}`}
                      </div>
                    )}
                    {!quiz.faculty && !quiz.course && (
                      <div className="h-6"></div>
                    )}
                    
                    {/* Nome do criador */}
                    <div className="text-xs text-white text-right mt-1">
                      Por: {quiz.createdBy}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-700">Nenhum quiz encontrado</h3>
            <p className="mt-2 text-gray-500">
              {activeFilters > 0 
                ? "Tente ajustar seus filtros para encontrar mais resultados." 
                : "Não há quizzes públicos disponíveis."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Explore;
