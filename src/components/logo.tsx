
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="font-bold text-2xl text-sidebar-primary">
        <span className="text-primary">Alugue</span>
        <span className="text-foreground">Tudo</span>
      </span>
    </div>
  );
}
