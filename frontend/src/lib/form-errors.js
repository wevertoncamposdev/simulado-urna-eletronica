// Descobre qual campo originou um erro do backend a partir do código (ex.: PARTY_NUMBER_... → "number").
// `rules` é uma lista de [trecho do código, nome do campo]; vale a primeira que casar.
export function fieldOfError(error, rules) {
  if (!error?.code) return null;
  const hit = rules.find(([token]) => error.code.includes(token));
  return hit ? hit[1] : null;
}
