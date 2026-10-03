import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/* ─── Utility: simple intersection observer hook ─── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ─── Navbar ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <nav className={`lp-nav${scrolled ? " lp-nav--scrolled" : ""}`}>
      <div className="lp-nav__inner">
        <a href="#hero" className="lp-nav__brand">
          <span className="lp-nav__logo-mark" />
          DevLens
        </a>

        <ul className={`lp-nav__links${menuOpen ? " lp-nav__links--open" : ""}`}>
          {navLinks.map((l) => (
            <li key={l.label}>
              <a href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
            </li>
          ))}
          <li className="lp-nav__cta-group">
            <Link to="/login" className="lp-btn lp-btn--ghost" onClick={() => setMenuOpen(false)}>
              Sign In
            </Link>
            <Link to="/register" className="lp-btn lp-btn--primary" onClick={() => setMenuOpen(false)}>
              Get Started
            </Link>
          </li>
        </ul>

        <button
          className={`lp-hamburger${menuOpen ? " lp-hamburger--open" : ""}`}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section id="hero" className="lp-hero">
      <div className="lp-hero__bg-grid" aria-hidden="true" />
      <div className="lp-hero__glow lp-hero__glow--left" aria-hidden="true" />
      <div className="lp-hero__glow lp-hero__glow--right" aria-hidden="true" />

      <div className="lp-container lp-hero__content">
        <div className="lp-badge">AI Project Understanding Platform</div>
        <h1 className="lp-hero__heading">
          Understand Any Codebase<br />
          <span className="lp-gradient-text">In Seconds</span>
        </h1>
        <p className="lp-hero__sub">
          DevLens scans your project, maps every file, detects complexity, and generates
          structured technical reports — so your team always knows exactly what's inside.
        </p>
        <div className="lp-hero__actions">
          <Link to="/register" className="lp-btn lp-btn--primary lp-btn--lg">
            Start Analyzing Free
          </Link>
          <a href="#how-it-works" className="lp-btn lp-btn--ghost lp-btn--lg">
            See How It Works
          </a>
        </div>
        <p className="lp-hero__note">No credit card required · Works with any project</p>
      </div>

      {/* Terminal preview */}
      <div className="lp-container lp-hero__terminal-wrap">
        <div className="lp-terminal">
          <div className="lp-terminal__bar">
            <span className="lp-terminal__dot lp-terminal__dot--red" />
            <span className="lp-terminal__dot lp-terminal__dot--yellow" />
            <span className="lp-terminal__dot lp-terminal__dot--green" />
            <span className="lp-terminal__bar-title">devlens — scan</span>
          </div>
          <div className="lp-terminal__body">
            <div className="lp-terminal__line"><span className="lp-tc--muted">$</span> devlens scan ./my-project.zip</div>
            <div className="lp-terminal__line lp-terminal__line--delay-1"><span className="lp-tc--cyan">✓</span> Parsing project structure…</div>
            <div className="lp-terminal__line lp-terminal__line--delay-2"><span className="lp-tc--cyan">✓</span> Detecting tech stack: React, Node.js, MongoDB</div>
            <div className="lp-terminal__line lp-terminal__line--delay-3"><span className="lp-tc--cyan">✓</span> Mapping 247 files · 18 API routes</div>
            <div className="lp-terminal__line lp-terminal__line--delay-4"><span className="lp-tc--green">✓</span> Health score: <span className="lp-tc--green">87%</span></div>
            <div className="lp-terminal__line lp-terminal__line--delay-5"><span className="lp-tc--yellow">⚠</span> 3 security warnings · 6 unused files</div>
            <div className="lp-terminal__line lp-terminal__line--delay-6"><span className="lp-tc--primary">→</span> Report ready. <span className="lp-tc--primary">View Dashboard ↗</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Problem ─── */
