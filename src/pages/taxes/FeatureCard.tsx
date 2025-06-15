
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    status: 'available' | 'coming_soon';
    className?: string;
}

export const FeatureCard = ({ title, description, icon, status, className }: FeatureCardProps) => {
    return (
        <Card className={cn("flex flex-col", className, status === 'coming_soon' && "bg-muted/50")}>
            <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
            {status === 'coming_soon' && (
                <div className="p-6 pt-0">
                    <Badge variant="secondary">Próximamente</Badge>
                </div>
            )}
        </Card>
    );
};
