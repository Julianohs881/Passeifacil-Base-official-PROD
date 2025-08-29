# Checklist de Configuração do Supabase para Recuperação de Senha

## 🔧 Configurações no Supabase Dashboard

### 1. Authentication > URL Configuration
**DESENVOLVIMENTO:**
- [ ] **Site URL**: Deve ser `http://localhost:8080` (desenvolvimento)
- [ ] **Redirect URLs**: Adicionar `http://localhost:8080/reset-password` (desenvolvimento)
- [ ] **Redirect URLs**: Adicionar `http://localhost:8080/auth/callback` (desenvolvimento)

**PRODUÇÃO:**
- [ ] **Site URL**: Deve ser `https://passeifacil.com.br` (produção)
- [ ] **Redirect URLs**: Adicionar `https://passeifacil.com.br/reset-password` (produção)
- [ ] **Redirect URLs**: Adicionar `https://passeifacil.com.br/auth/callback` (produção)

### 2. Authentication > Emails
- [ ] **Confirm signup**: Verificar se está configurado
- [ ] **Reset password**: Verificar se está configurado
- [ ] **Change email address**: Verificar se está configurado

### 3. Authentication > Sign In / Providers
- [ ] **Email**: ✅ Habilitado
- [ ] **Google**: ✅ Habilitado (se usar)
- [ ] **Outros provedores**: Configurar conforme necessário

### 4. Authentication > Sessions
- [ ] **JWT expiry**: Verificar se não está muito baixo (recomendado: 3600 segundos = 1 hora)
- [ ] **Refresh token rotation**: ✅ Habilitado

## 🚨 Problemas Comuns e Soluções

### Erro: "Email link is invalid or has expired" (PRODUÇÃO)
**Causas possíveis:**
1. **URL de redirecionamento incorreta** no Supabase Dashboard para produção
2. **Site URL incorreto** no Dashboard
3. **Token expirado** devido a configurações de tempo
4. **CORS não configurado** para domínio de produção

**Soluções:**
1. ✅ **Verificar se as URLs de produção estão corretas no Dashboard:**
   - `https://passeifacil.com.br/reset-password`
   - `https://passeifacil.com.br/auth/callback`
2. ✅ **Verificar se Site URL está como `https://passeifacil.com.br`**
3. ✅ **Aumentar JWT expiry para pelo menos 3600 segundos**
4. ✅ **Verificar configurações de CORS para produção**

### Erro: "403 Forbidden" (PRODUÇÃO)
**Causas possíveis:**
1. **URLs de redirecionamento não configuradas** para produção
2. **Site URL incorreto** no Dashboard
3. **Políticas de segurança** muito restritivas para produção

**Soluções:**
1. ✅ **Adicionar URLs de produção no Dashboard**
2. ✅ **Verificar Site URL**
3. ✅ **Verificar políticas de segurança**

## 📋 Verificações no Código

### 1. Variáveis de Ambiente
```bash
# .env.local ou .env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 2. Configuração do Cliente
```typescript
export const supabase = createClient(url, key, {
  auth: {
    detectSessionInUrl: true,  // ✅ IMPORTANTE
    flowType: 'pkce',         // ✅ IMPORTANTE
  }
});
```

### 3. URL de Redirecionamento (Automático)
```typescript
// O código agora detecta automaticamente o ambiente
const isProduction = window.location.hostname !== 'localhost';
const redirectUrl = isProduction 
  ? 'https://passeifacil.com.br/reset-password'
  : 'http://localhost:8080/reset-password';
```

## 🧪 Testes Recomendados

### 1. Teste de Conexão
- Abrir console do navegador
- Verificar se não há erros de conexão
- Verificar se as variáveis de ambiente estão carregadas

### 2. Teste de Recuperação (PRODUÇÃO)
- Acessar `https://passeifacil.com.br/forgot-password`
- Solicitar email de recuperação
- Verificar se o email chega
- Clicar no link do email
- Verificar se redireciona corretamente para `https://passeifacil.com.br/reset-password`
- Verificar se a sessão é criada

### 3. Debug no Console
- Verificar logs de "Supabase auth state change"
- Verificar se há erros específicos
- Verificar se as URLs de redirecionamento estão corretas

## 🔍 Logs para Verificar

No console do navegador, você deve ver:
```
URL de redirecionamento: https://passeifacil.com.br/reset-password
Supabase URL: [sua_url]
Supabase Anon Key: [sua_chave]
=== DEBUG SUPABASE CONFIG ===
✅ Configurado
✅ Configurado
Supabase Client URL: [sua_url]
Supabase Client Key: ✅ Configurado
Auth Config: { ... }
URL Atual: [url_atual]
Parâmetros da URL: { ... }
=== FIM DEBUG ===
```

## 📞 Suporte

Se os problemas persistirem:
1. Verificar logs do console
2. Verificar configurações no Dashboard (PRODUÇÃO)
3. Testar com um projeto Supabase limpo
4. Verificar se há problemas de rede/CORS

## 🔍 **Onde Encontrar as Configurações no Seu Supabase (PRODUÇÃO):**

### 1. **URL Configuration** (CRÍTICO):
- Vá para **Authentication** no menu lateral
- Clique em **URL Configuration**
- **Adicione estas URLs de PRODUÇÃO:**
  - `https://passeifacil.com.br/reset-password`
  - `https://passeifacil.com.br/auth/callback`
- **Verifique se Site URL está como:** `https://passeifacil.com.br`

### 2. **Emails**:
- Vá para **Authentication** no menu lateral
- Clique em **Emails**
- Verifique se o template "Reset password" está configurado

### 3. **Sessions**:
- Vá para **Authentication** no menu lateral
- Clique em **Sessions**
- Verifique o "JWT expiry" (deve ser pelo menos 3600 segundos)

## 🚀 **Deploy das Alterações:**

Após fazer as configurações no Supabase Dashboard:
1. **Fazer commit** das alterações no código
2. **Fazer deploy** para produção
3. **Testar** o fluxo de recuperação de senha
4. **Verificar** se não há mais erros 403
