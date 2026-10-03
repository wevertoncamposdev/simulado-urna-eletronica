import { institutionProfileRepository } from '../repositories/institution-profile.repository.js';

// Verificado a cada requisição protegida (exceto as marcadas com skipProfileCheck) —
// não dá pra confiar num campo no JWT porque o perfil pode ser completado depois do
// token já emitido, sem precisar de um novo login.
export async function isInstitutionProfileComplete(userId) {
  return Boolean(await institutionProfileRepository.findByUserId(userId));
}
