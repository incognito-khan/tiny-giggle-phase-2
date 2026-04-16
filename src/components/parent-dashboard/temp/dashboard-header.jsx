import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export function DashboardHeader({ name, age, birthDate, avatarSrc, avatarFallback }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 border border-rose-100 mb-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 md:h-20 md:w-20 ring-4 ring-purple-200 ring-offset-2 flex-shrink-0">
          <AvatarImage src={avatarSrc || "/placeholder.svg"} alt={name} />
          <AvatarFallback className="bg-gradient-to-br from-pink-300 to-purple-300 text-white font-bold text-sm md:text-base">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-700">{name}</h1>
          <p className="text-base md:text-lg text-purple-600 font-medium">{age}</p>
          <p className="text-xs text-slate-500">{birthDate}</p>
        </div>
      </div>
    </div>
  );
}
