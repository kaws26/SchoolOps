import { useMemo, useState, useEffect } from 'react';
import auth from '../../utils/auth';
import API_BASE_URL from '../../config';

const loadExternalScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve(true);
        return;
      }
      existing.addEventListener('load', () => resolve(true), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve(true);
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });

const ensurePdfLibraries = async () => {
  await loadExternalScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  if (!window.jspdf?.jsPDF) {
    throw new Error('PDF library unavailable.');
  }
  return window.jspdf.jsPDF;
};

const asNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const formatCurrency = (value) => `Rs ${asNumber(value).toFixed(2)}`;
const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '-'
    : date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
};
const formatDateShort = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '-'
    : date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      });
};

const getTransactions = (account) =>
  Array.isArray(account?.transactions)
    ? account.transactions
    : Array.isArray(account?.transactionList)
      ? account.transactionList
      : [];

const getOwnerName = (account) =>
  account?.studentName ||
  account?.userName ||
  account?.name ||
  account?.user?.name ||
  account?.student?.name ||
  'Unknown';

const getTxnDateValue = (txn) => txn?.date || txn?.createdAt || txn?.transactionDate || null;

const toSafeFilename = (value) => String(value || 'file').replace(/[^a-z0-9_-]+/gi, '_').toLowerCase();
const formatCurrencyPdf = (value) => {
  const amount = asNumber(value);
  const abs = Math.abs(amount).toFixed(2);
  return amount < 0 ? `-Rs ${abs}` : `Rs ${abs}`;
};

const getBalance = (account, metrics) => {
  if (account?.accountBalance != null) return asNumber(account.accountBalance);
  if (account?.balance != null) return asNumber(account.balance);
  if (account?.currentBalance != null) return asNumber(account.currentBalance);
  return metrics.credits - metrics.debits;
};

const getDue = (account, balance) => {
  if (account?.dues != null) return asNumber(account.dues);
  if (account?.pendingAmount != null) return asNumber(account.pendingAmount);
  return balance < 0 ? Math.abs(balance) : 0;
};

const getMetrics = (account) => {
  const transactions = getTransactions(account);
  const credits = transactions
    .filter((txn) => String(txn?.type || '').toUpperCase() === 'CREDIT')
    .reduce((sum, txn) => sum + asNumber(txn?.amount), 0);
  const debits = transactions
    .filter((txn) => String(txn?.type || '').toUpperCase() === 'DEBIT')
    .reduce((sum, txn) => sum + asNumber(txn?.amount), 0);

  const balance = getBalance(account, { credits, debits });
  const due = getDue(account, balance);

  return {
    credits,
    debits,
    balance,
    due,
    transactions,
  };
};

const ManageAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [txForm, setTxForm] = useState({
    amount: '',
    type: 'CREDIT',
    mode: 'CASH',
    remarks: '',
  });
  const [submittingTx, setSubmittingTx] = useState(false);
  const [payrollTeacherId, setPayrollTeacherId] = useState('');
  const [payrollData, setPayrollData] = useState(null);
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [payrollError, setPayrollError] = useState('');
  const [downloadingReceiptKey, setDownloadingReceiptKey] = useState('');
  const [downloadingAudit, setDownloadingAudit] = useState(false);

  const fetchAccounts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts`, {
        headers: auth.getAuthHeaders(),
      });

      if (!response.ok) {
        setError('Failed to load accounts.');
        return;
      }

      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      setAccounts(list);
      if (list.length > 0 && selectedAccountId == null) {
        setSelectedAccountId(list[0].id);
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Unable to load accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return accounts;
    const q = searchQuery.toLowerCase();
    return accounts.filter((account) => {
      const idText = String(account?.id || '');
      const owner = getOwnerName(account).toLowerCase();
      const username = String(account?.userName || '').toLowerCase();
      return idText.includes(q) || owner.includes(q) || username.includes(q);
    });
  }, [accounts, searchQuery]);

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === selectedAccountId) || null,
    [accounts, selectedAccountId]
  );

  const selectedMetrics = useMemo(
    () => (selectedAccount ? getMetrics(selectedAccount) : null),
    [selectedAccount]
  );

  const report = useMemo(() => {
    const base = {
      totalAccounts: 0,
      totalBalance: 0,
      totalDue: 0,
      totalCredits: 0,
      totalDebits: 0,
      totalTransactions: 0,
      creditCount: 0,
      debitCount: 0,
      monthlyVolumes: {},
      monthlyCredits: {},
      monthlyDebits: {},
      topDueAccounts: [],
    };

    const enriched = accounts.map((account) => {
      const metrics = getMetrics(account);
      return {
        account,
        ...metrics,
      };
    });

    enriched.forEach((item) => {
      base.totalAccounts += 1;
      base.totalBalance += item.balance;
      base.totalDue += item.due;
      base.totalCredits += item.credits;
      base.totalDebits += item.debits;
      base.totalTransactions += item.transactions.length;

      item.transactions.forEach((txn) => {
        const type = String(txn?.type || '').toUpperCase();
        if (type === 'CREDIT') base.creditCount += 1;
        if (type === 'DEBIT') base.debitCount += 1;

        const rawDate = txn?.date || txn?.createdAt || txn?.transactionDate;
        const date = rawDate ? new Date(rawDate) : null;
        if (date && !Number.isNaN(date.getTime())) {
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          base.monthlyVolumes[key] = (base.monthlyVolumes[key] || 0) + asNumber(txn?.amount);
          if (type === 'CREDIT') {
            base.monthlyCredits[key] = (base.monthlyCredits[key] || 0) + asNumber(txn?.amount);
          }
          if (type === 'DEBIT') {
            base.monthlyDebits[key] = (base.monthlyDebits[key] || 0) + asNumber(txn?.amount);
          }
        }
      });
    });

    base.topDueAccounts = enriched
      .filter((item) => item.due > 0)
      .sort((a, b) => b.due - a.due)
      .slice(0, 5);

    return base;
  }, [accounts]);

  const monthlySeries = useMemo(() => {
    const entries = Object.entries(report.monthlyVolumes)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);

    const maxValue = entries.reduce((m, [, value]) => Math.max(m, value), 0);

    return entries.map(([key, value]) => ({
      key,
      label: key,
      value,
      width: maxValue > 0 ? (value / maxValue) * 100 : 0,
    }));
  }, [report.monthlyVolumes]);

  const txnTypeChart = useMemo(() => {
    const total = report.creditCount + report.debitCount;
    const creditPercent = total > 0 ? (report.creditCount / total) * 100 : 0;
    const debitPercent = total > 0 ? (report.debitCount / total) * 100 : 0;
    return { total, creditPercent, debitPercent };
  }, [report.creditCount, report.debitCount]);

  const monthlyFlowSeries = useMemo(() => {
    const monthKeys = Array.from(
      new Set([...Object.keys(report.monthlyCredits), ...Object.keys(report.monthlyDebits)])
    )
      .sort((a, b) => a.localeCompare(b))
      .slice(-6);
    const maxValue = monthKeys.reduce(
      (max, key) => Math.max(max, asNumber(report.monthlyCredits[key]), asNumber(report.monthlyDebits[key])),
      0
    );

    return monthKeys.map((key) => ({
      key,
      credit: asNumber(report.monthlyCredits[key]),
      debit: asNumber(report.monthlyDebits[key]),
      creditWidth: maxValue > 0 ? (asNumber(report.monthlyCredits[key]) / maxValue) * 100 : 0,
      debitWidth: maxValue > 0 ? (asNumber(report.monthlyDebits[key]) / maxValue) * 100 : 0,
    }));
  }, [report.monthlyCredits, report.monthlyDebits]);

  const trendPath = useMemo(() => {
    if (monthlySeries.length === 0) return '';
    const maxValue = Math.max(...monthlySeries.map((item) => item.value), 1);
    return monthlySeries
      .map((item, idx) => {
        const x = (idx / Math.max(monthlySeries.length - 1, 1)) * 100;
        const y = 100 - (item.value / maxValue) * 100;
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [monthlySeries]);

  const allTransactions = useMemo(() => {
    const merged = [];
    accounts.forEach((account) => {
      getTransactions(account).forEach((txn, idx) => {
        const dateValue = getTxnDateValue(txn);
        merged.push({
          accountId: account?.id ?? '-',
          owner: getOwnerName(account),
          txn,
          txnDate: dateValue,
          txnKey: `${account?.id || 'na'}-${txn?.id || idx}`,
        });
      });
    });
    return merged.sort((a, b) => {
      const aTime = a.txnDate ? new Date(a.txnDate).getTime() : 0;
      const bTime = b.txnDate ? new Date(b.txnDate).getTime() : 0;
      return bTime - aTime;
    });
  }, [accounts]);

  const handleServerSearch = async () => {
    if (!searchQuery.trim()) {
      fetchAccounts();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/accounts/search?query=${encodeURIComponent(searchQuery.trim())}`,
        {
          method: 'POST',
          headers: auth.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        setError('Search failed.');
        return;
      }

      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      setAccounts(list);
      setSelectedAccountId(list.length > 0 ? list[0].id : null);
    } catch (err) {
      console.error('Error searching accounts:', err);
      setError('Unable to search accounts.');
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAccount?.id) return;

    const amount = asNumber(txForm.amount, NaN);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter a valid transaction amount.');
      return;
    }

    setSubmittingTx(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/${selectedAccount.id}/transactions`, {
        method: 'POST',
        headers: auth.getAuthHeaders(),
        body: JSON.stringify({
          amount,
          type: txForm.type,
          mode: txForm.mode,
          remarks: txForm.remarks,
        }),
      });

      if (!response.ok) {
        setError('Failed to create transaction.');
        return;
      }

      setTxForm({ amount: '', type: 'CREDIT', mode: 'CASH', remarks: '' });
      await fetchAccounts();
      setSelectedAccountId(selectedAccount.id);
    } catch (err) {
      console.error('Error creating transaction:', err);
      setError('Unable to create transaction.');
    } finally {
      setSubmittingTx(false);
    }
  };

  const handlePayrollFetch = async (e) => {
    e.preventDefault();
    setPayrollError('');
    setPayrollData(null);

    if (!payrollTeacherId.trim()) {
      setPayrollError('Teacher ID is required.');
      return;
    }

    setPayrollLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/payroll/${payrollTeacherId.trim()}`, {
        headers: auth.getAuthHeaders(),
      });

      if (!response.ok) {
        setPayrollError('Unable to fetch teacher payroll data.');
        return;
      }

      const data = await response.json();
      setPayrollData(data || null);
    } catch (err) {
      console.error('Error fetching payroll data:', err);
      setPayrollError('Failed to load payroll data.');
    } finally {
      setPayrollLoading(false);
    }
  };

  const handleDownloadTransactionReceipt = async (txn, idx) => {
    if (!selectedAccount) return;

    const receiptKey = `${selectedAccount.id}-${txn?.id || idx}`;
    setDownloadingReceiptKey(receiptKey);
    setError('');

    try {
      const jsPDF = await ensurePdfLibraries();
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      const txnDate = getTxnDateValue(txn);
      const receiptNo = `RCP-${selectedAccount.id}-${txn?.id || idx + 1}`;

      pdf.setFillColor(13, 110, 253);
      pdf.rect(0, 0, 210, 28, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.text('SchoolOps Transaction Receipt', 14, 14);
      pdf.setFontSize(10);
      pdf.text(`Generated: ${formatDateTime(new Date())}`, 14, 22);

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.text(`Receipt No: ${receiptNo}`, 14, 42);
      pdf.text(`Account ID: ${selectedAccount.id}`, 14, 50);
      pdf.text(`Account Holder: ${getOwnerName(selectedAccount)}`, 14, 58);
      pdf.text(`Transaction ID: ${txn?.id || idx + 1}`, 14, 66);
      pdf.text(`Transaction Date: ${formatDateTime(txnDate)}`, 14, 74);
      pdf.text(`Type: ${String(txn?.type || 'N/A').toUpperCase()}`, 14, 82);
      pdf.text(`Amount: ${formatCurrency(txn?.amount)}`, 14, 90);
      pdf.text(`Mode: ${txn?.mode || 'N/A'}`, 14, 98);
      pdf.text(`Remarks: ${txn?.remarks || '-'}`, 14, 106, { maxWidth: 182 });

      pdf.setDrawColor(220, 220, 220);
      pdf.line(14, 116, 196, 116);
      pdf.setTextColor(90, 90, 90);
      pdf.setFontSize(9);
      pdf.text('This receipt is system-generated and valid for audit and record purposes.', 14, 124);

      pdf.save(`${toSafeFilename(getOwnerName(selectedAccount))}_${toSafeFilename(receiptNo)}.pdf`);
    } catch (err) {
      console.error('Error generating transaction receipt PDF:', err);
      setError('Unable to download transaction receipt PDF.');
    } finally {
      setDownloadingReceiptKey('');
    }
  };

  const handleDownloadAuditReport = async () => {
    if (allTransactions.length === 0) {
      setError('No transactions available for audit export.');
      return;
    }

    setDownloadingAudit(true);
    setError('');
    try {
      const jsPDF = await ensurePdfLibraries();
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      const generatedOn = new Date();
      const left = 12;
      const tableTopStart = 56;
      const minRowHeight = 7;
      const lineHeight = 3.7;
      const cellPaddingX = 1.2;
      const cellPaddingY = 1.4;
      const pageBottom = 285;
      const columns = [
        { header: '#', width: 8, maxLines: 1 },
        { header: 'Date', width: 24, maxLines: 2 },
        { header: 'Account', width: 14, maxLines: 1 },
        { header: 'Holder', width: 32, maxLines: 2 },
        { header: 'Type', width: 18, maxLines: 2 },
        { header: 'Mode', width: 22, maxLines: 2 },
        { header: 'Amount', width: 22, maxLines: 1 },
        { header: 'Remarks', width: 46, maxLines: 3 },
      ];

      const drawReportHeader = () => {
        pdf.setFillColor(25, 135, 84);
        pdf.rect(0, 0, 210, 30, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(17);
        pdf.text('SchoolOps Financial Audit Report', left, 14);
        pdf.setFontSize(10);
        pdf.text(`Generated: ${formatDateTime(generatedOn)}`, left, 22);
        pdf.text(`Transactions: ${allTransactions.length}`, 150, 22);
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.text(`Accounts: ${report.totalAccounts}`, left, 38);
        pdf.text(`Total Credits: ${formatCurrency(report.totalCredits)}`, left, 44);
        pdf.text(`Total Debits: ${formatCurrency(report.totalDebits)}`, 84, 44);
        pdf.text(`Pending Due: ${formatCurrency(report.totalDue)}`, 150, 44);
      };

      const drawTableHeader = (y) => {
        pdf.setFillColor(245, 245, 245);
        pdf.rect(left, y, 186, minRowHeight, 'F');
        pdf.setFontSize(9);
        let x = left;
        columns.forEach((col) => {
          pdf.rect(x, y, col.width, minRowHeight);
          pdf.text(col.header, x + 1.5, y + 4.8);
          x += col.width;
        });
      };

      drawReportHeader();
      let y = tableTopStart;
      drawTableHeader(y);
      y += minRowHeight;

      allTransactions.forEach((item, idx) => {
        const rowValues = [
          String(idx + 1),
          formatDateShort(item.txnDate),
          String(item.accountId),
          String(item.owner || '-'),
          String(item.txn?.type || 'N/A'),
          String(item.txn?.mode || 'N/A'),
          formatCurrencyPdf(item.txn?.amount),
          String(item.txn?.remarks || '-'),
        ];

        pdf.setFontSize(8.2);
        const wrappedRow = rowValues.map((value, colIdx) => {
          const col = columns[colIdx];
          const maxWidth = col.width - cellPaddingX * 2;
          const split = pdf.splitTextToSize(value, maxWidth);
          if (split.length <= col.maxLines) return split;
          if (col.maxLines <= 1) return [String(value).slice(0, 10)];
          const kept = split.slice(0, col.maxLines);
          const last = kept[col.maxLines - 1];
          kept[col.maxLines - 1] = last.length > 2 ? `${last.slice(0, -2)}..` : `${last}..`;
          return kept;
        });
        const maxLinesInRow = wrappedRow.reduce((max, lines) => Math.max(max, lines.length), 1);
        const rowHeight = Math.max(minRowHeight, maxLinesInRow * lineHeight + cellPaddingY * 2);

        if (y + rowHeight > pageBottom) {
          pdf.addPage();
          drawReportHeader();
          y = tableTopStart;
          drawTableHeader(y);
          y += minRowHeight;
        }

        let x = left;
        wrappedRow.forEach((lines, colIdx) => {
          const width = columns[colIdx].width;
          pdf.rect(x, y, width, rowHeight);
          lines.forEach((line, lineIdx) => {
            pdf.text(String(line), x + cellPaddingX, y + cellPaddingY + lineHeight * (lineIdx + 1) - 0.7);
          });
          x += width;
        });
        y += rowHeight;
      });

      const dateStamp = generatedOn.toISOString().slice(0, 10);
      pdf.save(`schoolops_audit_transactions_${dateStamp}.pdf`);
    } catch (err) {
      console.error('Error generating audit PDF:', err);
      setError('Unable to download audit PDF report.');
    } finally {
      setDownloadingAudit(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h2 className="text-primary fw-bold mb-0">Manage Accounts & Financials</h2>
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-success" onClick={handleDownloadAuditReport} disabled={downloadingAudit}>
            {downloadingAudit ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Preparing Audit PDF...
              </>
            ) : (
              <>
                <i className="bi bi-file-earmark-arrow-down me-2"></i>
                Download Audit Transactions
              </>
            )}
          </button>
          <button className="btn btn-outline-primary" onClick={fetchAccounts}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh Data
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body">
              <small className="text-muted">Accounts</small>
              <h4 className="mb-0">{report.totalAccounts}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body">
              <small className="text-muted">Net Balance</small>
              <h4 className="mb-0">{formatCurrency(report.totalBalance)}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body">
              <small className="text-muted">Pending Dues</small>
              <h4 className="mb-0 text-warning">{formatCurrency(report.totalDue)}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body">
              <small className="text-muted">Transactions</small>
              <h4 className="mb-0">{report.totalTransactions}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-xl-5">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Account Directory</h5>
            </div>
            <div className="card-body">
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by id, name, username"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleServerSearch()}
                />
                <button className="btn btn-outline-secondary" type="button" onClick={handleServerSearch}>
                  <i className="bi bi-search"></i>
                </button>
              </div>

              <div className="table-responsive" style={{ maxHeight: '420px' }}>
                <table className="table table-sm align-middle table-hover">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th>ID</th>
                      <th>Account Holder</th>
                      <th className="text-end">Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((account) => {
                      const m = getMetrics(account);
                      return (
                        <tr
                          key={account.id}
                          role="button"
                          className={selectedAccountId === account.id ? 'table-primary' : ''}
                          onClick={() => setSelectedAccountId(account.id)}
                        >
                          <td>{account.id}</td>
                          <td>{getOwnerName(account)}</td>
                          <td className="text-end text-warning">{formatCurrency(m.due)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredAccounts.length === 0 && <p className="text-muted mb-0">No accounts found.</p>}
            </div>
          </div>
        </div>

        <div className="col-xl-7">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Account Details</h5>
              {selectedAccount && <span className="badge text-bg-light border">ID #{selectedAccount.id}</span>}
            </div>
            <div className="card-body">
              {selectedAccount && selectedMetrics ? (
                <>
                  <div className="row g-3 mb-3">
                    <div className="col-md-3">
                      <div className="p-2 rounded bg-light border h-100">
                        <small className="text-muted">Holder</small>
                        <div className="fw-semibold text-truncate">{getOwnerName(selectedAccount)}</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-2 rounded bg-light border h-100">
                        <small className="text-muted">Balance</small>
                        <div className="fw-semibold">{formatCurrency(selectedMetrics.balance)}</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-2 rounded bg-light border h-100">
                        <small className="text-muted">Credits</small>
                        <div className="fw-semibold text-success">{formatCurrency(selectedMetrics.credits)}</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-2 rounded bg-light border h-100">
                        <small className="text-muted">Debits</small>
                        <div className="fw-semibold text-danger">{formatCurrency(selectedMetrics.debits)}</div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleTransactionSubmit} className="border rounded p-3 mb-3">
                    <h6 className="mb-3">Create Transaction</h6>
                    <div className="row g-2">
                      <div className="col-md-3">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          className="form-control"
                          placeholder="Amount"
                          value={txForm.amount}
                          onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <select
                          className="form-select"
                          value={txForm.type}
                          onChange={(e) => setTxForm({ ...txForm, type: e.target.value })}
                        >
                          <option value="CREDIT">CREDIT</option>
                          <option value="DEBIT">DEBIT</option>
                        </select>
                      </div>
                      <div className="col-md-3">
                        <select
                          className="form-select"
                          value={txForm.mode}
                          onChange={(e) => setTxForm({ ...txForm, mode: e.target.value })}
                        >
                          <option value="CASH">CASH</option>
                          <option value="ONLINE">ONLINE</option>
                          <option value="BANK_TRANSFER">BANK_TRANSFER</option>
                          <option value="CHEQUE">CHEQUE</option>
                        </select>
                      </div>
                      <div className="col-md-3">
                        <button type="submit" className="btn btn-primary w-100" disabled={submittingTx}>
                          {submittingTx ? 'Saving...' : 'Submit'}
                        </button>
                      </div>
                      <div className="col-12">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Remarks"
                          value={txForm.remarks}
                          onChange={(e) => setTxForm({ ...txForm, remarks: e.target.value })}
                        />
                      </div>
                    </div>
                  </form>

                  <h6 className="mb-2">Recent Transactions</h6>
                  <div className="table-responsive" style={{ maxHeight: '220px' }}>
                    <table className="table table-sm align-middle">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Mode</th>
                          <th>Date</th>
                          <th>Remarks</th>
                          <th className="text-end">Receipt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedMetrics.transactions.length > 0 ? (
                          selectedMetrics.transactions.slice(0, 20).map((txn, idx) => (
                            <tr key={txn.id || idx}>
                              <td>
                                <span
                                  className={`badge ${
                                    String(txn?.type || '').toUpperCase() === 'CREDIT'
                                      ? 'text-bg-success'
                                      : 'text-bg-danger'
                                  }`}
                                >
                                  {txn?.type || 'N/A'}
                                </span>
                              </td>
                              <td>{formatCurrency(txn?.amount)}</td>
                              <td>{txn?.mode || 'N/A'}</td>
                              <td>
                                {formatDateTime(getTxnDateValue(txn))}
                              </td>
                              <td>{txn?.remarks || '-'}</td>
                              <td className="text-end">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => handleDownloadTransactionReceipt(txn, idx)}
                                  disabled={downloadingReceiptKey === `${selectedAccount.id}-${txn?.id || idx}`}
                                >
                                  {downloadingReceiptKey === `${selectedAccount.id}-${txn?.id || idx}` ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                      PDF
                                    </>
                                  ) : (
                                    <>
                                      <i className="bi bi-download me-1"></i>
                                      PDF
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="text-muted">
                              No transactions available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="text-muted mb-0">Select an account to view details and manage transactions.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-xl-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Financial Report</h5>
            </div>
            <div className="card-body">
              <div
                className="rounded-3 p-3 mb-3 border"
                style={{ background: 'linear-gradient(135deg, #e9f4ff 0%, #ffffff 55%, #effff6 100%)' }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Total Inflow</span>
                  <strong className="text-success">{formatCurrency(report.totalCredits)}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Total Outflow</span>
                  <strong className="text-danger">{formatCurrency(report.totalDebits)}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Net Movement</span>
                  <strong className={report.totalCredits - report.totalDebits >= 0 ? 'text-primary' : 'text-danger'}>
                    {formatCurrency(report.totalCredits - report.totalDebits)}
                  </strong>
                </div>
              </div>

              {monthlySeries.length > 0 ? (
                <>
                  <h6 className="mb-2">Monthly Transaction Trend</h6>
                  <div className="rounded-3 border p-3 mb-3">
                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '160px' }} preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="txnTrendFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0d6efd" stopOpacity="0.28" />
                          <stop offset="100%" stopColor="#0d6efd" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      <path d={`${trendPath} L 100 100 L 0 100 Z`} fill="url(#txnTrendFill)" />
                      <path d={trendPath} stroke="#0d6efd" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                    </svg>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {monthlySeries.map((item) => (
                        <span key={item.key} className="badge text-bg-light border">
                          {item.label}: {formatCurrency(item.value)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <h6 className="mb-2">Monthly Transaction Volume</h6>
                  <div className="d-flex flex-column gap-2">
                    {monthlySeries.map((item) => (
                      <div key={item.key}>
                        <div className="d-flex justify-content-between small">
                          <span>{item.label}</span>
                          <span>{formatCurrency(item.value)}</span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div
                            className="progress-bar bg-primary"
                            role="progressbar"
                            style={{ width: `${item.width}%` }}
                            aria-valuenow={item.width}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-muted mb-0">No dated transactions available for charting.</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-xl-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Operational Insights</h5>
            </div>
            <div className="card-body">
              <h6 className="mb-2">Credit vs Debit Ratio</h6>
              <div className="mb-3 d-flex flex-wrap align-items-center gap-3">
                <div
                  className="rounded-circle border"
                  style={{
                    display: 'grid',
                    placeItems: 'center',
                    width: '120px',
                    height: '120px',
                    background: `conic-gradient(#198754 ${txnTypeChart.creditPercent}%, #dc3545 0)`,
                  }}
                >
                  <div
                    className="rounded-circle bg-white d-flex flex-column justify-content-center align-items-center border"
                    style={{ width: '76px', height: '76px' }}
                  >
                    <small className="text-muted">Txns</small>
                    <strong>{txnTypeChart.total}</strong>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Credits ({report.creditCount})</span>
                    <span>{txnTypeChart.creditPercent.toFixed(1)}%</span>
                  </div>
                  <div className="progress mb-2" style={{ height: '10px' }}>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{ width: `${txnTypeChart.creditPercent}%` }}
                    ></div>
                  </div>
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Debits ({report.debitCount})</span>
                    <span>{txnTypeChart.debitPercent.toFixed(1)}%</span>
                  </div>
                  <div className="progress" style={{ height: '10px' }}>
                    <div
                      className="progress-bar bg-danger"
                      role="progressbar"
                      style={{ width: `${txnTypeChart.debitPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <h6 className="mb-2">Monthly Inflow vs Outflow</h6>
              {monthlyFlowSeries.length > 0 ? (
                <div className="rounded border p-2 mb-3">
                  {monthlyFlowSeries.map((item) => (
                    <div key={item.key} className="mb-2">
                      <div className="d-flex justify-content-between small">
                        <span>{item.key}</span>
                        <span>
                          <span className="text-success me-2">+{formatCurrency(item.credit)}</span>
                          <span className="text-danger">-{formatCurrency(item.debit)}</span>
                        </span>
                      </div>
                      <div className="progress mb-1" style={{ height: '7px' }}>
                        <div className="progress-bar bg-success" style={{ width: `${item.creditWidth}%` }}></div>
                      </div>
                      <div className="progress" style={{ height: '7px' }}>
                        <div className="progress-bar bg-danger" style={{ width: `${item.debitWidth}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">Not enough monthly data for flow comparison.</p>
              )}

              <h6 className="mb-2">Top Outstanding Dues</h6>
              {report.topDueAccounts.length > 0 ? (
                <div className="list-group list-group-flush border rounded">
                  {report.topDueAccounts.map((item) => (
                    <div key={item.account.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="text-truncate me-2">#{item.account.id} - {getOwnerName(item.account)}</span>
                      <span className="badge text-bg-warning">{formatCurrency(item.due)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">No pending dues right now.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <h5 className="mb-0">Teacher Payroll Lookup</h5>
        </div>
        <div className="card-body">
          <form className="row g-2 mb-3" onSubmit={handlePayrollFetch}>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Enter Teacher ID"
                value={payrollTeacherId}
                onChange={(e) => setPayrollTeacherId(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-outline-primary w-100" disabled={payrollLoading}>
                {payrollLoading ? 'Loading...' : 'Fetch Payroll'}
              </button>
            </div>
          </form>

          {payrollError && <div className="alert alert-danger py-2">{payrollError}</div>}

          {payrollData && (
            <div className="row g-3">
              <div className="col-md-3">
                <div className="p-3 rounded border bg-light h-100">
                  <small className="text-muted">Name</small>
                  <div className="fw-semibold">{payrollData?.name || '-'}</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="p-3 rounded border bg-light h-100">
                  <small className="text-muted">Salary</small>
                  <div className="fw-semibold">{formatCurrency(payrollData?.salary)}</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="p-3 rounded border bg-light h-100">
                  <small className="text-muted">Email</small>
                  <div className="fw-semibold text-truncate">{payrollData?.email || '-'}</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="p-3 rounded border bg-light h-100">
                  <small className="text-muted">Contact</small>
                  <div className="fw-semibold">{payrollData?.numbers || '-'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAccounts;
