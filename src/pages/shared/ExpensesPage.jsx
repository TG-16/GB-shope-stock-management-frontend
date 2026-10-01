import { useState, useEffect } from 'react';
import { Receipt } from 'lucide-react';
import { expensesApi } from '../../api/expenses';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency, formatDateTime, getToday, getDaysAgo } from '../../utils/formatters';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ from: getToday(), to: getToday() });
  const toast = useToast();

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.from && filter.to) {
        params.from = filter.from;
        params.to = filter.to;
      }
      setExpenses(await expensesApi.getAll(params));
    } catch (err) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadExpenses(); }, [filter]);

  const setDatePreset = (preset) => {
    const today = getToday();
    if (preset === 'today') setFilter({ from: today, to: today });
    else if (preset === 'week') setFilter({ from: getDaysAgo(7), to: today });
    else if (preset === 'month') setFilter({ from: getDaysAgo(30), to: today });
  };

  const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Expenses</h1>
        <p className="page-subtitle">View recorded shop expenses</p>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="flex gap-2">
          <button className="btn btn-sm btn-secondary" onClick={() => setDatePreset('today')}>Today</button>
          <button className="btn btn-sm btn-secondary" onClick={() => setDatePreset('week')}>Week</button>
          <button className="btn btn-sm btn-secondary" onClick={() => setDatePreset('month')}>Month</button>
        </div>
        <input type="date" className="form-input" value={filter.from} onChange={e => setFilter(f => ({ ...f, from: e.target.value }))} />
        <input type="date" className="form-input" value={filter.to} onChange={e => setFilter(f => ({ ...f, to: e.target.value }))} />
      </div>

      {/* Summary bar */}
      {!loading && expenses.length > 0 && (
        <div className="card mb-4" style={{ padding: 'var(--space-3) var(--space-5)' }}>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted">{expenses.length} expenses</span>
            <span className="font-semi text-danger">Total: {formatCurrency(totalAmount)}</span>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="spinner-page"><div className="spinner spinner-lg" /></div>
      ) : expenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Receipt size={48} /></div>
          <p className="empty-state-title">No expenses found</p>
          <p className="empty-state-text">Adjust your filters to see more.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {expenses.map(exp => (
            <div key={exp.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-semi mb-1">{exp.reason}</div>
                  <div className="text-sm text-muted">by {exp.staff_name} · {formatDateTime(exp.created_at)}</div>
                </div>
                <div className="font-semi text-danger ml-3">
                  {formatCurrency(exp.amount)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
