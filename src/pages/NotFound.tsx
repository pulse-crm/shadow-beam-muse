import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h2 className="mt-2 text-xl font-semibold">Page not found</h2>
      <p className="mt-1 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
      <Button asChild className="mt-6">
        <Link to="/dashboard">
          <Home className="h-3.5 w-3.5" /> Go to dashboard
        </Link>
      </Button>
    </div>
  );
}
