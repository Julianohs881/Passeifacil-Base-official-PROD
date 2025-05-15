
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
            content: "Você é um assistente especializado em extrair texto de imagens com precisão. Extraia todo o texto visível da imagem sem adicionar interpretações ou comentários."
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
        max_tokens: 1500
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
            content: `Você é um assistente especializado em criar questões de múltipla escolha de alta qualidade.

Baseado no texto fornecido, crie uma questão seguindo estas regras:
1. Crie um enunciado claro e educativo.
2. Forneça 5 alternativas (A, B, C, D e E).
3. Apenas uma alternativa deve ser correta.
4. As alternativas incorretas devem ser plausíveis.
5. Indique qual é a alternativa correta.

Forneça o resultado como um objeto JSON com os seguintes campos:
- statement: o enunciado da questão
- options: array com as 5 alternativas sem os identificadores (A, B, C, D, E)
- correct_index: índice da alternativa correta (0 para A, 1 para B, etc.)
- explanation: explicação sobre por que a resposta correta é a correta
- source: fonte da informação (deixe em branco se não for possível identificar)

Certifique-se de que o JSON seja válido e esteja estruturado adequadamente.`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error("OpenAI question generation error response:", errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const result = await openAIResponse.json();
    const responseText = result.choices[0].message.content;
    
    try {
      // Extract JSON from response text (in case OpenAI adds any commentary)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      const questionData = JSON.parse(jsonString);
      
      // Validate required fields
      if (!questionData.statement || !Array.isArray(questionData.options) || 
          questionData.options.length !== 5 || 
          questionData.correct_index === undefined || 
          questionData.correct_index < 0 || 
          questionData.correct_index > 4) {
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
    throw new Error("Falha ao gerar questão com IA");
  }
}
