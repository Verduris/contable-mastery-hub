
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, CheckCircle2, Star, Trophy, Medal } from 'lucide-react';

const progressData = {
    completedLessons: 12,
    totalLessons: 45,
    percentage: Math.round((12 / 45) * 100),
};

const achievements = [
    { name: "Primeros Pasos", icon: Star, description: "Completa tu primera lección.", achieved: true },
    { name: "Maestro de Clientes", icon: Award, description: "Completa el módulo de Clientes.", achieved: true },
    { name: "Rey de la Facturación", icon: Trophy, description: "Completa el módulo de Facturación.", achieved: true },
    { name: "Ninja de los Impuestos", icon: Medal, description: "Completa el módulo de Impuestos.", achieved: false },
    { name: "Contador Experto", icon: CheckCircle2, description: "Completa todos los módulos de aprendizaje.", achieved: false },
];

const LearningProgress = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Mi Progreso e Insignias</h1>
            <p className="text-muted-foreground">
                Sigue tu evolución en la plataforma y colecciona insignias por tus logros.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>Progreso General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Lecciones completadas</span>
                        <span className="font-medium">{progressData.completedLessons} / {progressData.totalLessons}</span>
                    </div>
                    <Progress value={progressData.percentage} className="h-4" />
                    <div className="text-right font-bold text-lg text-primary">{progressData.percentage}% Completado</div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Insignias y Logros</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {achievements.map((ach) => {
                        const Icon = ach.icon;
                        return (
                            <div key={ach.name} className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${ach.achieved ? 'bg-secondary' : 'opacity-60 bg-muted/50 hover:opacity-100'}`}>
                                <Icon className={`h-10 w-10 flex-shrink-0 ${ach.achieved ? 'text-amber-500' : 'text-muted-foreground'}`} />
                                <div>
                                    <p className="font-semibold">{ach.name}</p>
                                    <p className="text-xs text-muted-foreground">{ach.description}</p>
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        </div>
    )
}

export default LearningProgress;
