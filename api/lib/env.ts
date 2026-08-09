import "dotenv/config";

/**
 * Leitura de ambiente TOLERANTE A FALHAS.
 * Nenhuma variável ausente derruba o servidor: cada recurso degrada
 * individualmente (ver checks dbEnabled/emailEnabled/uploadEnabled).
 */
function opt(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  port: parseInt(process.env.PORT || "3000", 10),
  appUrl: opt("APP_URL", `http://localhost:${process.env.PORT || 3000}`),
  appSecret: opt("APP_SECRET"),
  databaseUrl: opt("DATABASE_URL"),
  ownerEmail: opt("OWNER_EMAIL").toLowerCase(),
  resendApiKey: opt("RESEND_API_KEY"),
  resendFrom: opt("RESEND_FROM", "Recomeça <ola@recomeca.ia.br>"),
  s3Endpoint: opt("S3_ENDPOINT"),
  s3Bucket: opt("S3_BUCKET"),
  s3AccessKeyId: opt("S3_ACCESS_KEY_ID"),
  s3SecretAccessKey: opt("S3_SECRET_ACCESS_KEY"),

  get dbEnabled() {
    return this.databaseUrl.length > 0;
  },
  get authEnabled() {
    return this.appSecret.length > 0;
  },
  get emailEnabled() {
    return this.resendApiKey.length > 0;
  },
  get uploadEnabled() {
    return (
      this.s3Endpoint.length > 0 &&
      this.s3Bucket.length > 0 &&
      this.s3AccessKeyId.length > 0 &&
      this.s3SecretAccessKey.length > 0
    );
  },
};
