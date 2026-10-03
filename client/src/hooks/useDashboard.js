import { useState, useEffect } from "react";
import API_URL from "../constants/api";

const DEFAULT_SUMMARY = {
  reactComponents: 0,
  javascriptFiles: 0,
  cssFiles: 0,
  jsonFiles: 0,
  backendFiles: 0,
  otherFiles: 0,
};

const DEFAULT_INSIGHTS = { components: [], importantFiles: [] };

const DEFAULT_ROUTE_HEALTH = {
  totalApiCalls: 0,
  matchedApiCalls: 0,
  unmatchedApiCalls: 0,
  unmatchedFlows: [],
};

const DEFAULT_STATS = { totalProjects: 0, totalFiles: 0, averageHealth: 0 };

function applyReport(report, setters) {
  const {
    setProjectPath, setFiles, setTotalFiles, setSummary, setInsights,
    setFlows, setRouteHealth, setDuplicateGroups, setFolders, setTechStack,
    setUnusedFiles, setHealthScore, setSecurityAudit,
  } = setters;

  setProjectPath(report.projectPath || report.projectName || "");
  setFiles(report.files || []);
  setTotalFiles(report.totalFiles ?? report.files?.length ?? 0);
  setSummary(report.summary || DEFAULT_SUMMARY);
  setInsights(report.insights || DEFAULT_INSIGHTS);
  setFlows(report.flows || []);
  setRouteHealth(report.routeHealth || DEFAULT_ROUTE_HEALTH);
  setDuplicateGroups(report.duplicateGroups || []);
  setFolders(report.folders || []);
  setTechStack(report.techStack || []);
  setUnusedFiles(report.unusedFiles || []);
  setHealthScore(report.healthScore ?? 100);
  setSecurityAudit(report.securityAudit || []);
}

