import { useState } from 'react';
import { Receipt, CheckCircle } from 'lucide-react';
import { expensesApi } from '../../api/expenses';
import { useToast } from '../../components/ui/Toast';

export default function NewExpensePage() {
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || !amount) {
      toast.error('Please fill in all fields');
      return;
    }
    if (Number(amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }
    setLoading(true);
    try {
      await expensesApi.create({ reason: reason.trim(), amount: Number(amount) });
      toast.success('Expense recorded successfully!');
      setReason('');
      setAmount('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Record Expense</h1>
        <p className="page-subtitle">Log a daily shop expense</p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div className="flex flex-col gap-5">
          <div className="form-group">
            <label className="form-label" htmlFor="expense-reason">Reason</label>
            <textarea
              id="expense-reason"
              className="form-input form-textarea"
              placeholder="What was the expense for?"
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="expense-amount">Amount (ETB)</label>
            <input
              id="expense-amount"
              className="form-input"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? <span className="spinner spinner-sm" /> : <><Receipt size={20} /> Record Expense</>}
          </button>
        </div>
      </form>
    </div>
  );
}
