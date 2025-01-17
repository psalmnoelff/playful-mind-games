import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface GameCardProps {
  title: string;
  description: string;
  color: string;
  to: string;
  icon: React.ReactNode;
}

export function GameCard({ title, description, color, to, icon }: GameCardProps) {
  return (
    <Link
      to={to}
      className={cn(
        "group relative overflow-hidden rounded-lg p-8 hover:shadow-xl transition-all duration-300",
        "bg-white border-2 hover:-translate-y-1",
        color
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{icon}</div>
          <h3 className="text-2xl font-bold">{title}</h3>
        </div>
        <p className="text-gray-600">{description}</p>
      </div>
      <div className="absolute bottom-0 left-0 h-1 w-full bg-current opacity-20 group-hover:opacity-40 transition-opacity" />
    </Link>
  );
}