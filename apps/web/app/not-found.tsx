import Link from "next/link";
import Button from "@/shared/components/ui/Button";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-6 p-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
        <AlertTriangle className="h-10 w-10" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          404 - Page not found
        </h2>
        <p className="text-muted-foreground max-w-[500px]">
          We couldn't find the page you're looking for. It might have been moved
          or deleted.
        </p>
      </div>

      <div className="flex gap-4 mt-4">
        <Link href="/">
          <Button variant="primary">Back to Home</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
