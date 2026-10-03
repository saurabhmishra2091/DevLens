function AskDevLensSection({ answer, onOpen }) {
  return (
    <section className="assistant-card">
      <h2>Ask DevLens</h2>

      <p className="assistant-description">
        Understand your codebase with DevLens. Ask about architecture,
        authentication, APIs, database, security and code quality.
      </p>

      <button type="button" onClick={onOpen}>
        ✦ Ask DevLens
      </button>

      {answer && <div className="answer">{answer}</div>}
    </section>
  );
}

export default AskDevLensSection;
