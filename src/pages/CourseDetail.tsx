
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, FileDown, Youtube } from 'lucide-react';

const CourseDetail = () => {
    const { courseId } = useParams();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold capitalize">Curso: {courseId?.replace('-', ' ')}</h1>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Video de la Lección</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                                <Youtube className="w-16 h-16 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Recursos Descargables</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer">
                                    <FileDown className="w-4 h-4" />
                                    <span>Guía de Estudio.pdf</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer">
                                    <FileDown className="w-4 h-4" />
                                    <span>Ejercicios Prácticos.xlsx</span>
                                </li>
                           </ul>
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lecciones del Curso</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                     <li key={i} className="flex items-center gap-3 p-2 rounded-md bg-muted">
                                        <CheckSquare className="w-5 h-5 text-primary" />
                                        <span className="text-sm font-medium">Lección {i + 1}: Introducción</span>
                                     </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default CourseDetail;
