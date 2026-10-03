function SecurityWarnings({ securityWarningFiles }) {
  return (
    <section className="security-card">
      <h2>Security Warnings</h2>

      {securityWarningFiles.length === 0 ? (
        <p>No security warnings found.</p>
      ) : (
        <ul>
          {securityWarningFiles.map((file, index) => (
            <li key={index}>
              <span>{file.name}</span>
              <small>{file.path}</small>

              <div className="security-warning-list">
                {(file.analysis?.securityWarnings || []).map(
                  (warning, warningIndex) => (
                    <code key={warningIndex}>
                      Warning {"->"} {warning}
                    </code>
                  ),
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default SecurityWarnings;
