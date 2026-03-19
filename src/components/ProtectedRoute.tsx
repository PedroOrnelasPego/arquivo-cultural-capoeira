import { Navigate, useLocation } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import React, { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  // Verificamos tanto o MSAL quanto o localStorage (legado) para garantir transição suave
  const localRole = localStorage.getItem('userRole');
  const userHasAccess = isAuthenticated || (localRole !== null && localRole !== 'public');

  useEffect(() => {
    // Simula uma pequena checagem de autoridade
    const timer = setTimeout(() => setIsChecking(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Validando Acesso...</p>
        </div>
      </div>
    );
  }

  if (!userHasAccess) {
    // Redireciona para o login salvando a intenção de navegação
    return <Navigate to="/login" state={{ redirectTo: location.pathname }} replace />;
  }

  // Se houver papéis específicos exigidos
  if (allowedRoles && !allowedRoles.includes(localRole || '')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
