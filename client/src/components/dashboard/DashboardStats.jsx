function DashboardStats({ dashboardStats }) {
  return (
    <section className="dashboard-stats-card">
      <h2>Dashboard Overview</h2>

      <div className="dashboard-stats-grid">
        <div>
          <span>{dashboardStats.totalProjects}</span>
          <p>Total Projects</p>
        </div>

        <div>
          <span>{dashboardStats.totalFiles}</span>
          <p>Total Files</p>
        </div>

        <div>
          <span>{dashboardStats.averageHealth}%</span>
          <p>Average Health</p>
        </div>
      </div>
    </section>
  );
}

export default DashboardStats;
