import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { SettingsPage } from './pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, workspace, isLoading, error, loadWorkspaces, logout } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
    </div>;
  }

  if (!workspace) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">Não encontramos seu workspace</h1>
          <p className="mt-2 text-sm text-gray-500">
            Vamos tentar recriar ou recarregar seu ambiente de trabalho.
          </p>
          {error && (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
          )}
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => loadWorkspaces()}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Tentar novamente
            </button>
            <button
              type="button"
              onClick={() => logout()}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  const { user, loadWorkspaces } = useAuthStore();

  useEffect(() => {
    if (user) {
      loadWorkspaces();
    }
  }, [loadWorkspaces, user]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/" replace /> : <LoginPage />
        } />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
