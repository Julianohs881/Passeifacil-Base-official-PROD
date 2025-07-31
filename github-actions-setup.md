# Configuração do GitHub Actions para Verificar Assinaturas

## ✅ Workflow já criado!

O arquivo `.github/workflows/check-subscriptions.yml` já está configurado e vai:
- ✅ **Executar automaticamente** todos os dias às 2h da manhã
- ✅ **Permitir execução manual** via GitHub Actions
- ✅ **Mostrar logs detalhados** do processo

## 🔑 Configurar Secrets no GitHub

### Passo 1: Obter as chaves do Supabase

1. **Acesse:** https://supabase.com/dashboard
2. **Selecione seu projeto**
3. **Vá em "Settings" → "API"**
4. **Copie:**
   - **Project URL:** `https://[PROJECT-REF].supabase.co`
   - **anon public:** `[SEU-ANON-KEY]`

### Passo 2: Adicionar Secrets no GitHub

1. **Acesse:** https://github.com/Julianohs881/quiz-builder-universe
2. **Clique em "Settings"** (aba do repositório)
3. **Vá em "Secrets and variables" → "Actions"**
4. **Clique em "New repository secret"**
5. **Adicione 2 secrets:**

#### Secret 1:
- **Name:** `SUPABASE_PROJECT_REF`
- **Value:** `[SEU-PROJECT-REF]` (apenas a parte do ref, sem a URL completa)

#### Secret 2:
- **Name:** `SUPABASE_ANON_KEY`
- **Value:** `[SEU-ANON-KEY]` (a chave anon public completa)

## 🚀 Como funciona

### Execução Automática:
- **Cron:** `0 2 * * *` = Todos os dias às 2h da manhã
- **Ação:** Chama a função `check-expired-subscriptions`
- **Resultado:** Usuários expirados viram gratuito automaticamente

### Execução Manual:
1. **GitHub** → **Actions** → **Check Expired Subscriptions**
2. **Clique em "Run workflow"**
3. **Selecione branch** (geralmente `main`)
4. **Clique em "Run workflow"**

## 📊 Monitoramento

### Ver logs:
1. **GitHub** → **Actions**
2. **Clique no workflow "Check Expired Subscriptions"**
3. **Clique na execução mais recente**
4. **Veja os logs detalhados**

### Logs esperados:
```
🔍 Verificando assinaturas expiradas...
📊 Status Code: 200
📄 Response: {"message":"Nenhum usuário com assinatura expirada encontrado"}
✅ Verificação concluída com sucesso!
```

## 🧪 Teste Manual

### Via GitHub Actions:
1. **Actions** → **Check Expired Subscriptions** → **Run workflow**

### Via Terminal:
```bash
curl -X GET \
  "https://[SEU-PROJECT-REF].supabase.co/functions/v1/check-expired-subscriptions" \
  -H "Authorization: Bearer [SEU-ANON-KEY]" \
  -H "apikey: [SEU-ANON-KEY]"
```

## ⚠️ Importante

- **As secrets são criptografadas** e não aparecem nos logs
- **O workflow só funciona** se as secrets estiverem configuradas
- **Primeira execução:** Configure as secrets e execute manualmente para testar

## 🎯 Próximos passos

1. **Configure as secrets** no GitHub
2. **Teste manualmente** via GitHub Actions
3. **Verifique os logs** para confirmar funcionamento
4. **Aguarde a execução automática** às 2h da manhã

**Pronto! Seu sistema de renovação automática está configurado!** 🎉 