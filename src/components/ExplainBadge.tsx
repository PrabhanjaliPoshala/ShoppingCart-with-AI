import { Sparkles } from "lucide-react";

interface ExplainBadgeProps {
  text: string;
  className?: string;
}

const ExplainBadge = ({ text, className = "" }: ExplainBadgeProps) => {
  if (!text) return null;
  return (
    <div className={`flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/5 border border-primary/10 ${className}`}>
      <Sparkles className="h-3 w-3 text-primary shrink-0 mt-0.5" />
      <p className="text-[11px] leading-tight text-muted-foreground italic">{text}</p>
    </div>
  );
};

export default ExplainBadge;
