import { Navigate, useLocation } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import React, { useEffect, useState } from 'react';
import { ADMIN_EMAIL } from '../config';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { inProgress, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  const userEmail = accounts[0]?.username || localStorage.getItem('userEmail') || '';
  const isAdmin = userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Verificamos tanto o MSAL quanto o localStorage (legado) para garantir transição suave
  const localRole = localStorage.getItem('userRole');
  const userHasAccess = isAuthenticated || (localRole !== null && localRole !== 'public');

  // Só mostramos o loading se o MSAL estiver de fato trabalhando
  const isLoading = inProgress !== 'none';

  if (isLoading) {
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

  const isCurator = localStorage.getItem('isCurator') === 'true';

  // Regra Estrita: Apenas o Admin oficial ou Curadores aprovados podem acessar o Dashboard
  if (location.pathname.includes('/dashboard') && !isAdmin && !isCurator) {
    console.warn('[AUTH] Acesso bloqueado ao Dashboard: Usuário não tem nível de curadoria.');
    return <Navigate to="/" replace />;
  }

  // Se houver papéis específicos exigidos para outras rotas (ex: editores)
  if (allowedRoles && !allowedRoles.includes(localRole || '') && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
