function ProjectSummary({ totalFiles, summary }) {
  return (
    <section className="summary-card">
      <h2>Project Summary</h2>

      <div className="summary-grid">
        <div>
          <span>{totalFiles}</span>
          <p>Total Files</p>
        </div>

        <div>
          <span>{summary.reactComponents}</span>
          <p>React Components</p>
        </div>

        <div>
          <span>{summary.javascriptFiles}</span>
          <p>JavaScript Files</p>
        </div>

        <div>
          <span>{summary.cssFiles}</span>
          <p>CSS Files</p>
        </div>

        <div>
          <span>{summary.jsonFiles}</span>
          <p>JSON Files</p>
        </div>

        <div>
          <span>{summary.backendFiles}</span>
          <p>Backend Files</p>
        </div>

        <div>
          <span>{summary.otherFiles}</span>
          <p>Other Files</p>
        </div>
      </div>
    </section>
  );
}

export default ProjectSummary;
