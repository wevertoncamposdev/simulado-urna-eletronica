import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import Audit from '@/pages/Audit';
import Candidates from '@/pages/Candidates';
import ConfirmEmail from '@/pages/ConfirmEmail';
import Dashboard from '@/pages/Dashboard';
import ElectoralSystem from '@/pages/ElectoralSystem';
import ForgotPassword from '@/pages/ForgotPassword';
import InstitutionSetup from '@/pages/InstitutionSetup';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Parties from '@/pages/Parties';
import People from '@/pages/People';
import Positions from '@/pages/Positions';
import PublicVoting from '@/pages/PublicVoting';
import Register from '@/pages/Register';
import ResetPassword from '@/pages/ResetPassword';
import Results from '@/pages/Results';
import SessionCreate from '@/pages/SessionCreate';
import SessionDetails from '@/pages/SessionDetails';
import Sessions from '@/pages/Sessions';
import SessionWizard from '@/pages/SessionWizard';
import Timeline from '@/pages/Timeline';
import Voting from '@/pages/Voting';

function LoadingScreen() {
  return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Carregando...</div>;
}

// Só deixa passar com sessão confirmada; sem ela, manda pro login (e lembra de
// onde a pessoa estava, pra voltar depois de entrar). Com sessão mas sem o perfil da
// instituição completo, manda pra tela de configuração obrigatória.
function RequireAuth({ children }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <LoadingScreen />;
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  if (!user?.institutionProfileComplete) {
    return <Navigate to="/configurar-instituicao" replace />;
  }
  return children;
}

// Mesma checagem de sessão do RequireAuth, mas sem exigir o perfil completo — é a
// própria tela que o completa.
function RequireAuthOnly({ children }) {
  const { status } = useAuth();

  if (status === 'loading') return <LoadingScreen />;
  if (status !== 'authenticated') return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Register />} />
        <Route path="confirmar-email" element={<ConfirmEmail />} />
        <Route path="esqueci-senha" element={<ForgotPassword />} />
        <Route path="redefinir-senha/:token" element={<ResetPassword />} />
        <Route
          path="configurar-instituicao"
          element={<RequireAuthOnly><InstitutionSetup /></RequireAuthOnly>}
        />
        <Route path="votar/:token" element={<PublicVoting />} />
        <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
          <Route path="painel" element={<Dashboard />} />
          <Route path="sessoes" element={<Sessions />} />
          <Route path="sessoes/assistente" element={<SessionWizard />} />
          <Route path="sessoes/nova" element={<SessionCreate />} />
          <Route path="sessoes/:id" element={<SessionDetails />} />
          <Route path="sessoes/:id/editar" element={<SessionCreate />} />
          <Route path="cargos" element={<Positions />} />
          <Route path="partidos" element={<Parties />} />
          <Route path="pessoas" element={<People />} />
          <Route path="candidatos" element={<Candidates />} />
          <Route path="votacao" element={<Voting />} />
          <Route path="resultados" element={<Results />} />
          <Route path="auditoria" element={<Audit />} />
          <Route path="sistema-eleitoral" element={<ElectoralSystem />} />
          <Route path="linha-do-tempo" element={<Timeline />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}
