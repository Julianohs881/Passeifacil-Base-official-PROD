import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, contentType } = await req.json();

    if (!content) {
      throw new Error("Nenhum conteúdo fornecido");
    }

    let extractedText = "";

    // Process based on content type
    if (contentType === "image") {
      // For images, use OCR to extract text
      console.log("Processando imagem com OCR...");
      extractedText = await performOCR(content);
    } else {
      // For direct text input
      console.log("Processando texto direto...");
      extractedText = content;
    }

    if (!extractedText || extractedText.trim() === "") {
      throw new Error("Não foi possível extrair texto do conteúdo fornecido");
    }

    console.log("Texto extraído com sucesso, gerando questão...");

    // Generate question using OpenAI
    const generatedQuestion = await generateQuestionWithOpenAI(extractedText);
    
    console.log("Questão gerada com sucesso");

    return new Response(JSON.stringify(generatedQuestion), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-question function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao processar a solicitação" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function performOCR(base64Image: string) {
  try {
    // Remove data URL prefix if present
    const base64Data = base64Image.includes("base64,") 
      ? base64Image.split("base64,")[1] 
      : base64Image;

    console.log("Enviando imagem para processamento OCR...");
    
    // Using OpenAI's vision capability for OCR
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system", 
            content: "Você é um assistente especializado em extrair texto de imagens com precisão. Extraia todo o texto visível da imagem sem adicionar interpretações ou comentários. Preserve a formatação quando possível, incluindo quebras de linha e espaçamentos importantes. Não omita nenhuma parte do texto, mesmo que pareça irrelevante. Se houver tabelas, diagramas ou elementos gráficos, descreva-os e extraia qualquer texto contido neles."
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Extraia todo o texto desta imagem:" },
              { 
                type: "image_url", 
                image_url: { url: `data:image/jpeg;base64,${base64Data}` } 
              }
            ]
          }
        ],
        max_tokens: 4000
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error("OpenAI OCR error response:", errorText);
      throw new Error(`OCR API error: ${errorText}`);
    }

    const ocrResult = await openAIResponse.json();
    console.log("OCR concluído com sucesso");
    return ocrResult.choices[0].message.content;
  } catch (error) {
    console.error("OCR error:", error);
    throw new Error("Falha ao extrair texto da imagem");
  }
}

function extractFirstJson(text: string) {
  // Procura o primeiro bloco de JSON (objeto ou array)
  const match = text.match(/({[\s\S]*})|\[([\s\S]*)\]/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (e) {
      throw new Error('Falha ao fazer parse do JSON extraído: ' + e.message);
    }
  }
  throw new Error('Nenhum JSON válido encontrado na resposta da IA.');
}

async function generateQuestionWithOpenAI(text: string) {
  try {
    console.log("Enviando texto para geração de questão...");
    
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Você é um assistente especializado em processar textos contendo questões de múltipla escolha extraídas de imagens ou documentos desorganizados. O texto pode estar em qualquer formato: corrido, com ou sem quebras de linha, com ou sem marcadores nas alternativas, com ou sem gabarito explícito.

Sua tarefa é:

1. Analisar o texto inteiro com atenção, mesmo que ele esteja mal formatado.
2. Identificar e extrair corretamente:
   - O enunciado da questão
   - As alternativas (mínimo de 4; crie alternativas plausíveis se necessário)
   - A resposta correta (se presente)
   - A fonte ou referência (se presente)
3. Reorganizar o enunciado com quebras de linha apropriadas (\\n) para melhorar a leitura, mantendo a lógica e a clareza do conteúdo.
4. Gerar sempre pelo menos 4 alternativas distintas e plausíveis.
5. Retornar o resultado em formato JSON válido com os seguintes campos:
   - statement: enunciado formatado com quebras de linha
   - options: array com as alternativas (sem A, B, C, D)
   - correct_index: índice da alternativa correta (0-3)
   - explanation: explicação da resposta (se disponível)
   - source: fonte da questão (se disponível)

Responda APENAS com o JSON válido, sem explicações ou texto adicional.`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.2,
        max_tokens: 4000
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error("OpenAI question generation error response:", errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const result = await openAIResponse.json();
    const responseText = result.choices[0].message.content;
    console.log('Resposta bruta da OpenAI:', responseText);
    try {
      // Usar parser robusto
      const questionData = extractFirstJson(responseText);
      // Validate required fields
      if (!questionData.statement || !Array.isArray(questionData.options) || 
          questionData.options.length < 2 || 
          questionData.correct_index === undefined || 
          questionData.correct_index < 0) {
        throw new Error("Formato de questão inválido ou incompleto");
      }
      // Add metadata
      return {
        ...questionData,
        origin: "importado_via_ia",
        createdAt: new Date().toISOString()
      };
    } catch (jsonError) {
      console.error("Error parsing JSON:", jsonError, responseText);
      throw new Error("A API retornou um formato de JSON inválido");
    }
  } catch (error) {
    console.error("OpenAI error:", error);
    throw error;
  }
}
