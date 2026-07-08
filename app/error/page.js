import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ErrorPage({ searchParams }) {
  const errorMessage = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : "Sorry, there was an error during authentication. Please try again.";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/70 text-center shadow-lg">
        <CardContent className="p-8">
          <h1 className="mb-4 text-2xl font-bold text-destructive">
            Authentication Error
          </h1>
          <p className="mb-6 text-muted-foreground">{errorMessage}</p>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
