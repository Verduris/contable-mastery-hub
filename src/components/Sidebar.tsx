
import { NavLink } from "react-router-dom";
import {
  Book,
  Home,
  Users,
  FileText,
  DollarSign,
  Landmark,
  Calendar,
  BarChart2,
  GraduationCap,
  List,
  FilePlus,
  FileMinus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Catálogo de Cuentas", href: "/cuentas", icon: List },
  { name: "Pólizas", href: "/polizas", icon: FileText },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Cuentas por Cobrar", href: "/cuentas-por-cobrar", icon: FilePlus },
  { name: "Cuentas por Pagar", href: "/cuentas-por-pagar", icon: FileMinus },
  { name: "Facturación", href: "/facturacion", icon: DollarSign },
  { name: "Reportes", href: "/reportes", icon: BarChart2 },
  { name: "Impuestos", href: "/impuestos", icon: Landmark },
  { name: "Agenda Fiscal", href: "/agenda", icon: Calendar },
  { name: "Centro de Aprendizaje", href: "/aprendizaje", icon: GraduationCap },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-card border-r">
      <div className="h-16 flex items-center px-6 border-b">
        <Book className="h-8 w-8 text-primary" />
        <span className="ml-3 text-lg font-semibold">Contabilidad Pro</span>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === "/"}
            className={({ isActive }) =>
              cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              )
            }
          >
            <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
