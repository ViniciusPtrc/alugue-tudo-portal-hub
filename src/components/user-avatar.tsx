
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface UserAvatarProps {
  user?: {
    name?: string;
    image?: string;
  };
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarImage src={user?.image} alt={user?.name || "Avatar do usuário"} />
      <AvatarFallback>
        {user?.name ? (
          user.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()
        ) : (
          <User className="h-4 w-4" />
        )}
      </AvatarFallback>
    </Avatar>
  );
}
