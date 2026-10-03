import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { forgotPassword } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await forgotPassword(email);

    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setSubmitted(true);

    if (result.resetToken) {
      setResetToken(result.resetToken);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p>Enter your email to receive a password reset token.</p>

        {!submitted ? (
          <>
            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Processing..." : "Get Reset Token"}
              </button>
            </form>
          </>
        ) : (
          <div className="reset-token-box">
            <div className="auth-success">
              Reset token generated successfully.
            </div>

            {resetToken && (
              <>
                <p className="reset-token-label">
                  Copy your reset token below (valid for 15 minutes):
                </p>

                <div className="reset-token-value">
                  <code>{resetToken}</code>
                  <button
                    type="button"
                    className="copy-token-btn"
                    onClick={() => navigator.clipboard.writeText(resetToken)}
                  >
                    Copy
                  </button>
                </div>

                <p className="reset-token-hint">
                  Paste this token on the{" "}
                  <Link to="/reset-password">Reset Password</Link> page.
                </p>
              </>
            )}
          </div>
        )}

        <p className="auth-footer">
          <Link to="/login">← Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
