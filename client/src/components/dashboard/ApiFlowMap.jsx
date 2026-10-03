function ApiFlowMap({ flows }) {
  return (
    <section className="flows-card">
      <h2>API Flow Map</h2>

      {flows.length === 0 ? (
        <p>No API flows found yet.</p>
      ) : (
        <ul>
          {flows.map((flow, index) => (
            <li key={index}>
              <span>{flow.sourceFile}</span>
              <small>{flow.sourcePath}</small>

              <div className="flow-box">
                <code>
                  {flow.client} | {flow.method} {flow.url}
                </code>

                {flow.matchedRoute ? (
                  <>
                    <p>matches</p>
                    <code>
                      {flow.matchedRoute.method} {flow.matchedRoute.path}
                    </code>
                    <small>{flow.matchedRoute.routePath}</small>
                  </>
                ) : (
                  <p>No matching backend route found.</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ApiFlowMap;
