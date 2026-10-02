// Regras do simulador (não representam o sistema eleitoral oficial).
// Qualquer quantidade de dígitos ou ordem de votação deve ser lida daqui.
export const POSITION_RULES = {
  PRESIDENTE:        { label: 'Presidente',        digits: 2, order: 1 },
  GOVERNADOR:        { label: 'Governador',        digits: 2, order: 2 },
  SENADOR:           { label: 'Senador',           digits: 3, order: 3 },
  DEPUTADO_FEDERAL:  { label: 'Deputado Federal',  digits: 4, order: 4 },
  DEPUTADO_ESTADUAL: { label: 'Deputado Estadual', digits: 5, order: 5 },
  PREFEITO:          { label: 'Prefeito',          digits: 2, order: 6 },
  VEREADOR:          { label: 'Vereador',          digits: 5, order: 7 },
};

export const getPositionRule = (code) =>
  Object.hasOwn(POSITION_RULES, code) ? POSITION_RULES[code] : null;

export const listPositions = () =>
  Object.entries(POSITION_RULES)
    .map(([code, rule]) => ({ code, ...rule }))
    .sort((a, b) => a.order - b.order);