export function useDashboard() {
  const [projectPath, setProjectPath] = useState("");
  const [projectFile, setProjectFile] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(DEFAULT_STATS);
  const [recentReports, setRecentReports] = useState([]);
  const [files, setFiles] = useState([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [flows, setFlows] = useState([]);
  const [answer, setAnswer] = useState("");
  const [healthScore, setHealthScore] = useState(100);
  const [securityAudit, setSecurityAudit] = useState([]);
  const [unusedFiles, setUnusedFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [techStack, setTechStack] = useState([]);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState("");
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [insights, setInsights] = useState(DEFAULT_INSIGHTS);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [routeHealth, setRouteHealth] = useState(DEFAULT_ROUTE_HEALTH);
  const [duplicateGroups, setDuplicateGroups] = useState([]);

  const reportSetters = {
    setProjectPath, setFiles, setTotalFiles, setSummary, setInsights,
    setFlows, setRouteHealth, setDuplicateGroups, setFolders, setTechStack,
    setUnusedFiles, setHealthScore, setSecurityAudit,
  };

  // ── Derived file categories ──────────────────────────────────────────────

  const apiCallFiles = files.filter(
    (f) => f.analysis?.apiCalls?.length > 0,
  );
  const backendRouteFiles = files.filter(
    (f) => f.analysis?.backendRoutes?.length > 0,
  );
  const modelFiles = files.filter(
    (f) => f.analysis?.models?.length > 0,
  );
  const importFiles = files.filter(
    (f) => f.analysis?.imports?.length > 0,
  );
  const securityWarningFiles = files.filter(
    (f) => f.analysis?.securityWarnings?.length > 0,
  );
  const complexFiles = files.filter(
    (f) => f.analysis?.complexity === "Medium" || f.analysis?.complexity === "High",
  );
  const largeFiles = files.filter(
    (f) => f.analysis?.lines > 200,
  );

  // ── API helpers ──────────────────────────────────────────────────────────

  const getToken = () => localStorage.getItem("devlens_token");

  const loadDashboard = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDashboardStats(data.dashboard?.statistics || DEFAULT_STATS);
        setRecentReports(data.dashboard?.recentReports || []);
      }
    } catch (err) {
      console.error("Could not load dashboard:", err);
    }
  };

  const loadSavedReport = async (reportId) => {
    const token = getToken();
    if (!token) { setMessage("Please login first."); return; }

    try {
      const res = await fetch(`${API_URL}/api/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage(data.message || "Could not load saved report.");
        return;
      }
      applyReport(data.report, reportSetters);
      setMessage(`Loaded saved report: ${data.report.projectName || "Project"}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Load saved report error:", err);
      setMessage("Could not connect to backend.");
    }
  };

  const deleteSavedReport = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this saved report?")) return;

    const token = getToken();
    if (!token) { setMessage("Please login first."); return; }

    try {
      const res = await fetch(`${API_URL}/api/reports/${reportId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage(data.message || "Could not delete report.");
        return;
      }
      await loadDashboard();
      setMessage("Saved report deleted successfully.");
    } catch (err) {
      console.error("Delete report error:", err);
      setMessage("Could not connect to backend.");
    }
  };

  const scanProject = async () => {
    if (!projectFile) { setMessage("Please select a ZIP file first."); return; }

    setLoading(true);
    setMessage("");
    setAnswer("");

    const token = getToken();
    if (!token) {
      setMessage("Please login before scanning a project.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("project", projectFile);

      const res = await fetch(`${API_URL}/api/scan/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage(data.message || "Could not scan project.");
        return;
      }
      applyReport({ ...data.report, projectPath: data.report.projectName || projectFile.name }, reportSetters);
      await loadDashboard();
      setMessage("Project ZIP scanned successfully!");
    } catch (err) {
      console.error("Scan error:", err);
      setMessage("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  // ── Explanation ──────────────────────────────────────────────────────────

  const generateProjectExplanation = () => {
    if (files.length === 0) return "Scan a project first to generate an explanation.";

    const find = (label) => files.find((f) => f.importance === label);
    const reactEntry = find("React entry point");
    const mainApp = find("Main app component");
    const backendEntry = find("Backend entry point");

    const parts = [
      `This project contains ${totalFiles} files.`,
      `It has ${summary.reactComponents} React component(s), ${summary.javascriptFiles} JavaScript file(s), and ${summary.backendFiles} backend file(s).`,
    ];

    if (reactEntry) parts.push(`The React app starts from ${reactEntry.path}.`);
    if (mainApp) parts.push(`The main app component is ${mainApp.path}.`);
    if (backendEntry) parts.push(`The backend entry point is ${backendEntry.path}.`);
    if (apiCallFiles.length > 0) parts.push(`API calls were detected in ${apiCallFiles.length} file(s).`);
    if (backendRouteFiles.length > 0) parts.push(`Backend routes were detected in ${backendRouteFiles.length} file(s).`);
    if (flows.length > 0) {
      const matched = flows.filter((f) => f.matchedRoute).length;
      parts.push(`DevLens matched ${matched} frontend API call(s) to backend route(s).`);
    }

    return parts.join(" ");
  };

  // ── Ask DevLens ──────────────────────────────────────────────────────────

  const handleModalQuestion = async (question) => {
    setAskError("");
    setAskLoading(true);

    try {
      if (files.length === 0) { setAnswer("Please scan a project first."); return; }

      const q = question.toLowerCase();
      const list = (items, label) =>
        items.length === 0
          ? `No ${label} were detected.`
          : `${label.charAt(0).toUpperCase() + label.slice(1)} found:\n\n${items.map((f) => `• ${f.path}`).join("\n")}`;

      if (q.includes("auth") || q.includes("login")) {
        const authFiles = files.filter((f) => {
          const text = `${f.name} ${f.path} ${f.importance}`.toLowerCase();
          return ["auth", "login", "jwt", "token"].some((kw) => text.includes(kw));
        });
        setAnswer(list(authFiles, "authentication-related files"));
      } else if (q.includes("api")) {
        setAnswer(list(apiCallFiles, "API call files"));
      } else if (q.includes("route")) {
        setAnswer(list(backendRouteFiles, "backend route files"));
      } else if (q.includes("component")) {
        setAnswer(list(insights.components, "React components"));
      } else if (q.includes("entry") || q.includes("start")) {
        const entryFiles = files.filter((f) =>
          ["React entry point", "Backend entry point", "Main app component"].includes(f.importance),
        );
        setAnswer(
          entryFiles.length === 0
            ? "I could not identify entry point files yet."
            : `Important entry files:\n\n${entryFiles.map((f) => `• ${f.importance}: ${f.path}`).join("\n")}`,
        );
      } else if (q.includes("tech") || q.includes("stack")) {
        setAnswer(techStack.length === 0 ? "No technologies were detected yet." : `Detected technologies:\n\n• ${techStack.join("\n• ")}`);
      } else if (q.includes("folder") || q.includes("structure")) {
        setAnswer(folders.length === 0 ? "No folders were detected yet." : `Detected folders:\n\n• ${folders.join("\n• ")}`);
      } else if (q.includes("unused")) {
        setAnswer(list(unusedFiles, "unused files"));
      } else if (q.includes("security") || q.includes("warning")) {
        setAnswer(securityWarningFiles.length === 0 && securityAudit.length === 0 ? "No security warnings were detected." : "Security warnings were found in the scanned project.");
      } else if (q.includes("duplicate")) {
        setAnswer(duplicateGroups.length === 0 ? "No possible duplicate files were detected." : `Possible duplicate groups found: ${duplicateGroups.length}`);
      } else if (q.includes("complex")) {
        setAnswer(
          complexFiles.length === 0
            ? "No complex files were detected."
            : `Complex files:\n\n${complexFiles.map((f) => `• ${f.path} — ${f.analysis.complexity}`).join("\n")}`,
        );
      } else if (q.includes("large")) {
        setAnswer(
          largeFiles.length === 0
            ? "No large files were detected."
            : `Large files:\n\n${largeFiles.map((f) => `• ${f.path} — ${f.analysis.lines} lines`).join("\n")}`,
        );
      } else if (q.includes("model") || q.includes("database")) {
        setAnswer(list(modelFiles, "database model files"));
      } else if (q.includes("explain") || q.includes("project")) {
        setAnswer(generateProjectExplanation());
      } else {
        setAnswer("I couldn't find a specific answer from the current scan. Try asking about authentication, APIs, routes, components, database, security, unused files, duplicates, complexity, or project architecture.");
      }
    } catch (err) {
      console.error("Ask DevLens error:", err);
      setAskError("Something went wrong while analyzing your question.");
    } finally {
      setAskLoading(false);
    }
  };

  // ── Download report ──────────────────────────────────────────────────────

  const downloadReport = () => {
    if (files.length === 0) { setMessage("Scan a project before downloading a report."); return; }

    const section = (title, content) => `## ${title}\n\n${content}\n`;
    const fileList = (arr, fn) => arr.length === 0 ? "None." : arr.map(fn).join("\n");

    const report = [
      "# DevLens Project Report",
      section("Scanned Path", projectPath),
      section("Summary", [
        `- Total Files: ${totalFiles}`,
        `- React Components: ${summary.reactComponents}`,
        `- JavaScript Files: ${summary.javascriptFiles}`,
        `- CSS Files: ${summary.cssFiles}`,
        `- JSON Files: ${summary.jsonFiles}`,
        `- Backend Files: ${summary.backendFiles}`,
        `- Other Files: ${summary.otherFiles}`,
        `- Health Score: ${healthScore}%`,
      ].join("\n")),
      section("Project Explanation", generateProjectExplanation()),
      section("API Flows", fileList(flows, (f) =>
        `- ${f.sourcePath}: ${f.client} ${f.method} ${f.url} ${f.matchedRoute ? `matched ${f.matchedRoute.method} ${f.matchedRoute.path}` : "no matching route"}`,
      )),
      section("Backend Routes", fileList(backendRouteFiles, (f) =>
        `- ${f.path}: ${f.analysis.backendRoutes.map((r) => `${r.method} ${r.path}`).join(", ")}`,
      )),
      section("Database Models", fileList(modelFiles, (f) =>
        `- ${f.path}: ${f.analysis.models.join(", ")}`,
      )),
      section("Unused Files", fileList(unusedFiles, (f) => `- ${f.path}`)),
      section("Security Warnings", fileList(securityWarningFiles, (f) =>
        `- ${f.path}: ${(f.analysis?.securityWarnings || []).join(", ")}`,
      )),
    ].join("\n");

    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DevLens_Project_Report.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── File input ───────────────────────────────────────────────────────────

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".zip")) {
      setProjectFile(null);
      setMessage("Please select a valid ZIP file.");
      e.target.value = "";
      return;
    }
    setProjectFile(file);
    setProjectPath(file.name);
    setMessage("");
  };

  return {
    // state
    projectPath, projectFile, dashboardStats, recentReports,
    files, totalFiles, flows, answer, setAnswer,
    healthScore, securityAudit, unusedFiles, folders, techStack,
    isAskModalOpen, setIsAskModalOpen,
    askLoading, askError, setAskError,
    summary, insights, message, loading, routeHealth, duplicateGroups,
    // derived
    apiCallFiles, backendRouteFiles, modelFiles, importFiles,
    securityWarningFiles, complexFiles, largeFiles,
    // handlers
    loadSavedReport, deleteSavedReport, scanProject,
    generateProjectExplanation, handleModalQuestion, downloadReport, handleFileChange,
  };
}
