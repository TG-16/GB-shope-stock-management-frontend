import { useState, useEffect } from 'react';
import { FileText, CheckCircle, ChevronRight } from 'lucide-react';
import { dailyReportsApi } from '../../api/dailyReports';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency } from '../../utils/formatters';

export default function DailyReportPage() {
  const [step, setStep] = useState(1); // 1=preview, 2=bank split, 3=done
  const [preview, setPreview] = useState(null);
  const [bankEntries, setBankEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();

  useEffect(() => {
    loadPreview();
  }, []);

  const loadPreview = async () => {
    setLoading(true);
    try {
      const data = await dailyReportsApi.getPreview();
      setPreview(data);
      // Initialize bank entries
      if (data.availableBanks) {
        setBankEntries(data.availableBanks.map(b => ({ bankId: b.id, bankName: b.name, amount: '' })));
      }
    } catch (err) {
      toast.error('Failed to load daily report preview');
    } finally {
      setLoading(false);
    }
  };

  const updateBankAmount = (index, amount) => {
    setBankEntries(prev => prev.map((e, i) => i === index ? { ...e, amount } : e));
  };

  const bankTotal = bankEntries.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const handleSubmit = async () => {
    const entries = bankEntries
      .filter(e => Number(e.amount) > 0)
      .map(e => ({ bankId: e.bankId, amount: Number(e.amount) }));

    if (entries.length === 0) {
      toast.error('Please enter at least one bank deposit amount');
      return;
    }

    setSubmitting(true);
    try {
      const data = await dailyReportsApi.submit(entries);
      setResult(data);
      setStep(3);
      toast.success('Daily report submitted!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page"><div className="spinner-page"><div className="spinner spinner-lg" /></div></div>;
  }

  // Step 3: Success
  if (step === 3) {
    return (
      <div className="page">
        <div className="sale-success">
          <div className="sale-success-icon"><CheckCircle size={64} /></div>
          <h2>Report Submitted!</h2>
          <p className="text-muted mb-4">Daily report has been recorded successfully.</p>
          {result && (
            <div className="card" style={{ width: '100%', maxWidth: 360 }}>
              <div className="flex justify-between mb-2">
                <span className="text-muted">Total Sales</span>
                <strong>{formatCurrency(result.recordedSales)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Total Profit</span>
                <strong className="text-success">{formatCurrency(result.recordedProfit)}</strong>
              </div>
            </div>
          )}
          <button className="btn btn-primary mt-6" onClick={() => { setStep(1); loadPreview(); }}>
            View New Preview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Daily Report</h1>
        <p className="page-subtitle">
          {step === 1 ? "Review today's sales summary" : "Enter bank deposit amounts"}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        <span className={`badge ${step >= 1 ? 'badge-active' : ''}`}>1. Preview</span>
        <ChevronRight size={16} className="text-muted" />
        <span className={`badge ${step >= 2 ? 'badge-active' : ''}`}>2. Bank Split</span>
      </div>

      {/* Step 1: Preview */}
      {step === 1 && preview && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="card">
              <div className="text-xs text-muted mb-1">Total Sales</div>
              <div className="font-bold text-xl">{formatCurrency(preview.totalSalesAmount)}</div>
            </div>
            <div className="card">
              <div className="text-xs text-muted mb-1">Total Profit</div>
              <div className="font-bold text-xl text-success">{formatCurrency(preview.totalProfit)}</div>
            </div>
          </div>

          <div className="section">
            <h3 className="section-title">Today's Sales ({preview.salesList.length})</h3>
            {preview.salesList.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-6) 0' }}>
                <p className="text-muted">No sales recorded today</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {preview.salesList.map(sale => (
                  <div key={sale.saleId} className="card" style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium text-sm">Sale #{sale.saleId}</span>
                        <div className="text-xs text-muted">
                          {sale.items.map(i => i.productName).join(', ')}
                        </div>
                      </div>
                      <span className="font-semi">{formatCurrency(sale.saleTotal)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="btn btn-primary btn-block btn-lg mt-4" onClick={() => setStep(2)}>
            Continue to Bank Split <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Step 2: Bank Split */}
      {step === 2 && (
        <>
          <div className="card mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-muted">Today's Total Sales</span>
              <strong>{formatCurrency(preview?.totalSalesAmount)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Bank Deposits Total</span>
              <strong style={{ color: bankTotal > 0 ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                {formatCurrency(bankTotal)}
              </strong>
            </div>
          </div>

          <div className="section">
            <h3 className="section-title">Deposit Amounts per Bank</h3>
            <div className="flex flex-col gap-3">
              {bankEntries.map((entry, index) => (
                <div key={entry.bankId} className="form-group">
                  <label className="form-label">{entry.bankName}</label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={entry.amount}
                    onChange={e => updateBankAmount(index, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button className="btn btn-secondary flex-1" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              className="btn btn-primary flex-1 btn-lg"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <span className="spinner spinner-sm" /> : 'Submit Report'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
