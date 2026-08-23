/** Rótulos de exibição para valores de enum do conteúdo. */
export const DIFFICULTY_LABEL: Record<string, string> = {
  facil: 'Fácil',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

export const SPECIALTY_LABEL: Record<string, string> = {
  cardiologia: 'Cardiologia',
  pneumologia: 'Pneumologia',
};

export const specialtyLabel = (id: string) => SPECIALTY_LABEL[id] ?? id;

/**
 * Sinais vitais: a chave do JSON é um código curto, e a tela mostra a
 * abreviação que se lê em prontuário. Sem entrada no mapa, exibe a própria
 * chave — um sinal novo aparece, só que sem tipografia caprichada.
 */
export const VITAL_LABEL: Record<string, string> = {
  pa: 'PA',
  fc: 'FC',
  fr: 'FR',
  sato2: 'SatO₂',
  tax: 'Tax',
  hgt: 'HGT',
  dor: 'Dor',
};
