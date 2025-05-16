
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/NavBar";

// Extracted components
import ExploreFilters, { formSchema } from "@/components/Explore/ExploreFilters";
import QuizzesGrid from "@/components/Explore/QuizzesGrid";
import { useExploreQuizzes } from "@/components/Explore/useExploreQuizzes";

const Explore = () => {
  const navigate = useNavigate();
  
  const {
    filteredQuizzes,
    loading,
    faculties,
    courseYears,
    courses,
    applyFilters,
    clearFilters,
    setFilteredQuizzes,
    quizzes
  } = useExploreQuizzes();
  
  const form = useForm({
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

  const handleClearFilters = () => {
    form.reset(clearFilters());
    setFilteredQuizzes(quizzes);
  };
  
  const onSubmit = (values: any) => {
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
        
        <ExploreFilters 
          form={form}
          faculties={faculties}
          courseYears={courseYears}
          courses={courses}
          clearFilters={handleClearFilters}
        />
        
        <QuizzesGrid 
          quizzes={filteredQuizzes} 
          loading={loading}
          activeFilters={activeFilters}
        />
      </main>
    </div>
  );
};

export default Explore;
