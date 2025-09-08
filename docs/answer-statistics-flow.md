# Fluxo da Funcionalidade de Estatísticas das Respostas

## Diagrama de Fluxo

```
Usuário acessa questão
        ↓
Usuário escolhe uma opção
        ↓
handleAnswer() é chamado
        ↓
┌─────────────────────────┐
│ 1. Atualiza estado local │
│    - userAnswers        │
│    - questionsStatus    │
└─────────────────────────┘
        ↓
┌─────────────────────────┐
│ 2. Salva no banco       │
│    - quiz_answers       │
│    - upsert por user_id │
└─────────────────────────┘
        ↓
┌─────────────────────────┐
│ 3. Exibe estatísticas   │
│    - useAnswerStats     │
│    - AnswerStats        │
└─────────────────────────┘
        ↓
┌─────────────────────────┐
│ 4. Mostra feedback      │
│    - Contagem por opção │
│    - Percentuais        │
│    - Mensagem personal. │
└─────────────────────────┘
```

## Estrutura de Dados

### Tabela quiz_answers
```
┌─────────────┬─────────────┬─────────────┬─────────────────┬─────────────┬─────────────┐
│ id (UUID)   │ question_id │ user_id     │ selected_option │ is_correct  │ created_at  │
├─────────────┼─────────────┼─────────────┼─────────────────┼─────────────┼─────────────┤
│ abc-123     │ q1-456      │ user-789    │ 2               │ true        │ 2025-01-09  │
│ def-456     │ q1-456      │ user-101    │ 0               │ false       │ 2025-01-09  │
│ ghi-789     │ q1-456      │ user-202    │ 2               │ true        │ 2025-01-09  │
└─────────────┴─────────────┴─────────────┴─────────────────┴─────────────┴─────────────┘
```

### Estatísticas Calculadas
```
Para question_id = q1-456:
┌─────────────┬───────┬─────────────┬─────────────┐
│ Opção       │ Count │ Percentual  │ is_correct  │
├─────────────┼───────┼─────────────┼─────────────┤
│ A (index 0) │ 1     │ 33%         │ false       │
│ B (index 1) │ 0     │ 0%          │ false       │
│ C (index 2) │ 2     │ 67%         │ true        │
│ D (index 3) │ 0     │ 0%          │ false       │
└─────────────┴───────┴─────────────┴─────────────┘
```

## Interface do Usuário

### Antes de Responder
```
┌─────────────────────────────────────────┐
│ Qual é a capital do Brasil?             │
│                                         │
│ ○ A) São Paulo                          │
│ ○ B) Rio de Janeiro                     │
│ ○ C) Brasília                           │
│ ○ D) Belo Horizonte                     │
└─────────────────────────────────────────┘
```

### Após Responder (com estatísticas)
```
┌─────────────────────────────────────────┐
│ Qual é a capital do Brasil?             │
│                                         │
│ ○ A) São Paulo                          │
│ ● B) Rio de Janeiro  ✗                  │
│ ○ C) Brasília        ✓                  │
│ ○ D) Belo Horizonte                     │
│                                         │
│ 📊 Respostas da comunidade: 👥 3 pessoas│
│ ┌─────────────────────────────────────┐ │
│ │ A: 1 pessoa (33%) ████              │ │
│ │ B: 0 pessoas (0%)                   │ │
│ │ C: 2 pessoas (67%) ████████████ ✓   │ │
│ │ D: 0 pessoas (0%)                   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Você escolheu B. Mas 67% dos usuários   │
│ escolheram C.                           │
└─────────────────────────────────────────┘
```

## Políticas de Segurança

### Row Level Security (RLS)
```
┌─────────────────────────────────────────┐
│ Políticas da tabela quiz_answers:       │
│                                         │
│ INSERT: auth.uid() = user_id            │
│ SELECT: true (público para estatísticas)│
│ UPDATE: auth.uid() = user_id            │
│ DELETE: auth.uid() = user_id            │
└─────────────────────────────────────────┘
```

## Considerações de Performance

### Índices Criados
- `idx_quiz_answers_question_id` - Para buscar respostas por questão
- `idx_quiz_answers_user_id` - Para buscar respostas por usuário
- `idx_quiz_answers_created_at` - Para ordenação temporal

### Otimizações
- Upsert para evitar duplicatas
- Cache de sessão para evitar consultas desnecessárias
- Consulta otimizada com apenas campos necessários
