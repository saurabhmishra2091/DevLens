function UnusedFiles({ unusedFiles }) {
  return (
    <section className="unused-card">
      <h2>Unused File Detector</h2>

      {unusedFiles.length === 0 ? (
        <p>No unused code files detected.</p>
      ) : (
        <ul>
          {unusedFiles.map((file, index) => (
            <li key={index}>
              <span>{file.name}</span>
              <small>{file.path}</small>
              <code>Not imported anywhere</code>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default UnusedFiles;
