function ProjectInsights({ insights }) {
  return (
    <section className="insights-card">
      <h2>Project Insights</h2>

      <div className="insights-grid">
        <div>
          <h3>React Components</h3>

          {insights.components.length === 0 ? (
            <p>No React components found.</p>
          ) : (
            <ul>
              {insights.components.map((component, index) => (
                <li key={index}>
                  <span>{component.name}</span>
                  <small>{component.path}</small>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3>Important Files</h3>

          {insights.importantFiles.length === 0 ? (
            <p>No important files found.</p>
          ) : (
            <ul>
              {insights.importantFiles.map((file, index) => (
                <li key={index}>
                  <span>{file.name}</span>
                  <small>{file.importance}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProjectInsights;
