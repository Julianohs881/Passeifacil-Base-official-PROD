
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase";
import { Quiz, parseColorOption } from "../types";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";

const Explore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

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
      })) as (Quiz & { createdBy: string })[];
      
      setQuizzes(transformedData);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Explore Quizzes</h1>
          <Button 
            onClick={() => navigate("/quizzes")}
            variant="outline"
            className="border-blue-500 text-blue-900"
          >
            Meus Quizzes
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D6EFD]"></div>
          </div>
        ) : quizzes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {quizzes.map((quiz) => (
              <Link
                key={quiz.id}
                to={`/quiz/${quiz.id}`}
                className="block"
              >
                <div className={`quiz-card ${quiz.color} p-5 flex flex-col justify-between`}>
                  <div className="absolute top-3 left-3">
                    <span className="bg-white bg-opacity-70 text-xs px-2 py-1 rounded-full flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      Público
                    </span>
                  </div>
                  
                  {/* Título do quiz centralizado */}
                  <div className="flex-grow flex items-center justify-center">
                    <h3 className="text-base font-medium text-white text-center">
                      {quiz.title}
                    </h3>
                  </div>
                  
                  {/* Nome do criador */}
                  <div className="mt-2 text-xs text-white text-right">
                    Por: {(quiz as any).createdBy}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-700">Nenhum quiz público encontrado</h3>
            <p className="mt-2 text-gray-500">Seja o primeiro a compartilhar um quiz público!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Explore;
