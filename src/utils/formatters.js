/**
 * Format a number as currency (ETB)
 */
export function formatCurrency(value) {
  const num = Number(value);
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('en-ET', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num) + ' ETB';
}

/**
 * Format a number with commas
 */
export function formatNumber(value) {
  const num = Number(value);
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format a date string to a friendly display
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date string with time
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function getToday() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get a date N days ago as YYYY-MM-DD
 */
export function getDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Get badge class name from a status string
 */
export function getStatusBadgeClass(status) {
  const map = {
    'ACTIVE': 'badge-active',
    'CREDIT': 'badge-credit',
    'CREDIT_PAID': 'badge-credit-paid',
    'CORRECTED': 'badge-corrected',
    'PENDING': 'badge-pending',
    'APPROVED': 'badge-approved',
    'REJECTED': 'badge-rejected',
    'REVOKED': 'badge-revoked',
  };
  return map[status] || '';
}

/**
 * Format status for display
 */
export function formatStatus(status) {
  if (!status) return '';
  return status.replace(/_/g, ' ');
}
