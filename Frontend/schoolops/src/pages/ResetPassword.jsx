import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";

const PASSWORD_MIN_LENGTH = 8;

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(() => {
    const raw = searchParams.get("token");
    return raw ? raw.trim() : "";
  }, [searchParams]);

  const [status, setStatus] = useState("validating"); // validating | invalid | valid | success
  const [error, setError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isPasswordValid = newPassword.length >= PASSWORD_MIN_LENGTH;
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit = status === "valid" && isPasswordValid && isMatch && !isSubmitting;

  // Password strength (0–4)
  const strength = useMemo(() => {
    let s = 0;
    if (newPassword.length >= 8) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[0-9]/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  }, [newPassword]);

  useEffect(() => {
    let cancelled = false;

    if (!token) {
      setStatus("invalid");
      setError("Reset link is missing a token.");
      return;
    }

    setStatus("validating");
    setError("");

    api
      .get("/api/public/reset-password/validate", { params: { token } })
      .then(() => {
        if (!cancelled) setStatus("valid");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("invalid");
          setError("This reset link is invalid or has expired.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (status !== "success") return;
    const id = setTimeout(() => navigate("/login"), 3000);
    return () => clearTimeout(id);
  }, [status, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError("");

    try {
      await api.post("/api/public/reset-password", {
        token,
        newPassword,
      });
      setStatus("success");
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Unable to reset password. Please try again.";
      setError(message);
      setStatus("valid");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
      <div className="card border-0 shadow-lg" style={{ maxWidth: 420, width: "100%", borderRadius: "1rem" }}>
        <div className="card-body p-4 p-md-5">

          {/* Header */}
          <div className="text-center mb-4">
            <div className="fw-bold text-primary text-uppercase small mb-1">
              SchoolOps
            </div>
            <h4 className="fw-semibold mb-1">Reset your password</h4>
            <p className="text-muted small mb-0">
              Create a new secure password
            </p>
          </div>

          {/* Validating */}
          {status === "validating" && (
            <div className="alert alert-secondary d-flex align-items-center gap-2">
              <div className="spinner-border spinner-border-sm" />
              <span>Validating reset link…</span>
            </div>
          )}

          {/* Invalid */}
          {status === "invalid" && (
            <>
              <div className="alert alert-danger">{error}</div>
              <div className="text-center">
                <button
                  className="btn btn-link text-decoration-none"
                  onClick={() => navigate("/login")}
                >
                  Back to login
                </button>
              </div>
            </>
          )}

          {/* Success */}
          {status === "success" && (
            <div className="alert alert-success text-center">
              <div className="fw-semibold mb-1">
                Password reset successful
              </div>
              <small>Redirecting to login…</small>
            </div>
          )}

          {/* Form */}
          {status === "valid" && (
            <form onSubmit={handleSubmit} noValidate>

              {/* New password */}
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <div className="input-group">
                  <input
                    type={showNew ? "text" : "password"}
                    className={`form-control ${
                      newPassword && !isPasswordValid ? "is-invalid" : ""
                    }`}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowNew(!showNew)}
                  >
                    {showNew ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="form-text">
                  Minimum {PASSWORD_MIN_LENGTH} characters
                </div>

                {/* Strength bar */}
                <div className="progress mt-2" style={{ height: 6 }}>
                  <div
                    className={`progress-bar ${
                      strength <= 1
                        ? "bg-danger"
                        : strength === 2
                        ? "bg-warning"
                        : strength === 3
                        ? "bg-info"
                        : "bg-success"
                    }`}
                    style={{ width: `${(strength / 4) * 100}%` }}
                  />
                </div>
              </div>

              {/* Confirm password */}
              <div className="mb-3">
                <label className="form-label">Confirm Password</label>
                <div className="input-group">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className={`form-control ${
                      confirmPassword && !isMatch ? "is-invalid" : ""
                    }`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="invalid-feedback">
                  Passwords do not match
                </div>
              </div>

              {error && (
                <div className="alert alert-danger py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-100 fw-semibold"
                disabled={!canSubmit}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Resetting…
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
