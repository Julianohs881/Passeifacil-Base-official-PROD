# Modelo de Acesso de 30% - Plano Gratuito

## Visão Geral

Implementei o modelo de acesso de 30% para usuários do plano gratuito, permitindo que eles respondam apenas 30% das questões de qualquer quiz da comunidade. Esta estratégia cria curiosidade e frustração positiva, incentivando a conversão para o plano PRO.

**✅ IMPORTANTE:** A aba "Comunidade" é acessível para todos os usuários (gratuitos e PRO). Usuários gratuitos podem ver todos os quizzes, mas só conseguem responder 30% das questões de cada quiz.

## Como Funciona

### 📊 Cálculo do Limite
- **Quiz com 10 questões** → libera 3 grátis (30%)
- **Quiz com 20 questões** → libera 6 grátis (30%)
- **Quiz com 50 questões** → libera 15 grátis (30%)
- **Usuários PRO** → acesso total a todas as questões
- **Criadores do quiz** → acesso total aos seus próprios quizzes (mesmo sendo gratuito)
- **Visualização de quizzes** → todos os usuários podem ver todos os quizzes da comunidade

### 🎯 Vantagens do Modelo

1. **Escalável e Justo**
   - Funciona independente do tamanho do quiz
   - Sempre mantém a proporção de 30%
   - Criadores têm acesso total aos seus próprios quizzes
   - Comunidade acessível para todos os usuários

2. **Curiosidade e Frustração Positiva**
   - Usuário começa o quiz mas não consegue concluir
   - Cria desejo de ver o resultado completo
   - Apenas em quizzes da comunidade (não nos próprios)

3. **Experiência Contínua**
   - Pode ver todos os quizzes da comunidade
   - Sempre tem algo novo para experimentar
   - Criadores podem usar seus quizzes normalmente
   - Acesso completo à comunidade sem restrições de visualização

4. **Evita Burla**
   - Diferente de "7 dias grátis" ou "primeiro quiz completo"
   - Não dá brecha para usar e descartar
   - Criadores não são afetados pelos limites
   - Comunidade aberta incentiva descoberta de conteúdo

## Implementação Técnica

### 🏗️ Arquitetura

```
useQuizAccessLimits Hook
├── Calcula limite de 30%
├── Verifica acesso por questão
├── Gerencia mensagens de limite
└── Fornece informações de progresso

QuizAccessLimits Component
├── Barra de progresso visual
├── Mensagens de limite atingido
├── Prompts de upgrade
└── Informações sobre questões bloqueadas

SidebarQuestionList
├── Mostra questões bloqueadas com ícone 🔒
├── Cores diferenciadas para questões inacessíveis
└── Tooltips explicativos
```

### 📁 Arquivos Criados/Modificados

**Novos Arquivos:**
- `src/hooks/useQuizAccessLimits.ts` - Lógica de limites
- `src/components/Quiz/QuizAccessLimits.tsx` - Interface de limites
- `docs/30-percent-access-model.md` - Esta documentação

**Arquivos Modificados:**
- `src/hooks/use-quiz.tsx` - Integração dos limites
- `src/pages/Quiz.tsx` - Exibição dos componentes
- `src/components/SidebarQuestionList.tsx` - Questões bloqueadas

### 🎨 Interface do Usuário

#### Barra de Progresso
```
┌─────────────────────────────────────────┐
│ 📈 Progresso do Quiz         3 de 10    │
│ ████████████████░░░░░░░░░░░░░░░░░░░░░░  │
│ 30% do quiz completo    7 questões grátis│
└─────────────────────────────────────────┘
```

#### Mensagem de Limite Atingido
```
┌─────────────────────────────────────────┐
│ 🔒 Limite do plano gratuito atingido    │
│                                         │
│ Você respondeu 3 de 10 questões (30%). │
│ Desbloqueie o restante com o plano PRO! │
│                                         │
│ [👑 Fazer upgrade para PRO]             │
└─────────────────────────────────────────┘
```

#### Questões Bloqueadas na Sidebar
```
┌─────────────────────────────────────────┐
│ Questões                                │
│ ┌─────────────────────────────────────┐ │
│ │ ● Correta  ✗ Incorreta  ○ Não resp.│ │
│ │ 🔒 Bloqueada                        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 1  Questão 1                           │
│ 2  Questão 2                           │
│ 3  Questão 3                           │
│ 🔒 Questão 4 (bloqueada)               │
│ 🔒 Questão 5 (bloqueada)               │
└─────────────────────────────────────────┘
```

### 🔧 Funcionalidades Implementadas

1. **Verificação de Acesso**
   - `isQuestionAccessible(index)` - Verifica se questão está acessível
   - `hasReachedLimit(currentIndex)` - Verifica se atingiu o limite

2. **Informações de Progresso**
   - `getProgressInfo()` - Calcula estatísticas de progresso
   - `getAccessibleQuestionsCount()` - Quantas questões são acessíveis

3. **Mensagens Contextuais**
   - `getLimitMessage()` - Mensagem quando atinge limite
   - `getProgressMessage()` - Aviso quando está próximo do limite

4. **Navegação Inteligente**
   - Bloqueia navegação para questões inacessíveis
   - Mostra toast de erro ao tentar acessar questão bloqueada

### 🎯 Experiência do Usuário

#### Fluxo Normal
1. **Usuário acessa quiz** → Vê todas as questões na sidebar
2. **Responde questões** → Barra de progresso atualiza
3. **Atinge 30%** → Aparece mensagem de limite
4. **Tenta continuar** → Bloqueado com prompt de upgrade

#### Estados Visuais
- **Questões acessíveis**: Cores normais (azul, verde, vermelho, cinza)
- **Questões bloqueadas**: Cinza com ícone de cadeado
- **Barra de progresso**: Mostra % do quiz completo
- **Mensagens**: Contextuais e não intrusivas

### 📈 Métricas e Conversão

#### Pontos de Conversão
1. **Barra de progresso** - Mostra o que está perdendo
2. **Questões bloqueadas** - Visualização clara do conteúdo restrito
3. **Mensagem de limite** - Call-to-action direto
4. **Toast de erro** - Feedback imediato ao tentar acessar

#### Estratégias de Conversão
- **Curiosidade**: "O que tem nas outras questões?"
- **Frustração positiva**: "Quase consegui, só falta o PRO"
- **Valor percebido**: "Vou perder 70% do conteúdo se não assinar"

### 🔒 Segurança e Performance

- **Verificação client-side**: Rápida e responsiva
- **Verificação server-side**: Via RLS no banco de dados
- **Cache inteligente**: Evita recálculos desnecessários
- **Fallback gracioso**: Funciona mesmo com erros de rede

### 🚀 Próximos Passos

1. **A/B Testing**: Testar diferentes percentuais (25%, 30%, 35%)
2. **Analytics**: Medir taxa de conversão por quiz
3. **Personalização**: Diferentes limites por categoria de quiz
4. **Gamificação**: Badges por completar 30% de vários quizzes

## Conclusão

O modelo de 30% implementado oferece uma experiência balanceada que:
- ✅ Permite experimentação suficiente
- ✅ Cria desejo de upgrade
- ✅ É justo e transparente
- ✅ Funciona em qualquer tamanho de quiz
- ✅ Evita abusos do sistema gratuito

Esta implementação está pronta para uso e deve gerar conversões significativas! 🎉
