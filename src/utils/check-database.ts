import { supabase } from "./supabase";

export const checkAndCreateDescriptionColumn = async () => {
  try {
    // Verificar se a coluna description existe
    const { data, error } = await supabase
      .from("quizzes")
      .select("description")
      .limit(1);

    if (error) {
      console.log("Coluna description não existe, criando...");
      
      // Tentar executar uma query SQL para adicionar a coluna
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS description TEXT'
      });

      if (alterError) {
        console.error("Erro ao criar coluna description:", alterError);
        return false;
      }

      console.log("Coluna description criada com sucesso!");
      return true;
    }

    console.log("Coluna description já existe");
    return true;
  } catch (error) {
    console.error("Erro ao verificar/criar coluna description:", error);
    return false;
  }
};

// Função para verificar a estrutura atual da tabela
export const checkTableStructure = async () => {
  try {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .limit(1);

    if (error) {
      console.error("Erro ao verificar estrutura da tabela:", error);
      return;
    }

    if (data && data.length > 0) {
      const quiz = data[0];
      console.log("Estrutura atual da tabela quizzes:");
      console.log("Campos disponíveis:", Object.keys(quiz));
      console.log("Exemplo de quiz:", quiz);
    }
  } catch (error) {
    console.error("Erro ao verificar estrutura:", error);
  }
};
