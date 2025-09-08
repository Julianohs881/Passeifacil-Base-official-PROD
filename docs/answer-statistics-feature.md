# Funcionalidade de Estatísticas das Respostas

## Visão Geral

Esta funcionalidade implementa estatísticas das respostas dos usuários nos quizzes, criando uma sensação de comunidade e feedback coletivo. Os usuários podem ver quantas pessoas escolheram cada opção após responderem uma questão.

## Características

### ✅ Vantagens Implementadas

1. **Sensação de Comunidade**
   - O aluno não estuda sozinho, vê que outras pessoas também estão respondendo
   - Dá a sensação de estar em sala de aula, comparando desempenho

2. **Feedback Coletivo**
   - Se a maioria respondeu errado, o aluno percebe que aquela questão é difícil
   - Se a maioria acertou e só ele errou, é um alerta para revisar melhor

3. **Gatilho de Confiança**
   - Mesmo sem explicação detalhada, ver os números já ajuda o aluno a avaliar o peso da sua escolha
   - Pode estimular o aluno a "refazer" a questão

## Como Funciona na Prática

1. **O usuário responde uma questão**
2. **Imediatamente aparece a estatística:**
   ```
   📊 Respostas da comunidade:
   A: 2 pessoas (4%)
   B: 10 pessoas (20%)
   C: 30 pessoas (60%)
   D: 5 pessoas (10%)
   ```

3. **Mensagem personalizada baseada na resposta:**
   - Se escolheu a opção mais popular: "Você escolheu C. A maioria também escolheu esta opção!"
   - Se escolheu opção diferente: "Você escolheu B. Mas 60% dos usuários escolheram C."

## Implementação Técnica

### Banco de Dados

- **Tabela:** `quiz_answers`
- **Campos:**
  - `id`: UUID (chave primária)
  - `question_id`: UUID (referência para questions)
  - `user_id`: UUID (referência para auth.users)
  - `selected_option`: INTEGER (índice da opção escolhida)
  - `is_correct`: BOOLEAN (se a resposta está correta)
  - `created_at`: TIMESTAMP
  - `updated_at`: TIMESTAMP

### Componentes

1. **`useAnswerStats` Hook**
   - Busca estatísticas das respostas para uma questão
   - Calcula percentuais e contagens
   - Gerencia estados de loading e erro

2. **`AnswerStats` Component**
   - Exibe as estatísticas de forma visual
   - Mostra barras de progresso
   - Inclui mensagens personalizadas

3. **Integração no `QuestionOptions`**
   - Exibe estatísticas após o usuário responder
   - Não interfere na experiência de resposta

### Políticas de Segurança (RLS)

- **Inserção:** Usuários podem inserir suas próprias respostas
- **Visualização:** Qualquer pessoa pode ver as estatísticas (incluindo usuários anônimos)
- **Atualização:** Usuários podem atualizar suas próprias respostas
- **Exclusão:** Usuários podem excluir suas próprias respostas

## Considerações

### Quando Lançar

Esta funcionalidade é excelente para criar engajamento e sensação de comunidade, mas é recomendado lançar após ter uma base de usuários ativa. No início, se só tiver 5 respostas, pode ficar "pobre" a experiência.

### Experiência do Usuário

- As estatísticas só aparecem **após** o usuário responder
- Não influencia a escolha inicial do usuário
- Interface limpa e não intrusiva
- Mensagens personalizadas baseadas na resposta do usuário

### Performance

- Índices criados para otimizar consultas
- Cache de sessão para evitar consultas desnecessárias
- Políticas RLS otimizadas para permitir visualização pública

## Arquivos Modificados/Criados

### Novos Arquivos
- `supabase/migrations/20250109000001_create_quiz_answers_table.sql`
- `src/hooks/useAnswerStats.ts`
- `src/components/Question/AnswerStats.tsx`
- `docs/answer-statistics-feature.md`

### Arquivos Modificados
- `src/types/database.types.ts` - Adicionada tabela quiz_answers
- `src/types/index.ts` - Adicionadas interfaces QuizAnswer e AnswerStats
- `src/hooks/use-quiz.tsx` - Integração para salvar respostas
- `src/components/Question/QuestionOptions.tsx` - Exibição das estatísticas

## Próximos Passos

1. **Aplicar migração no banco de dados**
2. **Testar a funcionalidade com usuários reais**
3. **Monitorar métricas de engajamento**
4. **Considerar adicionar mais análises (tempo de resposta, etc.)**
