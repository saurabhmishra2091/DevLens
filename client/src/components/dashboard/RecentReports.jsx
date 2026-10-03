function RecentReports({ recentReports, onLoad, onDelete }) {
  return (
    <section className="recent-reports-card">
      <div className="section-header">
        <div>
          <h2>Recent Scans</h2>
          <p>Your recently saved project analysis reports</p>
        </div>
      </div>

      {recentReports.length === 0 ? (
        <div className="empty-reports">
          <p>No saved scans yet.</p>
          <small>Scan a project and your report will appear here.</small>
        </div>
      ) : (
        <div className="reports-list">
          {recentReports.map((report) => (
            <div className="report-item" key={report._id}>
              <div className="report-info">
                <strong>{report.projectName || "Unnamed Project"}</strong>
                <small>{report.totalFiles || 0} files</small>
                {report.createdAt && (
                  <small>{new Date(report.createdAt).toLocaleString()}</small>
                )}
              </div>

              <div className="report-health">
                <span>{report.healthScore ?? 0}%</span>
                <small>Health</small>
              </div>

              <div className="report-actions">
                <button type="button" onClick={() => onLoad(report._id)}>
                  View Report
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(report._id)}
                  className="delete-report-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default RecentReports;
