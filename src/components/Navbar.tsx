import { History, Search, Bell, UserCircle, Menu, X, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { ADMIN_EMAIL } from '../config';
import logoImg from '../assets/logo.png';

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
  const [palette, setPalette] = useState(localStorage.getItem('palette') || 'default');
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.remove('theme-1', 'theme-2', 'theme-3', 'theme-4', 'theme-5', 'theme-6');
    if (palette !== 'default') {
      document.documentElement.classList.add(palette);
    }
    localStorage.setItem('palette', palette);
  }, [palette]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95">
          <img src={logoImg} alt="Alanson Costela - Amplificação Cultural" className="h-[76px] w-auto drop-shadow-md" />
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
                <span className="text-[10px] font-black uppercase text-white bg-red-500 px-2 py-0.5 rounded-full tracking-widest">
                  {badgeLabel}
                </span>
              )}
              
              {/* Temporary Client Theme Switcher */}
              <div className="flex items-center gap-1.5 ml-8 mr-2 border-l border-slate-200 dark:border-slate-800 pl-6 relative group">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Aprovação do Cliente</span>
                <button 
                  onClick={() => setPalette('theme-1')} 
                  className={`w-5 h-5 rounded-full bg-[#DE993B] border-2 shadow-sm transition-transform hover:scale-110 ${palette === 'theme-1' ? 'border-primary ring-2 ring-primary/30' : 'border-white'}`} 
                  title="Amarelo / Laranja" 
                />
                <button 
                  onClick={() => setPalette('theme-2')} 
                  className={`w-5 h-5 rounded-full bg-[#E75E16] border-2 shadow-sm transition-transform hover:scale-110 ${palette === 'theme-2' ? 'border-primary ring-2 ring-primary/30' : 'border-white'}`} 
                  title="Laranja Vivo" 
                />
                <button 
                  onClick={() => setPalette('theme-3')} 
                  className={`w-5 h-5 rounded-full bg-[#6B8B64] border-2 shadow-sm transition-transform hover:scale-110 ${palette === 'theme-3' ? 'border-primary ring-2 ring-primary/30' : 'border-white'}`} 
                  title="Verde Musgo e Laranja (Base)" 
                />
                <button 
                  onClick={() => setPalette('theme-4')} 
                  className={`w-5 h-5 rounded-full bg-gradient-to-br from-[#E75E16] to-[#6B8B64] border-2 shadow-sm transition-transform hover:scale-110 ${palette === 'theme-4' ? 'border-primary ring-2 ring-primary/30' : 'border-white'}`} 
                  title="Misturado: Laranja c/ Verde" 
                />
                <button 
                  onClick={() => setPalette('theme-5')} 
                  className={`w-5 h-5 rounded-full bg-gradient-to-br from-[#6B8B64] to-[#E75E16] border-2 shadow-sm transition-transform hover:scale-110 ${palette === 'theme-5' ? 'border-primary ring-2 ring-primary/30' : 'border-white'}`} 
                  title="Misturado: Verde c/ Laranja" 
                />
                <button 
                  onClick={() => setPalette('theme-6')} 
                  className={`w-5 h-5 rounded-full bg-gradient-to-tr from-[#6B8B64] via-[#DE993B] to-[#E75E16] border-2 shadow-sm transition-transform hover:scale-110 ${palette === 'theme-6' ? 'border-primary ring-2 ring-primary/30' : 'border-white'}`} 
                  title="Misturado 3 Cores: Verde, Laranja e Amarelo" 
                />
                <button 
                  onClick={() => setPalette('default')} 
                  className={`w-5 h-5 rounded-full bg-slate-300 border-2 shadow-sm transition-transform hover:scale-110 flex items-center justify-center text-[8px] font-black text-white ${palette === 'default' ? 'border-slate-500 ring-2 ring-slate-400/30' : 'border-white'}`} 
                  title="Padrão Original"
                >
                  X
                </button>
              </div>

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
