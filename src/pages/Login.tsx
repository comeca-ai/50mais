import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-2">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-3xl">
            Bem-vindo(a) à Recomeça
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-center text-lg text-muted-foreground">
            Entre para acessar as aulas, participar da comunidade e se
            candidatar às vagas.
          </p>
          <Button
            className="h-14 w-full text-lg font-bold"
            size="lg"
            onClick={() => {
              window.location.href = getOAuthUrl();
            }}
          >
            Entrar com a conta Kimi
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
