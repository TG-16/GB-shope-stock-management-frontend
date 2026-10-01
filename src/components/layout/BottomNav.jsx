import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  PlusCircle, ShoppingCart, Package, LayoutDashboard, MoreHorizontal,
  ClipboardList, FileText, Receipt, Users, Landmark, BarChart3,
  SlidersHorizontal, LogOut, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function BottomNav() {
  const { user, isAdmin, isSuperAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  const handleLogout = () => {
    setShowMore(false);
    logout();
    navigate('/login');
  };

  // Define tabs based on role
  const staffTabs = [
    { to: '/sale/new', icon: PlusCircle, label: 'New Sale' },
    { to: '/sales/mine', icon: ShoppingCart, label: 'Sales' },
    { to: '/stock', icon: Package, label: 'Stock' },
    { to: '/daily-report', icon: FileText, label: 'Report' },
  ];

  const adminTabs = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { to: '/sale/new', icon: PlusCircle, label: 'New Sale' },
    { to: '/sales/all', icon: ShoppingCart, label: 'Sales' },
    { to: '/products', icon: Package, label: 'Stock' },
  ];

  const tabs = isAdmin ? adminTabs : staffTabs;

  // More menu items (overflow items not in bottom tabs)
  const staffMoreItems = [
    { to: '/purchases/new', icon: ClipboardList, label: 'New Purchase Request' },
    { to: '/purchases/mine', icon: ClipboardList, label: 'My Purchases' },
    { to: '/expenses/new', icon: Receipt, label: 'Record Expense' },
  ];

  const adminMoreItems = [
    { to: '/purchases/review', icon: ClipboardList, label: 'Purchase Requests' },
    { to: '/purchases/new', icon: ClipboardList, label: 'New Purchase' },
    { to: '/expenses/new', icon: Receipt, label: 'Record Expense' },
    { to: '/daily-report', icon: FileText, label: 'Daily Report' },
    { to: '/daily-reports/admin', icon: FileText, label: 'All Daily Reports' },
    { to: '/reports/financial', icon: BarChart3, label: 'Financial Reports' },
    { to: '/adjustments', icon: SlidersHorizontal, label: 'Stock Adjustments' },
    { to: '/staff', icon: Users, label: 'Staff Management' },
    { to: '/banks', icon: Landmark, label: 'Banks' },
  ];

  if (isSuperAdmin) {
    adminMoreItems.push({ to: '/users', icon: Users, label: 'User Management' });
  }

  const moreItems = isAdmin ? adminMoreItems : staffMoreItems;

  return (
    <>
      <nav className="bottomnav">
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) => `bottomnav-item ${isActive ? 'active' : ''}`}
            onClick={() => setShowMore(false)}
          >
            <span className="bottomnav-icon">
              <tab.icon size={22} />
            </span>
            {tab.label}
          </NavLink>
        ))}
        <button
          className={`bottomnav-item ${showMore ? 'active' : ''}`}
          onClick={() => setShowMore(!showMore)}
        >
          <span className="bottomnav-icon">
            <MoreHorizontal size={22} />
          </span>
          More
        </button>
      </nav>

      {/* More Menu Overlay */}
      {showMore && (
        <>
          <div className="more-menu-overlay" onClick={() => setShowMore(false)} />
          <div className="more-menu">
            <div className="more-menu-handle" />
            {moreItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `more-menu-item ${isActive ? 'active' : ''}`}
                onClick={() => setShowMore(false)}
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
            <hr className="more-menu-divider" />
            <button className="more-menu-item" onClick={toggleTheme}>
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button className="more-menu-item danger" onClick={handleLogout}>
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </>
      )}
    </>
  );
}
