import { NavLink, useNavigate } from 'react-router-dom';
import {
  Sun, LayoutDashboard, ShoppingCart, Package, ClipboardList,
  FileText, Users, DollarSign, Landmark, BarChart3, SlidersHorizontal,
  LogOut, PlusCircle, Receipt
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user, isAdmin, isSuperAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Sun size={20} />
        </div>
        <div>
          <div className="sidebar-brand">Gebeyaw Solar</div>
          <div className="sidebar-brand-sub">Stock Management</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* Admin Dashboard */}
        {isAdmin && (
          <div className="sidebar-section">
            <div className="sidebar-section-title">Overview</div>
            <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
          </div>
        )}

        {/* Sales & Operations */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">Sales</div>
          <NavLink to="/sale/new" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <PlusCircle size={18} /> New Sale
          </NavLink>
          {isAdmin ? (
            <NavLink to="/sales/all" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <ShoppingCart size={18} /> All Sales
            </NavLink>
          ) : (
            <NavLink to="/sales/mine" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <ShoppingCart size={18} /> My Sales
            </NavLink>
          )}
        </div>

        {/* Stock */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">Inventory</div>
          {isAdmin ? (
            <NavLink to="/products" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Package size={18} /> Products
            </NavLink>
          ) : (
            <NavLink to="/stock" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Package size={18} /> Stock List
            </NavLink>
          )}
          <NavLink to="/purchases/new" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <ClipboardList size={18} /> New Purchase
          </NavLink>
          {isAdmin ? (
            <NavLink to="/purchases/review" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <ClipboardList size={18} /> Purchase Requests
            </NavLink>
          ) : (
            <NavLink to="/purchases/mine" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <ClipboardList size={18} /> My Purchases
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/adjustments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <SlidersHorizontal size={18} /> Adjustments
            </NavLink>
          )}
        </div>

        {/* Finance */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">Finance</div>
          <NavLink to="/expenses/new" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Receipt size={18} /> Record Expense
          </NavLink>
          <NavLink to="/expenses" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Receipt size={18} /> View Expenses
          </NavLink>
          <NavLink to="/daily-report" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FileText size={18} /> Daily Report
          </NavLink>
          {isAdmin && (
            <>
              <NavLink to="/daily-reports/admin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <FileText size={18} /> All Daily Reports
              </NavLink>
              <NavLink to="/reports/financial" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <BarChart3 size={18} /> Financial Reports
              </NavLink>
            </>
          )}
        </div>

        {/* Management */}
        {isAdmin && (
          <div className="sidebar-section">
            <div className="sidebar-section-title">Management</div>
            <NavLink to="/staff" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Users size={18} /> Staff
            </NavLink>
            <NavLink to="/banks" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Landmark size={18} /> Banks
            </NavLink>
            {isSuperAdmin && (
              <NavLink to="/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Users size={18} /> User Management
              </NavLink>
            )}
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
