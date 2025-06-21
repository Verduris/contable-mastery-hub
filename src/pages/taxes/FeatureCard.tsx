
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status?: 'coming_soon';
  className?: string;
}

export const FeatureCard = ({ title, description, icon, status, className }: FeatureCardProps) => {
  return (
    <Card className={cn(
      "relative h-full transition-all duration-200 hover:shadow-md",
      status === 'coming_soon' && "opacity-60",
      className
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
          </div>
          {status === 'coming_soon' && (
            <Badge variant="secondary" className="text-xs">
              Próximamente
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};
