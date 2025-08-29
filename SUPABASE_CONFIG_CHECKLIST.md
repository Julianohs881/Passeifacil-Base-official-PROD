# Checklist de Configuração do Supabase para Recuperação de Senha

## 🔧 Configurações no Supabase Dashboard

### 1. Authentication > URL Configuration
- [ ] **Site URL**: Deve ser `http://localhost:8080` (desenvolvimento) ou sua URL de produção
- [ ] **Redirect URLs**: Adicionar `http://localhost:8080/reset-password` (desenvolvimento)
- [ ] **Redirect URLs**: Adicionar `http://localhost:8080/auth/callback` (desenvolvimento)

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

### Erro: "Email link is invalid or has expired"
**Causas possíveis:**
1. **URL de redirecionamento incorreta** no Supabase Dashboard
2. **Tempo de expiração muito baixo** no JWT
3. **Problema com detectSessionInUrl** no cliente
4. **Tokens não estão sendo processados** corretamente

**Soluções:**
1. Verificar se as URLs de redirecionamento estão corretas no Dashboard
2. Aumentar o JWT expiry para pelo menos 3600 segundos
3. Verificar se `detectSessionInUrl: true` está configurado
4. Verificar se o flowType está como 'pkce'

### Erro: "403 Forbidden"
**Causas possíveis:**
1. **CORS não configurado** corretamente
2. **Políticas de segurança** muito restritivas
3. **Tokens inválidos** ou expirados

**Soluções:**
1. Verificar configurações de CORS no Dashboard
2. Verificar políticas de segurança
3. Implementar retry logic para tokens expirados

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

### 3. URL de Redirecionamento (Porta 8080)
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin.replace(':5173', ':8080')}/reset-password`, // ✅ IMPORTANTE
});
```

## 🧪 Testes Recomendados

### 1. Teste de Conexão
- Abrir console do navegador
- Verificar se não há erros de conexão
- Verificar se as variáveis de ambiente estão carregadas

### 2. Teste de Recuperação
- Solicitar email de recuperação
- Verificar se o email chega
- Clicar no link do email
- Verificar se redireciona corretamente para porta 8080
- Verificar se a sessão é criada

### 3. Debug no Console
- Verificar logs de "Supabase auth state change"
- Verificar se há erros específicos

## 🔍 Logs para Verificar

No console do navegador, você deve ver:
```
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
2. Verificar configurações no Dashboard
3. Testar com um projeto Supabase limpo
4. Verificar se há problemas de rede/CORS

## 🔍 **Onde Encontrar as Configurações no Seu Supabase:**

### 1. **URL Configuration** (mais importante):
- Vá para **Authentication** no menu lateral
- Clique em **URL Configuration**
- Adicione estas URLs:
  - `http://localhost:8080/reset-password`
  - `http://localhost:8080/auth/callback`

### 2. **Emails**:
- Vá para **Authentication** no menu lateral
- Clique em **Emails**
- Verifique se o template "Reset password" está configurado

### 3. **Sessions**:
- Vá para **Authentication** no menu lateral
- Clique em **Sessions**
- Verifique o "JWT expiry" (deve ser pelo menos 3600 segundos)
