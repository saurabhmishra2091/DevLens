function ImportMap({ importFiles }) {
  return (
    <section className="imports-card">
      <h2>Import Map</h2>

      {importFiles.length === 0 ? (
        <p>No imports found yet.</p>
      ) : (
        <ul>
          {importFiles.map((file, index) => (
            <li key={index}>
              <span>{file.name}</span>
              <small>{file.path}</small>

              <div className="import-list">
                {(file.analysis?.imports || []).map(
                  (importPath, importIndex) => (
                    <code key={importIndex}>
                      imports {"->"} {importPath}
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

export default ImportMap;
