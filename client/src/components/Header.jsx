function Header({ user, onOpenSettings, onLogout }) {
  return (
    <header className="header">
      <div>
        <h1>DevLens</h1>
        <p>AI Project Understanding Platform</p>
      </div>

      {user && (
        <div className="user-profile-header">
          <span>
            Welcome, <strong>{user.name}</strong>
          </span>

          <button onClick={onOpenSettings} className="settings-btn">
            Account Settings
          </button>

          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;
