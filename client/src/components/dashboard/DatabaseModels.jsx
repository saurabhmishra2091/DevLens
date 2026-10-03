function DatabaseModels({ modelFiles }) {
  return (
    <section className="models-card">
      <h2>Database Models</h2>

      {modelFiles.length === 0 ? (
        <p>No database models found yet.</p>
      ) : (
        <ul>
          {modelFiles.map((file, index) => (
            <li key={index}>
              <span>{file.name}</span>
              <small>{file.path}</small>

              <div className="model-list">
                {(file.analysis?.models || []).map((model, modelIndex) => (
                  <code key={modelIndex}>
                    Model {"->"} {model}
                  </code>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default DatabaseModels;
