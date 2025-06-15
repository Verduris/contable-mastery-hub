import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import JournalEntries from "./pages/JournalEntries";
import Clients from "./pages/Clients";
import Reports from "./pages/Reports";
import Invoicing from "./pages/Invoicing";
import Taxes from "./pages/Taxes";
import TaxCalendar from "./pages/TaxCalendar";
import LearningCenter from "./pages/LearningCenter";
import CourseDetail from "./pages/CourseDetail";
import NotFound from "./pages/NotFound";
import IncomeByClientReport from "./pages/reports/IncomeByClientReport";
import ClientStatement from "./pages/ClientStatement";
import BankReconciliation from "./pages/BankReconciliation";
import ExpensesBySupplierReport from "./pages/reports/ExpensesBySupplierReport";
import IncomeStatementReport from "./pages/reports/IncomeStatementReport";
import CashFlowReport from "./pages/reports/CashFlowReport";
import RankingReport from './pages/reports/RankingReport';
import AgingReport from './pages/reports/AgingReport';

const queryClient = new QueryClient();

import AccountsReceivable from "./pages/AccountsReceivable";
import AccountsPayable from "./pages/AccountsPayable";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cuentas" element={<Accounts />} />
            <Route path="/polizas" element={<JournalEntries />} />
            <Route path="/clientes" element={<Clients />} />
            <Route path="/clientes/:clientId/estado-de-cuenta" element={<ClientStatement />} />
            <Route path="/cuentas-por-cobrar" element={<AccountsReceivable />} />
            <Route path="/cuentas-por-pagar" element={<AccountsPayable />} />
            <Route path="/reportes" element={<Reports />} />
            <Route path="/reportes/ingresos-por-cliente" element={<IncomeByClientReport />} />
            <Route path="/reportes/egresos-por-proveedor" element={<ExpensesBySupplierReport />} />
            <Route path="/reportes/estado-de-resultados" element={<IncomeStatementReport />} />
            <Route path="/reportes/flujo-de-caja" element={<CashFlowReport />} />
            <Route path="/reportes/ranking-clientes-proveedores" element={<RankingReport />} />
            <Route path="/reportes/vencimientos" element={<AgingReport />} />
            <Route path="/facturacion" element={<Invoicing />} />
            <Route path="/impuestos" element={<Taxes />} />
            <Route path="/agenda" element={<TaxCalendar />} />
            <Route path="/aprendizaje" element={<LearningCenter />} />
            <Route path="/aprendizaje/:courseId" element={<CourseDetail />} />
            <Route path="/conciliacion-bancaria" element={<BankReconciliation />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
