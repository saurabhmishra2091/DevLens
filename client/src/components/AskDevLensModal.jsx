import { useEffect, useState } from "react";

const questionGroups = [
  {
    title: "Architecture",
    icon: "⌘",
    questions: [
      "Explain the architecture of this project.",
      "Where is the main entry point?",
      "How does data flow through this project?",
      "What are the most important files in this project?",
    ],
  },
  {
    title: "Authentication",
    icon: "🔐",
    questions: [
      "Where is authentication implemented?",
      "Explain the login flow.",
      "Where is JWT generated and verified?",
      "Which routes are protected?",
    ],
  },
  {
    title: "APIs",
    icon: "⇄",
    questions: [
      "What APIs are available in this project?",
      "Which component calls the API?",
      "Show me the complete API flow.",
      "Which APIs are unmatched?",
    ],
  },
  {
    title: "Database",
    icon: "▣",
    questions: [
      "Where is the database connection?",
      "What database models exist?",
      "Explain the User model.",
      "Which APIs use the database models?",
    ],
  },
  {
    title: "React",
    icon: "⚛",
    questions: [
      "What are the main React components?",
      "Which components use Context?",
      "Where are useEffect hooks used?",
      "Which component renders the dashboard?",
    ],
  },
  {
    title: "Security",
    icon: "◉",
    questions: [
      "What security issues were found?",
      "Are there exposed environment variables?",
      "Are there hardcoded credentials?",
      "Which files have security warnings?",
    ],
  },
  {
    title: "Code Quality",
    icon: "◆",
    questions: [
      "Which files are unused?",
      "Which files are duplicated?",
      "Which files have high complexity?",
      "Which files should I refactor first?",
    ],
  },
  {
    title: "Project Understanding",
    icon: "✦",
    questions: [
      "Explain this project like I am a new developer.",
      "Give me a 2-minute explanation of this project.",
      "What should a new developer understand first?",
      "What are the riskiest parts of this project?",
    ],
  },
];

function AskDevLensModal({
  isOpen,
  onClose,
  onAsk,
  onClearAnswer,
  answer,
  loading,
  error,
}) {
  const [question, setQuestion] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setQuestion("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleQuestionChange = (event) => {
    const value = event.target.value;

    setQuestion(value);

    // Whenever user starts editing/clearing
    // the question, remove the previous answer.
    if (answer) {
      onClearAnswer();
    }
  };

  // ==========================================
  // SUBMIT QUESTION
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    await onAsk(trimmedQuestion);
  };

  // ==========================================
  // QUICK QUESTION
  // ==========================================

  const handleSuggestedQuestion = async (selectedQuestion) => {
    if (loading) {
      return;
    }

    setQuestion(selectedQuestion);

    // Clear previous answer before asking
    onClearAnswer();

    await onAsk(selectedQuestion);
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const handleClose = () => {
    setQuestion("");

    onClearAnswer();

    onClose();
  };

  return (
    <div
      className="ask-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="ask-modal">
        {/* =====================================
            HEADER
        ====================================== */}

        <div className="ask-modal-header">
          <div className="ask-modal-title">
            <div className="ask-modal-logo">✦</div>

            <div>
              <h2>Ask DevLens</h2>

              <p>Understand your codebase with AI</p>
            </div>
          </div>

          <button
            type="button"
            className="ask-modal-close"
            onClick={handleClose}
            aria-label="Close Ask DevLens"
          >
            ×
          </button>
        </div>

        {/* =====================================
            QUESTION INPUT
        ====================================== */}

        <form className="ask-question-form" onSubmit={handleSubmit}>
          <label htmlFor="devlens-question">
            What would you like to understand?
          </label>

          <div className="ask-input-wrapper">
            <span className="ask-input-icon">✦</span>

            <input
              id="devlens-question"
              type="text"
              value={question}
              onChange={handleQuestionChange}
              placeholder="Ask about authentication, APIs, architecture..."
              autoFocus
              disabled={loading}
            />

            <button
              type="submit"
              className="ask-submit-button"
              disabled={loading || !question.trim()}
            >
              {loading ? "Thinking..." : "Ask"}
            </button>
          </div>
        </form>

        {/* =====================================
            ERROR
        ====================================== */}

        {error && (
          <div className="ask-error">
            <span>!</span>

            <p>{error}</p>
          </div>
        )}

        {/* =====================================
            ANSWER
        ====================================== */}

        {answer && !loading && (
          <div className="ask-answer">
            <div className="ask-answer-header">
              <span className="ask-answer-icon">✦</span>

              <strong>DevLens Answer</strong>
            </div>

            <div className="ask-answer-content">{answer}</div>
          </div>
        )}

        {/* =====================================
            QUICK QUESTIONS

            Show only when there is:
            - no answer
            - no loading
            - empty question
        ====================================== */}

        {!answer && !loading && !question.trim() && (
          <div className="ask-suggestions">
            <div className="ask-suggestions-header">
              <span>QUICK QUESTIONS</span>

              <small>Click any question to ask</small>
            </div>

            <div className="question-groups">
              {questionGroups.map((group) => (
                <div className="question-group" key={group.title}>
                  <div className="question-group-title">
                    <span className="question-group-icon">{group.icon}</span>

                    <span>{group.title}</span>
                  </div>

                  <div className="question-list">
                    {group.questions.map((item) => (
                      <button
                        type="button"
                        className="suggested-question"
                        key={item}
                        onClick={() => handleSuggestedQuestion(item)}
                      >
                        <span>{item}</span>

                        <span className="question-arrow">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================
            LOADING
        ====================================== */}

        {loading && (
          <div className="ask-loading">
            <div className="ask-loading-animation">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <p>DevLens is analyzing your project...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AskDevLensModal;
