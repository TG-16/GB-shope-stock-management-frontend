import { useLocation } from 'react-router-dom';
import { Sun, Moon, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/sale/new': 'New Sale',
  '/sales/mine': 'My Sales',
  '/sales/all': 'All Sales',
  '/stock': 'Stock List',
  '/products': 'Products',
  '/purchases/new': 'New Purchase',
  '/purchases/mine': 'My Purchases',
  '/purchases/review': 'Purchase Requests',
  '/expenses/new': 'Record Expense',
  '/daily-report': 'Daily Report',
  '/daily-reports/admin': 'Daily Reports',
  '/adjustments': 'Stock Adjustments',
  '/reports/financial': 'Financial Reports',
  '/staff': 'Staff Management',
  '/banks': 'Banks',
  '/users': 'User Management',
};

export default function TopBar() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const title = pageTitles[location.pathname] || 'Gebeyaw Solar';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
      </div>
      <div className="topbar-right">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className="topbar-user">
          <User size={16} />
          <div>
            <div className="topbar-user-name">{user?.fullName}</div>
            <div className="topbar-user-role">{user?.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
