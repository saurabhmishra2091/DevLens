function ChangePasswordModal({
  currentPassword,
  newPassword,
  confirmPassword,
  loading,
  error,
  success,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onClose,
}) {
  return (
    <div
      className="settings-overlay"
      onClick={() => {
        if (!loading) onClose();
      }}
    >
      <div
        className="password-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="settings-modal-header">
          <div>
            <h2>Change Password</h2>
            <p>Enter your current password and choose a new password.</p>
          </div>

          <button
            type="button"
            className="close-settings-btn"
            disabled={loading}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={onCurrentPasswordChange}
            disabled={loading}
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={onNewPasswordChange}
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={onConfirmPasswordChange}
            disabled={loading}
          />

          {error && <p className="settings-error">{error}</p>}
          {success && <p className="settings-success">{success}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-btn"
              disabled={loading}
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="change-password-btn"
              disabled={loading}
            >
              {loading ? "Changing Password..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
