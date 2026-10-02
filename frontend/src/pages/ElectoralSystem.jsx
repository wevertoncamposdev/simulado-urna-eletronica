import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { POSITIONS_INFO, positionSlug } from '@/content/electoral-system';

const SYSTEM_VARIANT = { Majoritário: 'dark', Proporcional: 'default' };

// Página de referência sobre o sistema eleitoral brasileiro: cargos, mandatos,
// poderes, abrangência e a regra de turno único vs. dois turnos. Conteúdo
// estático (não depende da API) para funcionar como material de consulta,
// inclusive a partir de um link direto para um cargo (`#presidente`, etc.).
export default function ElectoralSystem() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const target = document.getElementById(location.hash.slice(1));
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <PageHeader
        title="Sistema eleitoral brasileiro"
        description="Para quem vai votar no simulador: o que cada cargo faz, quanto dura o mandato e quando existe segundo turno."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Poder Executivo x Legislativo</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            O Executivo (Presidente, Governador, Prefeito) administra; o Legislativo (Senador,
            Deputados, Vereador) elabora leis e fiscaliza o Executivo.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Federal, estadual e municipal</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Cada cargo atua em um nível diferente de governo — o que é decidido numa esfera não
            interfere diretamente nas outras.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Majoritário x proporcional</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            No majoritário vence quem tem mais votos individuais. No proporcional, as vagas são
            divididas entre partidos conforme o total de votos de cada um.
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Turno único x dois turnos</CardTitle>
          <CardDescription>A regra que decide se a eleição termina em outubro ou tem uma segunda rodada.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 pt-0 text-sm text-muted-foreground">
          <p>
            Só cargos majoritários podem ter 2º turno — e só quando ninguém atinge maioria
            absoluta (mais de 50% dos votos válidos, sem contar brancos e nulos) no 1º turno. Nesse
            caso, os dois candidatos mais votados disputam uma segunda rodada.
          </p>
          <p>
            Presidente e Governador seguem sempre essa regra. Prefeito só tem 2º turno em
            municípios com mais de 200 mil eleitores. Senador é majoritário mas nunca tem 2º
            turno. Cargos proporcionais (Deputados e Vereador) também são sempre em turno único.
          </p>
          <p className="italic">
            Neste simulador, "permite 2º turno" é uma opção por cargo (tela de Cargos) — ative para
            quem deve seguir a regra de maioria absoluta. Quando ninguém alcança a maioria, a tela
            de Resultados mostra quem disputaria a segunda rodada e deixa criar essa sessão com um
            clique, já com os dois candidatos registrados.
          </p>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Cargos</h2>
        {POSITIONS_INFO.map((position) => (
          <Card key={position.code} id={positionSlug(position.code)} className="scroll-mt-4">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{position.label}</CardTitle>
                <Badge variant={SYSTEM_VARIANT[position.system]}>{position.system}</Badge>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>{position.power}</span>
                <span>·</span>
                <span>{position.scope}</span>
                <span>·</span>
                <span>Mandato de {position.term}</span>
                <span>·</span>
                <span>{position.rounds}</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 pt-0 text-sm text-muted-foreground">
              <p>{position.summary}</p>
              <p>{position.roundsDetail}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
