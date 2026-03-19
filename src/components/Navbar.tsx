import { History, Search, Bell, UserCircle, Menu, X, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { ADMIN_EMAIL } from '../config';

export default function Navbar() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isDashboard = location.pathname.includes('/dashboard');
  
  // 1. Monitoramento de Sessão Microsoft (Para depuração direta no console F12)
  useEffect(() => {
    if (isAuthenticated && accounts.length > 0) {
      console.log('--- Identificação de Sessão (Login Monitor) ---');
      console.log('Usuário Microsoft Logado:', accounts[0].name);
      console.log('E-mail Oficial:', accounts[0].username);
      console.log('ID Local (Home Tenant):', accounts[0].homeAccountId);
      console.log('----------------------------------------------');
    } else {
      console.log('Nenhum usuário Microsoft autenticado no momento.');
    }
  }, [isAuthenticated, accounts]);

  // Sincroniza informações: MSAL (prioridade) + LocalStorage
  const role = localStorage.getItem('userRole');
  const isCuratorFlag = localStorage.getItem('isCurator') === 'true';
  const account = accounts[0];
  const userName = account?.name || localStorage.getItem('userName') || 'Usuário';
  const userEmail = account?.username || localStorage.getItem('userEmail') || '';
  const isAdmin = userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  
  // Decide se mostra a badge administrativa
  let badgeLabel = '';
  if (isAdmin || role === 'admin') badgeLabel = 'ADMINISTRADOR';
  else if (isCuratorFlag) badgeLabel = 'MODERADOR';

  const isAdminOrEditor = role === 'admin' || isCuratorFlag || isAdmin || (role && role.startsWith('curador-'));

  // Theme support
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    // Limpa estado local de forma agressiva
    localStorage.clear();
    
    // Se estiver logado via MSAL, faz o logout completo
    if (isAuthenticated) {
      instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin,
      });
    } else {
      window.location.href = '/';
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-lg border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
            <History className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold leading-none tracking-tight text-slate-900">Arquivo Cultural</h1>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Capoeira</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className={`text-sm font-bold ${!isDashboard ? 'text-primary' : 'text-slate-500 hover:text-primary transition-colors'}`}>Acervo</Link>
          <a href="#" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">História</a>
          
          {isAdminOrEditor && (
            <Link to="/dashboard" className={`text-sm font-bold ${isDashboard ? 'text-emerald-700 bg-emerald-100 border-emerald-200' : 'text-emerald-600 bg-emerald-50 border-emerald-100'} hover:text-emerald-700 transition-colors px-3 py-1.5 rounded-lg border`}>
              Painel ADM
            </Link>
          )}

          {(role || isAuthenticated) ? (
            <div className="flex items-center gap-4 ml-6 pl-6 border-l border-slate-200 dark:border-slate-800">
              <div className="flex flex-col items-end mr-2">
                <span className="text-sm font-bold text-slate-900 leading-tight">{userName}</span>
                <span className="text-[10px] text-slate-400 font-medium">{userEmail}</span>
              </div>
              {badgeLabel && (
                <span className="text-[10px] font-black text-white uppercase tracking-widest px-3 py-1 bg-primary dark:bg-primary rounded-full shadow-lg shadow-primary/20 transition-all">
                  {badgeLabel}
                </span>
              )}
              <button 
                onClick={toggleTheme} 
                className="p-2.5 rounded-full border-2 border-slate-200 text-slate-500 hover:bg-slate-100 transition-all dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                aria-label="Alternar Tema"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={handleLogout} className="px-5 py-2 rounded-full border-2 border-slate-200 text-slate-500 text-sm font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all">
                Sair
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 ml-6 pl-6 border-l border-slate-200 dark:border-slate-800">
              <Link to="/login" className="px-5 py-2 rounded-full border-2 border-primary text-primary text-sm font-bold hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/20">
                Acesso
              </Link>
            </div>
          )}
        </nav>

        <button className="md:hidden p-2 text-slate-500" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
