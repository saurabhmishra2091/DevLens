function ComplexityDetector({ complexFiles }) {
  return (
    <section className="complexity-card">
      <h2>Complexity Detector</h2>

      {complexFiles.length === 0 ? (
        <p>No complex files detected.</p>
      ) : (
        <ul>
          {complexFiles.map((file, index) => (
            <li key={index}>
              <span>{file.name}</span>
              <small>{file.path}</small>

              <div className="complexity-list">
                <code>Lines: {file.analysis.lines}</code>
                <code>Functions: {file.analysis.functionCount}</code>
                <code>Complexity: {file.analysis.complexity}</code>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ComplexityDetector;
