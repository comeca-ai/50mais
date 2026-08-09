import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center border-2">
        <CardHeader>
          <CardTitle className="font-display text-5xl font-bold">404</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-lg text-muted-foreground">
            Ops! Esta página não existe ou foi movida.
          </p>
          <Button asChild size="lg" className="h-12 w-full text-base font-bold">
            <Link to="/">Voltar para o início</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
