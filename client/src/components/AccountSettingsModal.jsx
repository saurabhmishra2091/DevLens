function AccountSettingsModal({ onClose, onChangePassword, onDeleteAccount }) {
  return (
    <div className="settings-overlay" onClick={onClose}>
      <div
        className="account-settings-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="settings-modal-header">
          <div>
            <h2>Account Settings</h2>
            <p>Manage your DevLens account</p>
          </div>

          <button
            type="button"
            className="close-settings-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* CHANGE PASSWORD */}
        <div className="settings-option">
          <div>
            <h3>🔐 Change Password</h3>
            <p>Update your password to keep your account secure.</p>
          </div>

          <button className="change-password-btn" onClick={onChangePassword}>
            Change Password
          </button>
        </div>

        {/* DELETE ACCOUNT */}
        <div className="settings-option danger-option">
          <div>
            <h3>🗑️ Delete Account</h3>
            <p>
              Permanently delete your account and all saved project reports.
            </p>
          </div>

          <button className="delete-account-btn" onClick={onDeleteAccount}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccountSettingsModal;
