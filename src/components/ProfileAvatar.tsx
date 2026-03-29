import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ProfileAvatarProps {
  className?: string
}

export function ProfileAvatar({ className }: ProfileAvatarProps) {
  return (
    <Avatar className={cn(className)}>
      <AvatarImage src="/images/profile.png" alt="Lyes Tarzalt" />
      <AvatarFallback>LT</AvatarFallback>
    </Avatar>
  )
}
