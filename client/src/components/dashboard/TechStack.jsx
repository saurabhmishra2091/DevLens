function TechStack({ techStack }) {
  return (
    <section className="tech-card">
      <h2>Technology Stack</h2>

      {techStack.length === 0 ? (
        <p>No technologies detected yet.</p>
      ) : (
        <div className="tech-list">
          {techStack.map((tech, index) => (
            <span key={index}>{tech}</span>
          ))}
        </div>
      )}
    </section>
  );
}

export default TechStack;
