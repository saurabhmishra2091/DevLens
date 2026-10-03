function RouteHealth({ routeHealth }) {
  return (
    <section className="route-health-card">
      <h2>Route Health Checker</h2>

      <div className="route-health-grid">
        <div>
          <span>{routeHealth.totalApiCalls}</span>
          <p>Total API Calls</p>
        </div>

        <div>
          <span>{routeHealth.matchedApiCalls}</span>
          <p>Matched</p>
        </div>

        <div>
          <span>{routeHealth.unmatchedApiCalls}</span>
          <p>Unmatched</p>
        </div>
      </div>

      {routeHealth.unmatchedFlows.length > 0 && (
        <div className="unmatched-list">
          <h3>Unmatched API Calls</h3>

          {routeHealth.unmatchedFlows.map((flow, index) => (
            <code key={index}>
              {flow.sourcePath}: {flow.method} {flow.url}
            </code>
          ))}
        </div>
      )}
    </section>
  );
}

export default RouteHealth;
