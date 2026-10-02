import { Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import Audit from '@/pages/Audit';
import Candidates from '@/pages/Candidates';
import Dashboard from '@/pages/Dashboard';
import Parties from '@/pages/Parties';
import Results from '@/pages/Results';
import SessionCreate from '@/pages/SessionCreate';
import SessionDetails from '@/pages/SessionDetails';
import Sessions from '@/pages/Sessions';
import Voting from '@/pages/Voting';

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="sessoes" element={<Sessions />} />
          <Route path="sessoes/nova" element={<SessionCreate />} />
          <Route path="sessoes/:id" element={<SessionDetails />} />
          <Route path="sessoes/:id/editar" element={<SessionCreate />} />
          <Route path="partidos" element={<Parties />} />
          <Route path="candidatos" element={<Candidates />} />
          <Route path="votacao" element={<Voting />} />
          <Route path="resultados" element={<Results />} />
          <Route path="auditoria" element={<Audit />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}
