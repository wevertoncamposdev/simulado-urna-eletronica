export const CANDIDATE_STATUS = Object.freeze({ ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' });

export const CANDIDATE_LIMITS = Object.freeze({
  nameMaxLength: 100,
  photoMaxLength: 500,
});

// Campos que definem "quem é" o candidato na urna. Depois que a votação abre, ficam travados.
export const CANDIDATE_IDENTITY_FIELDS = Object.freeze(['partyId', 'position', 'number']);
