function HealthAudit({ healthScore, securityAudit }) {
  return (
    <section className="health-card">
      <h2>Codebase Health & Security Audit</h2>

      <div className="health-badge">
        <span className="health-score">{healthScore}%</span>
        <p>Code Health Rating</p>
      </div>

      {securityAudit.length === 0 ? (
        <p className="clean-audit">
          No security warnings or missing .env issues detected.
        </p>
      ) : (
        <ul className="security-list">
          {securityAudit.map((item, index) => (
            <li key={index} className="security-item">
              <strong>{item.file}</strong> ({item.path}):{" "}
              <span>{item.warning}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default HealthAudit;
