import { Link } from "react-router-dom";
import { Lock, LogIn, UserPlus } from "lucide-react";
export default function LoginPrompt({
  title,
  description,
  icon
}) {
  return <div className="container py-20 flex flex-col items-center text-center">
      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        {icon || <Lock className="h-10 w-10 text-primary" />}
      </div>
      <h1 className="font-display text-3xl font-bold text-foreground mb-3">{title}</h1>
      <p className="text-muted-foreground mb-8 max-w-md">{description}</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
          <LogIn className="h-4 w-4" /> Sign In
        </Link>
        <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-border text-foreground font-medium hover:border-primary hover:text-primary transition-colors">
          <UserPlus className="h-4 w-4" /> Create Account
        </Link>
      </div>
    </div>;
}
