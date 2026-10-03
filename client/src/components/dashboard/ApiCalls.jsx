function ApiCalls({ apiCallFiles }) {
  return (
    <section className="api-card">
      <h2>Detected API Calls</h2>

      {apiCallFiles.length === 0 ? (
        <p>No API calls found yet.</p>
      ) : (
        <ul>
          {apiCallFiles.map((file, index) => (
            <li key={index}>
              <span>{file.name}</span>
              <small>{file.path}</small>

              <div className="api-list">
                {(file.analysis?.apiCalls || []).map((api, apiIndex) => (
                  <code key={apiIndex}>
                    {api.client} | {api.method} {"->"} {api.url}
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

export default ApiCalls;
