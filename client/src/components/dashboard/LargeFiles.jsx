function LargeFiles({ largeFiles }) {
  return (
    <section className="large-files-card">
      <h2>Large File Detector</h2>

      {largeFiles.length === 0 ? (
        <p>No large files detected.</p>
      ) : (
        <ul>
          {largeFiles.map((file, index) => (
            <li key={index}>
              <span>{file.name}</span>
              <small>{file.path}</small>
              <code>{file.analysis.lines} lines</code>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default LargeFiles;
