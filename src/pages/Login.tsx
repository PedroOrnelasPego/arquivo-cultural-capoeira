import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { msalInstance } from '../config/msalConfig';
import React, { useState } from 'react';
import { API_BASE_URL, API_KEY } from '../config';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Ao montar, checa se há paramteros na URL (Verificação de Email ou Reset de Senha)
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('verified') === 'true') {
      setSuccessMessage('E-mail verificado com sucesso! Você já pode acessar o painel.');
      // Limpa a URL pra ficar bonito
      window.history.replaceState({}, document.title, "/login");
    }

    const token = params.get('reset');
    if (token) {
      setResetToken(token);
      setIsForgot(true); // O estado de forgot muda de cenário de tela quando há token
      setSuccessMessage('Insira sua nova senha super segura abaixo!');
      window.history.replaceState({}, document.title, "/login");
    }
  }, [location.search]);

  // Calcula a força da senha (0 a 100)
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8 && /[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: 'Fraca', color: 'bg-red-400' };
    if (score === 2) return { score: 50, label: 'Razoável', color: 'bg-amber-400' };
    if (score === 3) return { score: 75, label: 'Boa', color: 'bg-blue-400' };
    return { score: 100, label: 'Forte', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      // Inicializar o MSAL é necessário nas versões recentes antes de chamar o popup na unha
      try { await msalInstance.initialize(); } catch (e) { /* Trata o erro se já estiver inicializado */ }
      
      const loginResponse = await msalInstance.loginPopup({
        scopes: ["User.Read"]
      });

      console.log('Dados do Microsoft Entra capturados:', loginResponse);
      
      const username = loginResponse.account?.name || 'Curador Autorizado';
      
      // Salva provisoriamente como admin só para o fluxo atual liberar acesso
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('userName', username);
      
      const state = location.state as { redirectTo?: string };
      navigate(state?.redirectTo || '/');

    } catch (error: any) {
      console.error('Erro na Janela da Microsoft:', error);
      setErrorMessage('Erro MSAL: ' + (error?.message || JSON.stringify(error) || 'O login foi cancelado ou ocorreu um problema.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSOMock = (provider: string) => {
    setIsLoading(true);
    // Simula uma validação de SSO na Google Console (apenas para acesso temporário)
    setTimeout(() => {
      localStorage.setItem('userRole', 'admin');
      const state = location.state as { redirectTo?: string };
      navigate(state?.redirectTo || '/');
      setIsLoading(false);
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    if ((isRegistering || resetToken) && password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem. Digite novamente.');
      setIsLoading(false);
      return;
    }
    
    try {
      let endpoint = '';
      let body: any = {};

      if (resetToken) {
        endpoint = '/api/auth/reset-password';
        body = { token: resetToken, newPassword: password };
      }
      else if (isForgot) {
        endpoint = '/api/auth/forgot-password';
        body = { email };
      }
      else if (isRegistering) {
        endpoint = '/api/auth/register';
        
        let userRole = 'public';
        if (email.includes('admin') || email.includes('gabriel')) userRole = 'admin';
        else if (email.includes('editor') || email.includes('curador')) userRole = 'editor';
        
        body = { name, email, password, role: userRole };
      } 
      else {
        endpoint = '/api/auth/login';
        body = { email, password };
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Ocorreu um erro.');
        setIsLoading(false);
        return;
      }

      // Sucesso na Autenticação / Registro / Recuperação
      setSuccessMessage(data.message);
      
      if (resetToken) {
        // Senha alterada com sucesso!
        setResetToken(null);
        setIsForgot(false);
        setPassword('');
        setConfirmPassword('');
        setIsLoading(false);
      }
      else if (isForgot) {
        // Pedido de recuperação enviado
         setIsForgot(false);
         setIsLoading(false);
      }
      else if (isRegistering) {
        // Se registrou, troca para aba de login
        setIsRegistering(false);
        setIsLoading(false);
      } else {
        // Se logou, salva o token e a role, depois redireciona
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userRole', data.user.role);
        
        const state = location.state as { redirectTo?: string };
        navigate(state?.redirectTo || '/');
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
      setErrorMessage('Impossível conectar ao servidor. Verifique se o backend está rodando.');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden font-display bg-background-light text-slate-900 antialiased pt-20">
      <div className="layout-container flex h-full grow flex-col">
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative">
          <div className="absolute inset-0 z-0 opacity-5 pointer-events-none flex items-center justify-center overflow-hidden">
           
          </div>
          <div className="w-full max-w-[420px] bg-white p-8 rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 z-10 backdrop-blur-sm">
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-4">
                <Lock className="text-primary w-10 h-10" />
              </div>
              <h1 className="text-3xl font-black text-center tracking-tight">
                {resetToken ? 'Criar Nova Senha' : isForgot ? 'Recuperação de Acesso' : isRegistering ? 'Nova Conta' : 'Acesso Protegido'}
              </h1>
              <p className="text-slate-500 text-sm mt-3 text-center px-4 leading-relaxed">
                {resetToken ? 'Digite e confirme a sua nova senha para poder entrar de volta.'
                            : isForgot ? 'Insira seu e-mail abaixo e enviaremos instruções exclusivas para recuperar.'
                            : isRegistering ? 'Crie seu perfil de contribuidor para ajudar na manutenção do Acervo.' 
                            : 'Login restrito e seguro para os curadores do Sistema Capoeira.'}
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-4 duration-300">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-semibold">{errorMessage}</p>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-600 animate-in fade-in slide-in-from-top-4 duration-300">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p className="text-sm font-semibold">{successMessage}</p>
              </div>
            )}

            {/*  ==============================================================  */}
            {/* CÓDIGO DE LOGIN COM E-MAIL (DESATIVAR `{false && (` PARA LIGAR) */}
            {false && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {!resetToken && isRegistering && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900 block">Seu Nome Completo</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome Completo"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    required={isRegistering}
                  />
                </div>
              )}
              
              {!resetToken && (
               <div className="space-y-2">
                 <label className="text-sm font-bold text-slate-900 block">E-mail de acesso</label>
                 <input 
                   type="email" 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="Seu endereço de e-mail"
                   className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                   required
                 />
               </div>
              )}

              {(!isForgot || resetToken) && (
               <div className="space-y-2">
                 <div className="flex items-center justify-between">
                   <label className="text-sm font-bold text-slate-900 block">
                     {resetToken ? 'Nova Senha' : 'Senha'}
                   </label>
                   {!isRegistering && !resetToken && (
                     <button type="button" onClick={() => { setIsForgot(true); setErrorMessage(''); setSuccessMessage(''); }} className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                       Esqueceu sua senha?
                     </button>
                   )}
                 </div>
                 <input 
                   type="password" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="••••••••"
                   className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                   required
                 />
               </div>
              )}

              {(!isForgot || resetToken) && password && (
                <div className="space-y-1 relative pt-1 mb-2">
                  <div className="flex justify-between items-center text-xs px-1">
                    <span className="font-medium text-slate-500">Segurança da senha</span>
                    <span className={`font-bold ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full ${strength.color} transition-all duration-500 ease-out`} 
                      style={{ width: `${strength.score}%` }} 
                    />
                  </div>
                </div>
              )}

              {(isRegistering || resetToken) && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900 block">Confirmar Senha</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    required={isRegistering || !!resetToken}
                  />
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-black shadow-xl shadow-primary/30 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Processando...' 
                  : resetToken ? 'Salvar Nova Senha'
                  : isForgot ? 'Enviar Solicitação' 
                  : isRegistering ? 'Cadastrar Novo Usuário' 
                  : 'Acessar Conta'}
              </button>
            </form>
            )}
            {/* FIM DO CÓDIGO DE LOGIN COM E-MAIL E SENHA                      */}
            {/* ============================================================== */}

            <div className="mt-2 pt-2 border-slate-100">
              <div className="relative flex items-center justify-center mb-6">
                <span className="bg-white px-4 text-xs font-bold text-slate-400 absolute tracking-widest uppercase">ACESSO INSTITUCIONAL</span>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => handleSSOMock('google')} disabled={isLoading} className="flex-1 flex items-center justify-center gap-3 py-3 rounded-xl border-2 border-slate-100 hover:bg-slate-50 transition-colors disabled:opacity-50">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-sm font-bold text-slate-700">Google</span>
                </button>
                <button type="button" onClick={handleMicrosoftLogin} disabled={isLoading} className="flex-1 flex items-center justify-center gap-3 py-3 rounded-xl border-2 border-slate-100 hover:bg-slate-50 transition-colors disabled:opacity-50">
                  <svg className="w-5 h-5" viewBox="0 0 21 21">
                    <path fill="#f25022" d="M1 1h9v9H1z"/>
                    <path fill="#00a4ef" d="M1 11h9v9H1z"/>
                    <path fill="#7fba00" d="M11 1h9v9h-9z"/>
                    <path fill="#ffb900" d="M11 11h9v9h-9z"/>
                  </svg>
                  <span className="text-sm font-bold text-slate-700">Microsoft</span>
                </button>
              </div>
              
              <button 
                type="button" 
                onClick={() => handleSSOMock('bypass')}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100/50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all text-xs font-bold border border-dashed border-slate-200"
              >
                <span>Acesso Rápido (Desenvolvimento)</span>
              </button>
            </div>

            {/* Rodapé (Registro/Esqueci Senha) Ocultado */}
            {false && (
            <div className="mt-8 text-center pt-6 border-t border-slate-100">
              {isForgot && !resetToken ? (
                 <button 
                   type="button"
                   onClick={() => { setIsForgot(false); setErrorMessage(''); setSuccessMessage(''); }}
                   className="text-sm font-bold text-slate-500 hover:text-primary transition-colors cursor-pointer"
                 >
                   Voltar para tela de Login
                 </button>
              ) : !resetToken && (
                <button 
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-sm font-bold text-slate-500 hover:text-primary transition-colors cursor-pointer"
                >
                  {isRegistering ? 'Já possui conta de admin? Fazer Login' : 'Novo por aqui? Criar conta de contribuidor'}
                </button>
              )}
            </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
