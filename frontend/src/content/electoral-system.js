// Conteúdo educacional sobre o sistema eleitoral brasileiro.
// Estático e independente da API: o objetivo é explicar o modelo real, então os
// códigos abaixo espelham (mas não dependem d)os de `POSITION_RULES` no backend.
export const POSITIONS_INFO = [
  {
    code: 'PRESIDENTE',
    label: 'Presidente da República',
    power: 'Executivo',
    scope: 'Federal',
    system: 'Majoritário',
    rounds: 'Pode ter 2º turno',
    term: '4 anos',
    summary:
      'Chefe do Poder Executivo federal: comanda a administração pública da União, sanciona ' +
      'ou veta leis e representa o Brasil internacionalmente.',
    roundsDetail:
      'Vai para o 2º turno, entre os dois candidatos mais votados, se ninguém alcançar maioria ' +
      'absoluta (mais de 50% dos votos válidos, sem contar brancos e nulos) no 1º turno.',
  },
  {
    code: 'GOVERNADOR',
    label: 'Governador',
    power: 'Executivo',
    scope: 'Estadual',
    system: 'Majoritário',
    rounds: 'Pode ter 2º turno',
    term: '4 anos',
    summary:
      'Chefe do Poder Executivo estadual (ou distrital, no caso do Distrito Federal): administra o ' +
      'estado, propõe o orçamento e sanciona leis estaduais.',
    roundsDetail:
      'Mesma regra do Presidente: 2º turno entre os dois mais votados se nenhum passar de 50% dos ' +
      'votos válidos no 1º turno.',
  },
  {
    code: 'SENADOR',
    label: 'Senador',
    power: 'Legislativo',
    scope: 'Federal',
    system: 'Majoritário',
    rounds: 'Turno único',
    term: '8 anos',
    summary:
      'Representa o estado (3 vagas por estado, independente da população) no Senado Federal. ' +
      'As eleições se alternam, a cada 4 anos, entre renovar 1/3 e 2/3 das vagas de cada estado.',
    roundsDetail:
      'Mesmo sendo um cargo majoritário, o Senado nunca tem 2º turno — o(s) mais votado(s) já ' +
      'vence(m) no 1º turno, qualquer que seja a votação.',
  },
  {
    code: 'DEPUTADO_FEDERAL',
    label: 'Deputado Federal',
    power: 'Legislativo',
    scope: 'Federal',
    system: 'Proporcional',
    rounds: 'Turno único',
    term: '4 anos',
    summary:
      'Representa o estado na Câmara dos Deputados, elaborando e votando leis federais e ' +
      'fiscalizando o Poder Executivo.',
    roundsDetail:
      'No sistema proporcional não existe 2º turno: as cadeiras do estado são distribuídas entre ' +
      'os partidos/federações conforme o total de votos de cada um (voto de legenda + candidatos), ' +
      'e dentro de cada partido assumem os mais votados individualmente.',
  },
  {
    code: 'DEPUTADO_ESTADUAL',
    label: 'Deputado Estadual',
    power: 'Legislativo',
    scope: 'Estadual',
    system: 'Proporcional',
    rounds: 'Turno único',
    term: '4 anos',
    summary:
      'Representa a população do estado na Assembleia Legislativa, legislando sobre temas estaduais ' +
      'e fiscalizando o governo do estado.',
    roundsDetail: 'Mesma lógica proporcional dos Deputados Federais, aplicada à Assembleia Legislativa do estado.',
  },
  {
    code: 'PREFEITO',
    label: 'Prefeito',
    power: 'Executivo',
    scope: 'Municipal',
    system: 'Majoritário',
    rounds: 'Pode ter 2º turno (cidades grandes)',
    term: '4 anos',
    summary:
      'Chefe do Poder Executivo municipal: administra a prefeitura, os serviços públicos locais e ' +
      'sanciona leis municipais.',
    roundsDetail:
      'Só existe 2º turno em municípios com mais de 200 mil eleitores. Nos demais, vence quem tiver ' +
      'mais votos válidos no 1º turno, mesmo sem maioria absoluta.',
  },
  {
    code: 'VEREADOR',
    label: 'Vereador',
    power: 'Legislativo',
    scope: 'Municipal',
    system: 'Proporcional',
    rounds: 'Turno único',
    term: '4 anos',
    summary:
      'Representa a população do município na Câmara Municipal, legislando sobre temas locais e ' +
      'fiscalizando a prefeitura.',
    roundsDetail: 'Mesma lógica proporcional dos demais cargos legislativos, aplicada à Câmara Municipal.',
  },
];

export const getPositionInfo = (code) => POSITIONS_INFO.find((p) => p.code === code) ?? null;

export const positionSlug = (code) => code.toLowerCase().replaceAll('_', '-');
