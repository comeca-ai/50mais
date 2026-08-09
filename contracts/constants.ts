export const Session = {
  cookieName: "recomeca_sid",
  maxAgeMs: 30 * 24 * 60 * 60 * 1000, // 30 dias
} as const;

export const ErrorMessages = {
  unauthenticated: "É preciso entrar na sua conta para continuar",
  insufficientRole: "Você não tem permissão para fazer isso",
} as const;

export const Paths = {
  login: "/entrar",
  cadastro: "/cadastro",
} as const;
