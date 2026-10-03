function BackendRoutes({ backendRouteFiles }) {
  return (
    <section className="routes-card">
      <h2>Backend Routes</h2>

      {backendRouteFiles.length === 0 ? (
        <p>No backend routes found yet.</p>
      ) : (
        <ul>
          {backendRouteFiles.map((file, index) => (
            <li key={index}>
              <span>{file.name}</span>
              <small>{file.path}</small>

              <div className="route-list">
                {(file.analysis?.backendRoutes || []).map(
                  (route, routeIndex) => (
                    <code key={routeIndex}>
                      {route.method} {route.path}
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

export default BackendRoutes;
