import { useEffect, useMemo, useState } from "react";
import auth from "../../utils/auth";
import API_BASE_URL from "../../config";

const RAZORPAY_KEY = "rzp_test_SGUXdDf8BB9T6g";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Account = () => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paying, setPaying] = useState(false);

  const fetchAccount = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/account`, {
        headers: auth.getAuthHeaders(),
      });
      if (!response.ok) {
        setError("Failed to load account details.");
        return;
      }
      const data = await response.json();
      setAccount(data || null);
    } catch (err) {
      console.error("Error fetching account:", err);
      setError("Unable to load account details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  const totals = useMemo(() => {
    const txns = Array.isArray(account?.transactions) ? account.transactions : [];
    const txnIds = Array.isArray(account?.transactionIds) ? account.transactionIds : [];
    const credits = txns
      .filter((txn) => String(txn.type || "").toUpperCase() === "CREDIT")
      .reduce((sum, txn) => sum + Number(txn.amount || 0), 0);
    const debits = txns
      .filter((txn) => String(txn.type || "").toUpperCase() === "DEBIT")
      .reduce((sum, txn) => sum + Number(txn.amount || 0), 0);
    const balance = Number(account?.accountBalance ?? account?.balance ?? credits - debits);
    const due = Number(account?.dues ?? account?.pendingAmount ?? (balance < 0 ? Math.abs(balance) : 0));
    return { credits, debits, balance, due, txns, txnIds };
  }, [account]);

  const parseOrderResponse = (raw) => {
    if (!raw) return null;
    if (typeof raw === "object") return raw;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError("");

    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      setError("Enter a valid payment amount.");
      return;
    }

    if (!account?.id) {
      setError("Account ID not found. Refresh and try again.");
      return;
    }

    setPaying(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Razorpay SDK failed to load.");
        return;
      }

      const orderResponse = await fetch(`${API_BASE_URL}/api/student/payment/request`, {
        method: "POST",
        headers: auth.getAuthHeaders(),
        body: JSON.stringify({ amount }),
      });

      if (!orderResponse.ok) {
        setError("Failed to create payment request.");
        return;
      }

      const orderRaw = await orderResponse.text();
      const order = parseOrderResponse(orderRaw);
      if (!order?.id) {
        setError("Invalid payment order response.");
        return;
      }

      const options = {
        key: RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "SchoolOps",
        description: "Student fee payment",
        order_id: order.id,
        handler: async (response) => {
          try {
            const saveResponse = await fetch(`${API_BASE_URL}/api/student/payment/success`, {
              method: "POST",
              headers: auth.getAuthHeaders(),
              body: JSON.stringify({
                payment_id: response.razorpay_payment_id,
                account_id: account.id,
              }),
            });

            if (!saveResponse.ok) {
              setError("Payment captured but transaction record failed.");
              return;
            }

            setPaymentAmount("");
            await fetchAccount();
          } catch (err) {
            console.error("Error saving payment:", err);
            setError("Payment succeeded but save failed. Contact support.");
          }
        },
        prefill: {
          name: account?.studentName || account?.userName || "",
        },
        theme: {
          color: "#1e40af",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
      });
      razorpay.open();
    } catch (err) {
      console.error("Error processing payment:", err);
      setError("Unable to start payment process.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Account & Fees</h2>
        <button type="button" className="btn btn-outline-primary btn-sm" onClick={fetchAccount}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <small className="text-muted">Balance</small>
              <h4 className="mb-0">Rs {totals.balance.toFixed(2)}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <small className="text-muted">Pending Dues</small>
              <h4 className="mb-0 text-warning">Rs {totals.due.toFixed(2)}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <small className="text-muted">Total Paid</small>
              <h4 className="mb-0 text-success">Rs {totals.credits.toFixed(2)}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <small className="text-muted">Total Charges</small>
              <h4 className="mb-0 text-danger">Rs {totals.debits.toFixed(2)}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">Pay Fees Online</h5>
              <form onSubmit={handlePayment}>
                <div className="mb-3">
                  <label className="form-label">Amount (INR)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={paying}>
                  {paying ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Processing
                    </>
                  ) : (
                    <>
                      <i className="bi bi-lightning-charge me-2"></i>
                      Pay with Razorpay
                    </>
                  )}
                </button>
              </form>
              <small className="text-muted d-block mt-3">
                Secure payment via Razorpay test mode.
              </small>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">Recent Transactions</h5>
              {totals.txns.length > 0 ? (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Mode</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {totals.txns.slice(0, 10).map((txn, index) => (
                        <tr key={txn.id || index}>
                          <td>
                            <span
                              className={`badge ${
                                String(txn.type || "").toUpperCase() === "CREDIT" ? "text-bg-success" : "text-bg-danger"
                              }`}
                            >
                              {txn.type || "N/A"}
                            </span>
                          </td>
                          <td>Rs {Number(txn.amount || 0).toFixed(2)}</td>
                          <td>{txn.mode || "N/A"}</td>
                          <td>{txn.remarks || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : totals.txnIds.length > 0 ? (
                <div>
                  <p className="text-muted mb-2">Detailed transaction fields are not included in this API response.</p>
                  <div className="d-flex flex-wrap gap-2">
                    {totals.txnIds.map((id) => (
                      <span key={id} className="badge text-bg-light border text-dark">
                        Transaction #{id}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted mb-0">No transactions yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
