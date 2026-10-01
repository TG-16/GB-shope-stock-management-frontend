import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { reportsApi } from '../../api/reports';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency, getToday, getDaysAgo } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FinancialReportPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month'); // today, week, month, custom
  const [customRange, setCustomRange] = useState({ from: getToday(), to: getToday() });
  const toast = useToast();

  const loadReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (period === 'custom') {
        params.from = customRange.from;
        params.to = customRange.to;
      } else {
        params.period = period;
      }
      setReport(await reportsApi.getSummary(params));
    } catch (err) {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReport(); }, [period]);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    loadReport();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Financial Report</h1>
        <p className="page-subtitle">Revenue, expenses, and profit analysis</p>
      </div>

      {/* Controls */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {['today', 'week', 'month', 'custom'].map(p => (
            <button
              key={p}
              className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPeriod(p)}
              style={{ textTransform: 'capitalize' }}
            >
              {p}
            </button>
          ))}
        </div>
        
        {period === 'custom' && (
          <form className="flex items-end gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border-light)' }} onSubmit={handleCustomSubmit}>
            <div className="flex-1">
              <label className="form-label text-xs">From</label>
              <input type="date" className="form-input" value={customRange.from} onChange={e => setCustomRange(f => ({...f, from: e.target.value}))} />
            </div>
            <div className="flex-1">
              <label className="form-label text-xs">To</label>
              <input type="date" className="form-input" value={customRange.to} onChange={e => setCustomRange(f => ({...f, to: e.target.value}))} />
            </div>
            <button type="submit" className="btn btn-primary">Apply</button>
          </form>
        )}
      </div>

      {loading ? (
        <div className="spinner-page"><div className="spinner spinner-lg" /></div>
      ) : !report ? (
        <div className="empty-state">
          <div className="empty-state-icon"><BarChart3 size={48} /></div>
          <p className="empty-state-title">No data available</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
                <DollarSign size={22} />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Revenue</div>
                <div className="stat-card-value text-base sm:text-xl truncate">{formatCurrency(report.totalRevenue)}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
                <TrendingUp size={22} />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Gross Profit</div>
                <div className="stat-card-value text-base sm:text-xl truncate text-success">{formatCurrency(report.totalProfit)}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)' }}>
                <TrendingDown size={22} />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Expenses</div>
                <div className="stat-card-value text-base sm:text-xl truncate text-danger">{formatCurrency(report.totalExpenses)}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-info-light)', color: 'var(--color-info)' }}>
                <DollarSign size={22} />
              </div>
              <div className="stat-card-content">
                <div className="stat-card-label">Net Profit</div>
                <div className="stat-card-value text-base sm:text-xl truncate" style={{ color: report.netProfit >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {formatCurrency(report.netProfit)}
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="card mb-6">
            <h3 className="section-title mb-4">Trend</h3>
            <div style={{ width: '100%', height: 300 }}>
              {report.chartData && report.chartData.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={report.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-light)" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000}k`} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                    />
                    <Bar dataKey="revenue" name="Revenue" fill="var(--color-accent)" radius={[4,4,0,0]} />
                    <Bar dataKey="profit" name="Profit" fill="var(--color-success)" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted">No trend data for this period</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
