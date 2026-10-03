function DeleteAccountModal({
  deletePassword,
  loading,
  error,
  onPasswordChange,
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
        className="password-modal delete-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="settings-modal-header">
          <div>
            <h2>Delete Account</h2>
            <p className="danger-text">
              This action is permanent and cannot be undone.
            </p>
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

        <p className="delete-warning">
          Deleting your account will permanently remove your DevLens account
          and all saved scan reports.
        </p>

        <form onSubmit={onSubmit}>
          <input
            type="password"
            placeholder="Enter your password to confirm"
            value={deletePassword}
            onChange={onPasswordChange}
            disabled={loading}
          />

          {error && <p className="settings-error">{error}</p>}

          <div className="delete-actions">
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
              className="delete-account-btn"
              disabled={loading}
            >
              {loading ? "Deleting Account..." : "Permanently Delete Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeleteAccountModal;