function Problem() {
  const [ref, visible] = useReveal();
  const pains = [
    { icon: "⏱", text: "Hours spent reading unfamiliar codebases before making a single change" },
    { icon: "🧩", text: "No clear picture of which files are used, unused, or duplicated" },
    { icon: "🔒", text: "Security issues buried inside hundreds of files, invisible until it's too late" },
    { icon: "📉", text: "Onboarding new developers takes days because there's no structured project map" },
  ];
  return (
    <section id="problem" className="lp-section lp-problem" ref={ref}>
      <div className={`lp-container lp-reveal${visible ? " lp-reveal--visible" : ""}`}>
        <div className="lp-section-label">The Problem</div>
        <h2 className="lp-section-heading">Codebases grow.<br />Clarity doesn't.</h2>
        <p className="lp-section-sub">
          Every developer knows the feeling — you open a project you've never seen and
          it's an undocumented maze. Even your own code from six months ago feels foreign.
        </p>
        <div className="lp-pain-grid">
          {pains.map((p) => (
            <div className="lp-pain-card" key={p.text}>
              <span className="lp-pain-card__icon">{p.icon}</span>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Solution ─── */
function Solution() {
  const [ref, visible] = useReveal();
  return (
    <section id="solution" className="lp-section lp-solution" ref={ref}>
      <div className={`lp-container lp-reveal${visible ? " lp-reveal--visible" : ""}`}>
        <div className="lp-section-label">The Solution</div>
        <h2 className="lp-section-heading">
          One scan. Complete understanding.
        </h2>
        <p className="lp-section-sub">
          DevLens takes your zipped project, analyses every file, and returns a structured
          technical report with your full project map — instantly.
        </p>
        <div className="lp-solution-card">
          <div className="lp-solution-card__inner">
            <div className="lp-solution-card__col">
              <h3>Before DevLens</h3>
              <ul className="lp-check-list lp-check-list--bad">
                <li>Manual code archaeology</li>
                <li>Scattered README files (or none)</li>
                <li>Unknown dependency chains</li>
                <li>Hidden security risks</li>
                <li>No measurable project health</li>
              </ul>
            </div>
            <div className="lp-solution-card__divider" aria-hidden="true" />
            <div className="lp-solution-card__col">
              <h3>After DevLens</h3>
              <ul className="lp-check-list lp-check-list--good">
                <li>Instant project structure map</li>
                <li>Auto-generated technical report</li>
                <li>Full import &amp; API flow graph</li>
                <li>Security warnings surfaced</li>
                <li>Quantified health score</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Features ─── */
function Features() {
  const [ref, visible] = useReveal();
  const features = [
    {
      icon: "🗺",
      title: "Project Structure Map",
      desc: "Every folder, file, and import relationship visualised in a clean, navigable tree.",
    },
    {
      icon: "⚙️",
      title: "Tech Stack Detection",
      desc: "Automatically identifies frameworks, libraries, and languages used across your codebase.",
    },
    {
      icon: "🔗",
      title: "API Flow Map",
      desc: "Traces every frontend API call to its backend route so nothing is a mystery.",
    },
    {
      icon: "❤️",
      title: "Health Score",
      desc: "A single 0–100 score that summarises code quality, complexity, and security posture.",
    },
    {
      icon: "🛡",
      title: "Security Warnings",
      desc: "Flags risky patterns such as hardcoded secrets, exposed credentials, and unsafe imports.",
    },
    {
      icon: "🧬",
      title: "Database Models",
      desc: "Extracts and documents all database schemas and model definitions in one place.",
    },
    {
      icon: "♻️",
      title: "Duplicate & Unused Files",
      desc: "Surfaces dead code and redundant files so you can keep the codebase lean.",
    },
    {
      icon: "🤖",
      title: "Ask DevLens AI",
      desc: "Chat with your codebase — ask any question and get an answer grounded in your files.",
    },
    {
      icon: "📄",
      title: "Downloadable Reports",
      desc: "Export a complete JSON report to share with your team or store for future reference.",
    },
  ];
  return (
    <section id="features" className="lp-section" ref={ref}>
      <div className={`lp-container lp-reveal${visible ? " lp-reveal--visible" : ""}`}>
        <div className="lp-section-label">Features</div>
        <h2 className="lp-section-heading">Everything you need to understand your project</h2>
        <p className="lp-section-sub">
          Each scan produces a comprehensive set of reports, each focused on a different
          dimension of your codebase.
        </p>
        <div className="lp-features-grid">
          {features.map((f) => (
            <div className="lp-feature-card" key={f.title}>
              <span className="lp-feature-card__icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */
function HowItWorks() {
  const [ref, visible] = useReveal();
  const steps = [
    {
      step: "01",
      title: "Create an Account",
      desc: "Register with your name and email. No billing required to get started.",
      cta: { label: "Register →", to: "/register" },
    },
    {
      step: "02",
      title: "Sign In to the Dashboard",
      desc: "Your personal dashboard shows past scans, overall stats, and quick-access tools.",
      cta: { label: "Sign In →", to: "/login" },
    },
    {
      step: "03",
      title: "Upload & Scan Your Project",
      desc: "Zip your project folder and upload it. DevLens processes every file automatically.",
    },
    {
      step: "04",
      title: "Review the Analysis",
      desc: "Explore tech stack, API maps, health score, security warnings, and more.",
    },
    {
      step: "05",
      title: "Download the Report",
      desc: "Export a structured JSON report to share, archive, or use in documentation.",
    },
  ];
  return (
    <section id="how-it-works" className="lp-section lp-hiw" ref={ref}>
      <div className={`lp-container lp-reveal${visible ? " lp-reveal--visible" : ""}`}>
        <div className="lp-section-label">How It Works</div>
        <h2 className="lp-section-heading">From upload to insight in minutes</h2>
        <p className="lp-section-sub">
          The full user flow — from landing here to having a complete technical report in hand.
        </p>
        <div className="lp-steps">
          {steps.map((s) => (
            <div className="lp-step" key={s.step}>
              <div className="lp-step__line" aria-hidden="true" />
              <div className="lp-step__badge">{s.step}</div>
              <div className="lp-step__body">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {s.cta && (
                  <Link to={s.cta.to} className="lp-step__cta">{s.cta.label}</Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Flow diagram */}
        <div className="lp-flow">
          {["Landing Page", "Register / Login", "Dashboard", "Scan Project", "Analysis", "Technical Report"].map((node, i, arr) => (
            <div className="lp-flow__item" key={node}>
              <div className="lp-flow__node">{node}</div>
              {i < arr.length - 1 && <div className="lp-flow__arrow" aria-hidden="true">→</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Product Preview ─── */
function ProductPreview() {
  const [ref, visible] = useReveal();
  const panels = [
    { label: "Dashboard Overview", desc: "Total projects, files scanned, and average health at a glance." },
    { label: "Tech Stack", desc: "React, Node.js, Express, MongoDB — detected automatically from your files." },
    { label: "Health Score", desc: "A quantified 0–100 project health indicator with a full security audit." },
    { label: "API Flow Map", desc: "Every frontend call matched to its backend route in one interactive view." },
  ];
  return (
    <section id="preview" className="lp-section lp-preview" ref={ref}>
      <div className={`lp-container lp-reveal${visible ? " lp-reveal--visible" : ""}`}>
        <div className="lp-section-label">Product Preview</div>
        <h2 className="lp-section-heading">A dashboard built for developers</h2>
        <p className="lp-section-sub">
          Every report section is designed to surface actionable information, not noise.
        </p>
        <div className="lp-preview-browser">
          <div className="lp-preview-browser__bar">
            <span className="lp-terminal__dot lp-terminal__dot--red" />
            <span className="lp-terminal__dot lp-terminal__dot--yellow" />
            <span className="lp-terminal__dot lp-terminal__dot--green" />
            <div className="lp-preview-browser__url">devlens — dashboard</div>
          </div>
          <div className="lp-preview-browser__body">
            {/* Mock stats row */}
            <div className="lp-mock-stats">
              <div className="lp-mock-stat"><span className="lp-mock-stat__val lp-gradient-text">12</span><span>Projects</span></div>
              <div className="lp-mock-stat"><span className="lp-mock-stat__val lp-gradient-text">1,840</span><span>Files</span></div>
              <div className="lp-mock-stat"><span className="lp-mock-stat__val lp-tc--green">87%</span><span>Avg Health</span></div>
            </div>
            {/* Mock report cards */}
            <div className="lp-mock-cards">
              {panels.map((p) => (
                <div className="lp-mock-card" key={p.label}>
                  <div className="lp-mock-card__title">{p.label}</div>
                  <div className="lp-mock-card__desc">{p.desc}</div>
                  <div className="lp-mock-card__bar">
                    <div className="lp-mock-card__bar-fill" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */
function FAQ() {
  const [ref, visible] = useReveal();
  const [open, setOpen] = useState(null);
  const faqs = [
    {
      q: "What file format does DevLens accept?",
      a: "DevLens accepts a zipped (.zip) archive of your project folder. Simply compress your project and upload it via the Project Scanner on the dashboard.",
    },
    {
      q: "What languages and frameworks are supported?",
      a: "DevLens can parse JavaScript, TypeScript, React, Node.js, Express, and related ecosystems. It analyses file contents, import statements, and route definitions to produce its reports.",
    },
    {
      q: "Is my source code stored permanently?",
      a: "DevLens stores the generated analysis report, not your raw source files. The uploaded zip is processed in memory and is not persisted beyond the scan.",
    },
    {
      q: "Can I re-run a scan for an updated project?",
      a: "Yes. Each scan creates a new report. You can view and load all previous scan reports from the Recent Reports section on your dashboard.",
    },
    {
      q: "How do I share a report with my team?",
      a: "Use the Download Report button to export a structured JSON file containing the full analysis. You can share, archive, or embed this file in your documentation.",
    },
    {
      q: "What is the Ask DevLens AI feature?",
      a: "After a scan, you can ask natural-language questions about your project — for example, \"Which files handle authentication?\" or \"What APIs does the frontend call?\" — and get answers grounded in your actual codebase.",
    },
  ];
  return (
    <section id="faq" className="lp-section" ref={ref}>
      <div className={`lp-container lp-reveal${visible ? " lp-reveal--visible" : ""}`}>
        <div className="lp-section-label">FAQ</div>
        <h2 className="lp-section-heading">Common questions</h2>
        <div className="lp-faq">
          {faqs.map((f, i) => (
            <div
              className={`lp-faq__item${open === i ? " lp-faq__item--open" : ""}`}
              key={f.q}
            >
              <button
                className="lp-faq__q"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                {f.q}
                <span className="lp-faq__chevron" aria-hidden="true">{open === i ? "▲" : "▼"}</span>
              </button>
              {open === i && <div className="lp-faq__a">{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function CTA() {
  const [ref, visible] = useReveal();
  return (
    <section id="cta" className="lp-section lp-cta" ref={ref}>
      <div className="lp-cta__glow" aria-hidden="true" />
      <div className={`lp-container lp-cta__content lp-reveal${visible ? " lp-reveal--visible" : ""}`}>
        <h2 className="lp-section-heading">
          Ready to understand your codebase?
        </h2>
        <p className="lp-section-sub">
          Create a free account and scan your first project in under a minute.
        </p>
        <div className="lp-hero__actions">
          <Link to="/register" className="lp-btn lp-btn--primary lp-btn--lg">
            Create Free Account
          </Link>
          <Link to="/login" className="lp-btn lp-btn--ghost lp-btn--lg">
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-container lp-footer__inner">
        <div className="lp-footer__brand">
          <span className="lp-nav__logo-mark" />
          <strong>DevLens</strong>
          <p>AI Project Understanding Platform</p>
        </div>
        <div className="lp-footer__links">
          <div className="lp-footer__col">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="lp-footer__col">
            <h4>Account</h4>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Register</Link>
            <Link to="/forgot-password">Forgot Password</Link>
          </div>
        </div>
      </div>
      <div className="lp-footer__bottom">
        © {new Date().getFullYear()} DevLens. Built for developers.
      </div>
    </footer>
  );
}

/* ─── Page Assembly ─── */
export default function LandingPage() {
  return (
    <div className="lp-root">
      <Navbar />
      <Hero />
      <Problem />
      <Solution />
      <Features />
      <HowItWorks />
      <ProductPreview />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
