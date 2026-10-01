import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, TrendingUp, ClipboardList, CreditCard, DollarSign } from 'lucide-react';
import { reportsApi } from '../../api/reports';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setStats(await reportsApi.getDashboardStats());
      } catch (err) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="page"><div className="spinner-page"><div className="spinner spinner-lg" /></div></div>;
  }

  const cards = [
    {
      label: "Today's Sales",
      value: formatCurrency(stats?.todaySales || 0),
      icon: ShoppingCart,
      color: 'var(--color-accent)',
      bg: 'var(--color-accent-light)',
    },
    {
      label: "Today's Profit",
      value: formatCurrency(stats?.todayProfit || 0),
      icon: TrendingUp,
      color: 'var(--color-success)',
      bg: 'var(--color-success-light)',
    },
    {
      label: 'Total Products',
      value: formatNumber(stats?.totalProducts || 0),
      icon: Package,
      color: 'var(--color-info)',
      bg: 'var(--color-info-light)',
    },
  ];

  const alerts = [];
  if (stats?.pendingPurchases > 0) {
    alerts.push({
      label: `${stats.pendingPurchases} pending purchase request${stats.pendingPurchases > 1 ? 's' : ''}`,
      action: () => navigate('/purchases/review'),
      icon: ClipboardList,
      color: 'var(--color-warning)',
      count: stats.pendingPurchases
    });
  }
  if (stats?.pendingCreditPayments > 0) {
    alerts.push({
      label: `${stats.pendingCreditPayments} pending credit payment${stats.pendingCreditPayments > 1 ? 's' : ''}`,
      action: () => navigate('/sales/all'),
      icon: CreditCard,
      color: 'var(--color-info)',
      count: stats.pendingCreditPayments
    });
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Welcome, {user?.fullName}</h1>
        <p className="page-subtitle">Here's your shop overview for today</p>
      </div>

      {/* KPI Cards */}
      <div className="scroll-x gap-4 mb-6">
        {cards.map((card, i) => (
          <div key={i} className="stat-card" style={{ minWidth: '160px', flex: '0 0 auto' }}>
            <div className="stat-card-icon" style={{ background: card.bg, color: card.color }}>
              <card.icon size={22} />
            </div>
            <div className="stat-card-content">
              <div className="stat-card-label">{card.label}</div>
              <div className="stat-card-value">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Banners */}
      {alerts.length > 0 && (
        <div className="section">
          <h3 className="section-title">Needs Attention</h3>
          <div className="flex flex-col gap-3">
            {alerts.map((alert, i) => (
              <button
                key={i}
                className="card card-interactive flex items-center gap-4"
                onClick={alert.action}
                style={{ cursor: 'pointer', width: '100%', textAlign: 'left', border: `1px solid ${alert.color}20` }}
              >
                <div style={{ color: alert.color }}>
                  <alert.icon size={24} />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{alert.label}</div>
                  <div className="text-xs text-muted">Tap to review</div>
                </div>
                <span className="badge-count">{alert.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="btn btn-secondary" onClick={() => navigate('/sale/new')}>
            <ShoppingCart size={18} /> New Sale
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/products')}>
            <Package size={18} /> Products
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/reports/financial')}>
            <DollarSign size={18} /> Reports
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/daily-report')}>
            <ClipboardList size={18} /> Daily Report
          </button>
        </div>
      </div>
    </div>
  );
}
