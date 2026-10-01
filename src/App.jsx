import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/layout/AppShell';

// Pages
import LoginPage from './pages/LoginPage';
import NewSalePage from './pages/staff/NewSalePage';
import MySalesPage from './pages/staff/MySalesPage';
import StockListPage from './pages/staff/StockListPage';
import NewPurchasePage from './pages/staff/NewPurchasePage';
import MyPurchasesPage from './pages/staff/MyPurchasesPage';
import NewExpensePage from './pages/staff/NewExpensePage';
import DailyReportPage from './pages/staff/DailyReportPage';
import DashboardPage from './pages/admin/DashboardPage';
import AllSalesPage from './pages/admin/AllSalesPage';
import PurchaseReviewPage from './pages/admin/PurchaseReviewPage';
import ProductsPage from './pages/admin/ProductsPage';
import AdjustmentsPage from './pages/admin/AdjustmentsPage';
import FinancialReportPage from './pages/admin/FinancialReportPage';
import StaffManagementPage from './pages/admin/StaffManagementPage';
import BanksPage from './pages/admin/BanksPage';
import DailyReportsAdminPage from './pages/admin/DailyReportsAdminPage';
import UserManagementPage from './pages/super-admin/UserManagementPage';

import './styles/globals.css';
import './styles/components.css';
import './styles/utilities.css';

function RoleRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'STAFF') return <Navigate to="/sale/new" replace />;
  return <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Staff + Admin + Super Admin shared routes */}
      <Route element={<ProtectedRoute roles={['STAFF', 'ADMIN', 'SUPER_ADMIN']} />}>
        <Route element={<AppShell />}>
          <Route path="/sale/new" element={<NewSalePage />} />
          <Route path="/sales/mine" element={<MySalesPage />} />
          <Route path="/stock" element={<StockListPage />} />
          <Route path="/purchases/new" element={<NewPurchasePage />} />
          <Route path="/purchases/mine" element={<MyPurchasesPage />} />
          <Route path="/expenses/new" element={<NewExpensePage />} />
          <Route path="/daily-report" element={<DailyReportPage />} />
        </Route>
      </Route>

      {/* Admin + Super Admin routes */}
      <Route element={<ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']} />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sales/all" element={<AllSalesPage />} />
          <Route path="/purchases/review" element={<PurchaseReviewPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/adjustments" element={<AdjustmentsPage />} />
          <Route path="/reports/financial" element={<FinancialReportPage />} />
          <Route path="/staff" element={<StaffManagementPage />} />
          <Route path="/banks" element={<BanksPage />} />
          <Route path="/daily-reports/admin" element={<DailyReportsAdminPage />} />
        </Route>
      </Route>

      {/* Super Admin only */}
      <Route element={<ProtectedRoute roles={['SUPER_ADMIN']} />}>
        <Route element={<AppShell />}>
          <Route path="/users" element={<UserManagementPage />} />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
