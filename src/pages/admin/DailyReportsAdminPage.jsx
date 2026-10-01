import { useState, useEffect } from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { dailyReportsApi } from '../../api/dailyReports';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function DailyReportsAdminPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const toast = useToast();

  const load = async () => {
    try { 
      // The getToday endpoint currently fetches all daily reports based on the backend schema/query
      // (It queries `SELECT * FROM daily_reports ORDER BY report_date DESC`)
      setReports(await dailyReportsApi.getToday()); 
    } catch { 
      toast.error('Failed to load daily reports'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Daily Reports</h1>
        <p className="page-subtitle">Historical daily sales and bank deposit summaries</p>
      </div>

      {loading ? (
        <div className="spinner-page"><div className="spinner spinner-lg" /></div>
      ) : reports.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><FileText size={48} /></div>
          <p className="empty-state-title">No reports found</p>
          <p className="empty-state-text">Daily reports submitted by staff will appear here.</p>
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
                    <div className="text-sm text-muted">by {report.staff?.fullName} · {formatDateTime(report.createdAt)}</div>
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
                          <div key={dep.bankId} className="flex justify-between text-sm p-2 bg-[var(--color-surface-alt)] rounded-md">
                            <span>{dep.bankName}</span>
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
