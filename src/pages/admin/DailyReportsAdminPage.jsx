import { useState, useEffect } from 'react';
import { FileText, ChevronDown, ChevronUp, Calendar, DollarSign, TrendingUp, Layers, RotateCcw } from 'lucide-react';
import { dailyReportsApi } from '../../api/dailyReports';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function DailyReportsAdminPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('TODAY'); // Default: 'TODAY'
  const [customDate, setCustomDate] = useState('');
  const toast = useToast();

  const load = async (filterType = activeFilter, dateVal = customDate) => {
    setLoading(true);
    try {
      const params = {};
      if (filterType === 'TODAY') {
        params.today = true;
      } else if (filterType === 'CUSTOM' && dateVal) {
        params.date = dateVal;
      }
      const data = await dailyReportsApi.getAll(params);
      setReports(data || []);
    } catch {
      toast.error('Failed to load daily reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Default: load today's daily report on mount
    load('TODAY', '');
  }, []);

  const handleFilterChange = (filterType) => {
    setActiveFilter(filterType);
    if (filterType === 'TODAY') {
      setCustomDate('');
      load('TODAY', '');
    } else if (filterType === 'ALL') {
      setCustomDate('');
      load('ALL', '');
    } else if (filterType === 'CUSTOM') {
      if (customDate) {
        load('CUSTOM', customDate);
      }
    }
  };

  const handleCustomDateChange = (e) => {
    const val = e.target.value;
    setCustomDate(val);
    setActiveFilter('CUSTOM');
    if (val) {
      load('CUSTOM', val);
    } else {
      load('TODAY', '');
    }
  };

  // Calculations for summary stats
  const totalSales = reports.reduce((acc, r) => acc + (Number(r.dailySellsAmount) || 0), 0);
  const totalProfit = reports.reduce((acc, r) => acc + (Number(r.dailyTotalProfit) || 0), 0);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Daily Reports</h1>
        <p className="page-subtitle">Daily sales and split bank deposit summaries</p>
      </div>

      {/* Quick Filter Pills */}
      <div className="filter-pills mb-3">
        <button
          type="button"
          className={`filter-pill ${activeFilter === 'TODAY' ? 'active' : ''}`}
          onClick={() => handleFilterChange('TODAY')}
        >
          Today
        </button>
        <button
          type="button"
          className={`filter-pill ${activeFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => handleFilterChange('ALL')}
        >
          All Reports
        </button>
        <button
          type="button"
          className={`filter-pill ${activeFilter === 'CUSTOM' ? 'active' : ''}`}
          onClick={() => handleFilterChange('CUSTOM')}
        >
          <Calendar size={13} />
          {activeFilter === 'CUSTOM' && customDate ? `Date: ${customDate}` : 'Custom Date'}
        </button>
      </div>

      {/* Custom Date Selection Panel (Appears when Custom Date is selected) */}
      {activeFilter === 'CUSTOM' && (
        <div className="card mb-4" style={{ padding: 'var(--space-3) var(--space-4)' }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-muted" />
              <label className="text-sm font-medium text-muted">Select Date:</label>
              <input
                type="date"
                className="form-input"
                style={{ width: 'auto', minHeight: '38px', padding: '6px 12px' }}
                value={customDate}
                onChange={handleCustomDateChange}
                autoFocus
              />
            </div>
            {customDate && (
              <span className="text-xs text-muted">
                Showing daily reports submitted on <strong style={{ color: 'var(--color-text-primary)' }}>{customDate}</strong>
              </span>
            )}
            <button
              type="button"
              className="btn btn-sm btn-ghost ml-auto"
              onClick={() => handleFilterChange('TODAY')}
            >
              <RotateCcw size={13} />
              Reset to Today
            </button>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      {!loading && reports.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'var(--color-info-light)', color: 'var(--color-info)' }}>
              <Layers size={22} />
            </div>
            <div className="stat-card-content">
              <div className="stat-card-label">Submitted Reports</div>
              <div className="stat-card-value">{reports.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
              <DollarSign size={22} />
            </div>
            <div className="stat-card-content">
              <div className="stat-card-label">Total Sales Logged</div>
              <div className="stat-card-value text-base sm:text-xl truncate">{formatCurrency(totalSales)}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
              <TrendingUp size={22} />
            </div>
            <div className="stat-card-content">
              <div className="stat-card-label">Total Profit Logged</div>
              <div className="stat-card-value text-base sm:text-xl truncate text-success">{formatCurrency(totalProfit)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Reports List / Empty State */}
      {loading ? (
        <div className="spinner-page"><div className="spinner spinner-lg" /></div>
      ) : reports.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><FileText size={48} /></div>
          <p className="empty-state-title">No reports found</p>
          <p className="empty-state-text">
            {activeFilter === 'TODAY'
              ? 'No daily reports submitted for today yet.'
              : customDate
              ? `No daily reports submitted for ${customDate}.`
              : 'Daily reports submitted by staff will appear here.'}
          </p>
          {activeFilter === 'TODAY' && (
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => handleFilterChange('ALL')}
              >
                View All Historical Reports
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map(report => {
            const isExpanded = expandedId === report.reportId;
            return (
              <div key={report.reportId} className="card">
                <div 
                  className="flex justify-between items-center" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setExpandedId(isExpanded ? null : report.reportId)}
                >
                  <div>
                    <div className="font-semi mb-1">Report #{report.reportId}</div>
                    <div className="text-sm text-muted">by {report.staff?.fullName || 'Staff'} · {formatDateTime(report.createdAt)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semi">{formatCurrency(report.dailySellsAmount)}</div>
                      <div className="text-xs text-success">{formatCurrency(report.dailyTotalProfit)} profit</div>
                    </div>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {isExpanded && report.bankEntries && (
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border-light)' }}>
                    <h4 className="text-sm font-medium mb-2 text-muted">Bank Deposits</h4>
                    <div className="flex flex-col gap-2">
                      {report.bankEntries.length === 0 ? (
                        <div className="text-sm text-muted">No deposits recorded</div>
                      ) : (
                        report.bankEntries.map(dep => (
                          <div key={dep.bankId || dep.entryId} className="flex justify-between text-sm p-2 bg-[var(--color-surface-alt)] rounded-md">
                            <span>{dep.bankName || 'Bank'}</span>
                            <span className="font-medium">{formatCurrency(dep.amount)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
