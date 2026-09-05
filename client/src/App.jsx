import { useState, useContext, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AskDevLensModal from "./components/AskDevLensModal";
import "./App.css";

// Backend API URL
// Local: falls back to http://localhost:5000
// Production: set VITE_API_URL in your hosting environment
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://devlens-backend-lyum.onrender.com";

function DashboardView() {
  const [projectPath, setProjectPath] = useState(
    "C:\\Users\\HP\\Desktop\\DevLens",
  );

  // Dashboard data from backend
  const [dashboardStats, setDashboardStats] = useState({
    totalProjects: 0,
    totalFiles: 0,
    averageHealth: 0,
  });

  const [recentReports, setRecentReports] = useState([]);

  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalFiles, setTotalFiles] = useState(0);
  const [flows, setFlows] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [healthScore, setHealthScore] = useState(100);
  const [securityAudit, setSecurityAudit] = useState([]);
  const [unusedFiles, setUnusedFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [techStack, setTechStack] = useState([]);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState("");

  const [summary, setSummary] = useState({
    reactComponents: 0,
    javascriptFiles: 0,
    cssFiles: 0,
    jsonFiles: 0,
    backendFiles: 0,
    otherFiles: 0,
  });

  const [insights, setInsights] = useState({
    components: [],
    importantFiles: [],
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [routeHealth, setRouteHealth] = useState({
    totalApiCalls: 0,
    matchedApiCalls: 0,
    unmatchedApiCalls: 0,
    unmatchedFlows: [],
  });

  const [duplicateGroups, setDuplicateGroups] = useState([]);

  // ==========================================
  // LOAD DASHBOARD DATA
  // ==========================================

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem("devlens_token");

      if (!token) {
        console.log("No authentication token found.");
        return;
      }

      const response = await fetch(`${API_URL}/api/dashboard`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Dashboard API error:", data.message);
        return;
      }

      if (data.success) {
        setDashboardStats(
          data.dashboard?.statistics || {
            totalProjects: 0,
            totalFiles: 0,
            averageHealth: 0,
          },
        );

        setRecentReports(data.dashboard?.recentReports || []);
      }
    } catch (error) {
      console.error("Could not load dashboard:", error);
    }
  };

  // ==========================================
  // LOAD SAVED REPORT
  // ==========================================

  const loadSavedReport = async (reportId) => {
    try {
      const token = localStorage.getItem("devlens_token");

      if (!token) {
        setMessage("Please login first.");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/reports/${reportId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Could not load saved report.");
        return;
      }

      const report = data.report;

      // Load saved project information into the existing dashboard
      setProjectPath(report.projectPath || "");

      setFiles(report.files || []);

      setTotalFiles(report.totalFiles || report.files?.length || 0);

      setSummary(
        report.summary || {
          reactComponents: 0,
          javascriptFiles: 0,
          cssFiles: 0,
          jsonFiles: 0,
          backendFiles: 0,
          otherFiles: 0,
        },
      );

      setInsights(
        report.insights || {
          components: [],
          importantFiles: [],
        },
      );

      setFlows(report.flows || []);

      setRouteHealth(
        report.routeHealth || {
          totalApiCalls: 0,
          matchedApiCalls: 0,
          unmatchedApiCalls: 0,
          unmatchedFlows: [],
        },
      );

      setDuplicateGroups(report.duplicateGroups || []);

      setFolders(report.folders || []);

      setTechStack(report.techStack || []);

      setUnusedFiles(report.unusedFiles || []);

      setHealthScore(report.healthScore ?? 100);

      setSecurityAudit(report.securityAudit || []);

      setMessage(`Loaded saved report: ${report.projectName || "Project"}`);

      // Scroll to top so user sees the loaded report
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Load saved report error:", error);

      setMessage("Could not connect to backend.");
    }
  };

  // ==========================================
  // DELETE SAVED REPORT
  // ==========================================

  const deleteSavedReport = async (reportId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this saved report?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("devlens_token");

      if (!token) {
        setMessage("Please login first.");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/reports/${reportId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Could not delete report.");
        return;
      }

      // Refresh dashboard and recent reports
      await loadDashboard();

      setMessage("Saved report deleted successfully.");
    } catch (error) {
      console.error("Delete report error:", error);

      setMessage("Could not connect to backend.");
    }
  };
  // Load dashboard when component opens
  useEffect(() => {
    loadDashboard();
  }, []);

  // ==========================================
  // SCAN PROJECT
  // ==========================================

  const scanProject = async () => {
    setLoading(true);
    setMessage("");
    setAnswer("");

    try {
      const token = localStorage.getItem("devlens_token");

      if (!token) {
        setMessage("Please login before scanning a project.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/scan`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          projectPath,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const report = data.report || data;

        setFiles(report.files || []);

        setTotalFiles(report.totalFiles || report.files?.length || 0);

        setSummary(
          report.summary || {
            reactComponents: 0,
            javascriptFiles: 0,
            cssFiles: 0,
            jsonFiles: 0,
            backendFiles: 0,
            otherFiles: 0,
          },
        );

        setInsights(
          report.insights || {
            components: [],
            importantFiles: [],
          },
        );

        setFlows(report.flows || []);

        setRouteHealth(
          report.routeHealth || {
            totalApiCalls: 0,
            matchedApiCalls: 0,
            unmatchedApiCalls: 0,
            unmatchedFlows: [],
          },
        );

        setDuplicateGroups(report.duplicateGroups || []);

        setFolders(report.folders || []);

        setTechStack(report.techStack || []);

        setUnusedFiles(report.unusedFiles || []);

        setHealthScore(report.healthScore ?? 100);

        setSecurityAudit(report.securityAudit || []);

        // Refresh dashboard statistics
        await loadDashboard();

        setMessage("Project scanned successfully");
      } else {
        setMessage(data.message || "Scan failed.");
      }
    } catch (error) {
      console.error("Scan error:", error);

      setMessage("Could not connect to backend.");
    }

    setLoading(false);
  };

  // ==========================================
  // FILTER FILES
  // ==========================================

  const filteredFiles = files.filter((file) => {
    const search = searchTerm.toLowerCase();

    return (
      (file.name || "").toLowerCase().includes(search) ||
      (file.path || "").toLowerCase().includes(search) ||
      (file.type || "").toLowerCase().includes(search) ||
      (file.importance || "").toLowerCase().includes(search)
    );
  });

  // ==========================================
  // FILE CATEGORIES
  // ==========================================

  const apiCallFiles = files.filter((file) => {
    return (
      file.analysis &&
      Array.isArray(file.analysis.apiCalls) &&
      file.analysis.apiCalls.length > 0
    );
  });

  const backendRouteFiles = files.filter((file) => {
    return (
      file.analysis &&
      Array.isArray(file.analysis.backendRoutes) &&
      file.analysis.backendRoutes.length > 0
    );
  });

  const modelFiles = files.filter((file) => {
    return (
      file.analysis &&
      Array.isArray(file.analysis.models) &&
      file.analysis.models.length > 0
    );
  });

  const importFiles = files.filter((file) => {
    return (
      file.analysis &&
      Array.isArray(file.analysis.imports) &&
      file.analysis.imports.length > 0
    );
  });

  const securityWarningFiles = files.filter((file) => {
    return (
      file.analysis &&
      Array.isArray(file.analysis.securityWarnings) &&
      file.analysis.securityWarnings.length > 0
    );
  });

  const complexFiles = files.filter((file) => {
    return (
      file.analysis &&
      (file.analysis.complexity === "Medium" ||
        file.analysis.complexity === "High")
    );
  });

  const largeFiles = files.filter((file) => {
    return file.analysis && file.analysis.lines > 200;
  });

  // ==========================================
  // PROJECT EXPLANATION
  // ==========================================

  const generateProjectExplanation = () => {
    if (files.length === 0) {
      return "Scan a project first to generate an explanation.";
    }

    const mainAppFile = files.find(
      (file) => file.importance === "Main app component",
    );

    const reactEntryFile = files.find(
      (file) => file.importance === "React entry point",
    );

    const backendEntryFile = files.find(
      (file) => file.importance === "Backend entry point",
    );

    const explanationParts = [
      `This project contains ${totalFiles} files.`,

      `It has ${summary.reactComponents} React component(s), ${summary.javascriptFiles} JavaScript file(s), and ${summary.backendFiles} backend file(s).`,
    ];

    if (reactEntryFile) {
      explanationParts.push(
        `The React app starts from ${reactEntryFile.path}.`,
      );
    }

    if (mainAppFile) {
      explanationParts.push(`The main app component is ${mainAppFile.path}.`);
    }

    if (backendEntryFile) {
      explanationParts.push(
        `The backend entry point is ${backendEntryFile.path}.`,
      );
    }

    if (apiCallFiles.length > 0) {
      explanationParts.push(
        `API calls were detected in ${apiCallFiles.length} file(s).`,
      );
    }

    if (backendRouteFiles.length > 0) {
      explanationParts.push(
        `Backend routes were detected in ${backendRouteFiles.length} file(s).`,
      );
    }

    if (flows.length > 0) {
      const matchedFlows = flows.filter((flow) => flow.matchedRoute).length;

      explanationParts.push(
        `DevLens matched ${matchedFlows} frontend API call(s) to backend route(s).`,
      );
    }

    return explanationParts.join(" ");
  };

  // ==========================================
  // ASK DEV LENS
  // ==========================================

  // const askDevLens = () => {
  //   const lowerQuestion =
  //     question.toLowerCase();

  //   if (files.length === 0) {
  //     setAnswer(
  //       "Please scan a project first."
  //     );
  //     return;
  //   }

  //   if (
  //     lowerQuestion.includes("auth") ||
  //     lowerQuestion.includes("login")
  //   ) {
  //     const authFiles = files.filter(
  //       (file) => {
  //         const text =
  //           `${file.name || ""} ${
  //             file.path || ""
  //           } ${
  //             file.importance || ""
  //           }`.toLowerCase();

  //         return (
  //           text.includes("auth") ||
  //           text.includes("login") ||
  //           text.includes("jwt") ||
  //           text.includes("token")
  //         );
  //       }
  //     );

  //     setAnswer(
  //       authFiles.length === 0
  //         ? "I could not find obvious authentication files yet."
  //         : `Authentication-related files found: ${authFiles
  //             .map((file) => file.path)
  //             .join(", ")}`
  //     );

  //     return;
  //   }

  //   if (lowerQuestion.includes("api")) {
  //     setAnswer(
  //       apiCallFiles.length === 0
  //         ? "No frontend API calls were detected."
  //         : `API calls were found in: ${apiCallFiles
  //             .map((file) => file.path)
  //             .join(", ")}`
  //     );

  //     return;
  //   }

  //   if (lowerQuestion.includes("route")) {
  //     setAnswer(
  //       backendRouteFiles.length === 0
  //         ? "No backend routes were detected."
  //         : `Backend routes were found in: ${backendRouteFiles
  //             .map((file) => file.path)
  //             .join(", ")}`
  //     );

  //     return;
  //   }

  //   if (
  //     lowerQuestion.includes("component")
  //   ) {
  //     setAnswer(
  //       insights.components.length === 0
  //         ? "No React components were detected."
  //         : `React components found: ${insights.components
  //             .map((file) => file.path)
  //             .join(", ")}`
  //     );

  //     return;
  //   }

  //   if (
  //     lowerQuestion.includes("entry") ||
  //     lowerQuestion.includes("start")
  //   ) {
  //     const entryFiles = files.filter(
  //       (file) =>
  //         [
  //           "React entry point",
  //           "Backend entry point",
  //           "Main app component",
  //         ].includes(file.importance)
  //     );

  //     setAnswer(
  //       entryFiles.length === 0
  //         ? "I could not identify entry point files yet."
  //         : `Important entry files: ${entryFiles
  //             .map(
  //               (file) =>
  //                 `${file.importance}: ${file.path}`
  //             )
  //             .join(", ")}`
  //     );

  //     return;
  //   }

  //   if (
  //     lowerQuestion.includes("tech") ||
  //     lowerQuestion.includes("stack")
  //   ) {
  //     setAnswer(
  //       techStack.length === 0
  //         ? "No technologies were detected yet."
  //         : `Detected technologies: ${techStack.join(
  //             ", "
  //           )}`
  //     );

  //     return;
  //   }

  //   if (
  //     lowerQuestion.includes("folder") ||
  //     lowerQuestion.includes("structure")
  //   ) {
  //     setAnswer(
  //       folders.length === 0
  //         ? "No folders were detected yet."
  //         : `Detected folders: ${folders.join(
  //             ", "
  //           )}`
  //     );

  //     return;
  //   }

  //   if (
  //     lowerQuestion.includes("unused")
  //   ) {
  //     setAnswer(
  //       unusedFiles.length === 0
  //         ? "No unused files were detected."
  //         : `Unused files: ${unusedFiles
  //             .map((file) => file.path)
  //             .join(", ")}`
  //     );

  //     return;
  //   }

  //   if (
  //     lowerQuestion.includes("security") ||
  //     lowerQuestion.includes("warning")
  //   ) {
  //     setAnswer(
  //       securityWarningFiles.length === 0 &&
  //         securityAudit.length === 0
  //         ? "No security warnings were detected."
  //         : `Security warnings found: ${
  //             securityWarningFiles
  //               .map(
  //                 (file) =>
  //                   `${file.path}: ${(
  //                     file.analysis
  //                       ?.securityWarnings ||
  //                     []
  //                   ).join(", ")}`
  //               )
  //               .join(", ") ||
  //             securityAudit
  //               .map(
  //                 (item) =>
  //                   `${item.path}: ${item.warning}`
  //               )
  //               .join(", ")
  //           }`
  //     );

  //     return;
  //   }

  //   if (
  //     lowerQuestion.includes("duplicate")
  //   ) {
  //     setAnswer(
  //       duplicateGroups.length === 0
  //         ? "No possible duplicate files were detected."
  //         : `Possible duplicate groups found: ${duplicateGroups.length}`
  //     );

  //     return;
  //   }

  //   if (
  //     lowerQuestion.includes("complex")
  //   ) {
  //     setAnswer(
  //       complexFiles.length === 0
  //         ? "No complex files were detected."
  //         : `Complex files: ${complexFiles
  //             .map(
  //               (file) =>
  //                 `${file.path} (${file.analysis.complexity})`
  //             )
  //             .join(", ")}`
  //     );

  //     return;
  //   }

  //   if (
  //     lowerQuestion.includes("large")
  //   ) {
  //     setAnswer(
  //       largeFiles.length === 0
  //         ? "No large files were detected."
  //         : `Large files: ${largeFiles
  //             .map(
  //               (file) =>
  //                 `${file.path} (${file.analysis.lines} lines)`
  //             )
  //             .join(", ")}`
  //     );

  //     return;
  //   }

  //   if (
  //     lowerQuestion.includes("model") ||
  //     lowerQuestion.includes("database")
  //   ) {
  //     setAnswer(
  //       modelFiles.length === 0
  //         ? "No database models were detected."
  //         : `Database models found in: ${modelFiles
  //             .map((file) => file.path)
  //             .join(", ")}`
  //     );

  //     return;
  //   }

  //   setAnswer(
  //     "I can currently answer about authentication, API calls, routes, components, entry points, tech stack, folders, unused files, security, duplicates, complexity, large files, and database models."
  //   );
  // };

  const handleModalQuestion = async (selectedQuestion) => {
    setQuestion(selectedQuestion);
    setAskError("");
    setAskLoading(true);

    try {
      const lowerQuestion = selectedQuestion.toLowerCase();

      if (files.length === 0) {
        setAnswer("Please scan a project first.");
        return;
      }

      // ------------------------------------------
      // AUTHENTICATION
      // ------------------------------------------

      if (lowerQuestion.includes("auth") || lowerQuestion.includes("login")) {
        const authFiles = files.filter((file) => {
          const text = `${file.name || ""} ${file.path || ""} ${
            file.importance || ""
          }`.toLowerCase();

          return (
            text.includes("auth") ||
            text.includes("login") ||
            text.includes("jwt") ||
            text.includes("token")
          );
        });

        setAnswer(
          authFiles.length === 0
            ? "I could not find obvious authentication files yet."
            : `Authentication-related files found:\n\n${authFiles
                .map((file) => `• ${file.path}`)
                .join("\n")}`,
        );

        return;
      }

      // ------------------------------------------
      // API
      // ------------------------------------------

      if (lowerQuestion.includes("api")) {
        setAnswer(
          apiCallFiles.length === 0
            ? "No frontend API calls were detected."
            : `API calls were found in:\n\n${apiCallFiles
                .map((file) => `• ${file.path}`)
                .join("\n")}`,
        );

        return;
      }

      // ------------------------------------------
      // ROUTES
      // ------------------------------------------

      if (lowerQuestion.includes("route")) {
        setAnswer(
          backendRouteFiles.length === 0
            ? "No backend routes were detected."
            : `Backend routes were found in:\n\n${backendRouteFiles
                .map((file) => `• ${file.path}`)
                .join("\n")}`,
        );

        return;
      }

      // ------------------------------------------
      // COMPONENTS
      // ------------------------------------------

      if (lowerQuestion.includes("component")) {
        setAnswer(
          insights.components.length === 0
            ? "No React components were detected."
            : `React components found:\n\n${insights.components
                .map((file) => `• ${file.path}`)
                .join("\n")}`,
        );

        return;
      }

      // ------------------------------------------
      // ENTRY POINT
      // ------------------------------------------

      if (lowerQuestion.includes("entry") || lowerQuestion.includes("start")) {
        const entryFiles = files.filter((file) =>
          [
            "React entry point",
            "Backend entry point",
            "Main app component",
          ].includes(file.importance),
        );

        setAnswer(
          entryFiles.length === 0
            ? "I could not identify entry point files yet."
            : `Important entry files:\n\n${entryFiles
                .map((file) => `• ${file.importance}: ${file.path}`)
                .join("\n")}`,
        );

        return;
      }

      // ------------------------------------------
      // TECH STACK
      // ------------------------------------------

      if (lowerQuestion.includes("tech") || lowerQuestion.includes("stack")) {
        setAnswer(
          techStack.length === 0
            ? "No technologies were detected yet."
            : `Detected technologies:\n\n• ${techStack.join("\n• ")}`,
        );

        return;
      }

      // ------------------------------------------
      // FOLDERS / STRUCTURE
      // ------------------------------------------

      if (
        lowerQuestion.includes("folder") ||
        lowerQuestion.includes("structure")
      ) {
        setAnswer(
          folders.length === 0
            ? "No folders were detected yet."
            : `Detected folders:\n\n• ${folders.join("\n• ")}`,
        );

        return;
      }

      // ------------------------------------------
      // UNUSED FILES
      // ------------------------------------------

      if (lowerQuestion.includes("unused")) {
        setAnswer(
          unusedFiles.length === 0
            ? "No unused files were detected."
            : `Unused files:\n\n${unusedFiles
                .map((file) => `• ${file.path}`)
                .join("\n")}`,
        );

        return;
      }

      // ------------------------------------------
      // SECURITY
      // ------------------------------------------

      if (
        lowerQuestion.includes("security") ||
        lowerQuestion.includes("warning")
      ) {
        setAnswer(
          securityWarningFiles.length === 0 && securityAudit.length === 0
            ? "No security warnings were detected."
            : "Security warnings were found in the scanned project.",
        );

        return;
      }

      // ------------------------------------------
      // DUPLICATES
      // ------------------------------------------

      if (lowerQuestion.includes("duplicate")) {
        setAnswer(
          duplicateGroups.length === 0
            ? "No possible duplicate files were detected."
            : `Possible duplicate groups found: ${duplicateGroups.length}`,
        );

        return;
      }

      // ------------------------------------------
      // COMPLEXITY
      // ------------------------------------------

      if (lowerQuestion.includes("complex")) {
        setAnswer(
          complexFiles.length === 0
            ? "No complex files were detected."
            : `Complex files:\n\n${complexFiles
                .map((file) => `• ${file.path} — ${file.analysis.complexity}`)
                .join("\n")}`,
        );

        return;
      }

      // ------------------------------------------
      // LARGE FILES
      // ------------------------------------------

      if (lowerQuestion.includes("large")) {
        setAnswer(
          largeFiles.length === 0
            ? "No large files were detected."
            : `Large files:\n\n${largeFiles
                .map((file) => `• ${file.path} — ${file.analysis.lines} lines`)
                .join("\n")}`,
        );

        return;
      }

      // ------------------------------------------
      // DATABASE / MODELS
      // ------------------------------------------

      if (
        lowerQuestion.includes("model") ||
        lowerQuestion.includes("database")
      ) {
        setAnswer(
          modelFiles.length === 0
            ? "No database models were detected."
            : `Database models found in:\n\n${modelFiles
                .map((file) => `• ${file.path}`)
                .join("\n")}`,
        );

        return;
      }

      // ------------------------------------------
      // PROJECT EXPLANATION
      // ------------------------------------------

      if (
        lowerQuestion.includes("explain") ||
        lowerQuestion.includes("project")
      ) {
        setAnswer(generateProjectExplanation());

        return;
      }

      // ------------------------------------------
      // DEFAULT
      // ------------------------------------------

      setAnswer(
        "I couldn't find a specific answer from the current scan. Try asking about authentication, APIs, routes, components, database, security, unused files, duplicates, complexity, or project architecture.",
      );
    } catch (error) {
      console.error("Ask DevLens error:", error);

      setAskError("Something went wrong while analyzing your question.");
    } finally {
      setAskLoading(false);
    }
  };
  // ==========================================
  // DOWNLOAD REPORT
  // ==========================================

  const downloadReport = () => {
    if (files.length === 0) {
      setMessage("Scan a project before downloading a report.");
      return;
    }

    const report = `
# DevLens Project Report

## Scanned Path
${projectPath}

## Summary

- Total Files: ${totalFiles}
- React Components: ${summary.reactComponents}
- JavaScript Files: ${summary.javascriptFiles}
- CSS Files: ${summary.cssFiles}
- JSON Files: ${summary.jsonFiles}
- Backend Files: ${summary.backendFiles}
- Other Files: ${summary.otherFiles}
- Health Score: ${healthScore}%

## Project Explanation

${generateProjectExplanation()}

## API Flows

${
  flows.length === 0
    ? "No API flows found."
    : flows
        .map((flow) => {
          return `- ${flow.sourcePath}: ${flow.client} ${flow.method} ${flow.url} ${
            flow.matchedRoute
              ? `matched ${flow.matchedRoute.method} ${flow.matchedRoute.path}`
              : "no matching route"
          }`;
        })
        .join("\n")
}

## Backend Routes

${
  backendRouteFiles.length === 0
    ? "No backend routes found."
    : backendRouteFiles
        .map((file) => {
          return `- ${file.path}: ${file.analysis.backendRoutes
            .map((route) => `${route.method} ${route.path}`)
            .join(", ")}`;
        })
        .join("\n")
}

## Database Models

${
  modelFiles.length === 0
    ? "No database models found."
    : modelFiles
        .map((file) => `- ${file.path}: ${file.analysis.models.join(", ")}`)
        .join("\n")
}

## Unused Files

${
  unusedFiles.length === 0
    ? "No unused code files detected."
    : unusedFiles.map((file) => `- ${file.path}`).join("\n")
}

## Security Warnings

${
  securityWarningFiles.length === 0
    ? "No security warnings found."
    : securityWarningFiles
        .map((file) => {
          return `- ${file.path}: ${(
            file.analysis?.securityWarnings || []
          ).join(", ")}`;
        })
        .join("\n")
}
`;

    const blob = new Blob([report], { type: "text/markdown" });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "DevLens_Project_Report.md";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <main className="main">
      {/* DASHBOARD OVERVIEW */}

      <section className="dashboard-stats-card">
        <h2>Dashboard Overview</h2>

        <div className="dashboard-stats-grid">
          <div>
            <span>{dashboardStats.totalProjects}</span>

            <p>Total Projects</p>
          </div>

          <div>
            <span>{dashboardStats.totalFiles}</span>

            <p>Total Files</p>
          </div>

          <div>
            <span>{dashboardStats.averageHealth}%</span>

            <p>Average Health</p>
          </div>
        </div>
      </section>

      {/* RECENT REPORTS */}

      <section className="recent-reports-card">
        <div className="section-header">
          <div>
            <h2>Recent Scans</h2>

            <p>Your recently saved project analysis reports</p>
          </div>
        </div>

        {recentReports.length === 0 ? (
          <div className="empty-reports">
            <p>No saved scans yet.</p>

            <small>Scan a project and your report will appear here.</small>
          </div>
        ) : (
          <div className="reports-list">
            {recentReports.map((report) => (
              <div className="report-item" key={report._id}>
                <div className="report-info">
                  <strong>{report.projectName || "Unnamed Project"}</strong>

                  <small>{report.totalFiles || 0} files</small>

                  {report.createdAt && (
                    <small>{new Date(report.createdAt).toLocaleString()}</small>
                  )}
                </div>

                <div className="report-health">
                  <span>{report.healthScore ?? 0}%</span>

                  <small>Health</small>
                </div>

                <div className="report-actions">
                  <button
                    type="button"
                    onClick={() => loadSavedReport(report._id)}
                  >
                    View Report
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteSavedReport(report._id)}
                    className="delete-report-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      {/* SCANNER */}

      <section className="scanner-card">
        <h2>Scan Project</h2>

        <label>Project Path</label>

        <input
          type="text"
          value={projectPath}
          onChange={(event) => setProjectPath(event.target.value)}
          placeholder="Enter project folder path"
        />

        <button onClick={scanProject} disabled={loading}>
          {loading ? "Scanning..." : "Scan Project"}
        </button>

        {message && <p className="message">{message}</p>}

        <button className="download-button" onClick={downloadReport}>
          Download Project Report (.md)
        </button>
      </section>

      {/* PROJECT SUMMARY */}

      <section className="summary-card">
        <h2>Project Summary</h2>

        <div className="summary-grid">
          <div>
            <span>{totalFiles}</span>
            <p>Total Files</p>
          </div>

          <div>
            <span>{summary.reactComponents}</span>
            <p>React Components</p>
          </div>

          <div>
            <span>{summary.javascriptFiles}</span>
            <p>JavaScript Files</p>
          </div>

          <div>
            <span>{summary.cssFiles}</span>
            <p>CSS Files</p>
          </div>

          <div>
            <span>{summary.jsonFiles}</span>
            <p>JSON Files</p>
          </div>

          <div>
            <span>{summary.backendFiles}</span>
            <p>Backend Files</p>
          </div>

          <div>
            <span>{summary.otherFiles}</span>
            <p>Other Files</p>
          </div>
        </div>
      </section>

      {/* TECHNOLOGY STACK */}

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

      {/* HEALTH */}

      <section className="health-card">
        <h2>Codebase Health & Security Audit</h2>

        <div className="health-badge">
          <span className="health-score">{healthScore}%</span>

          <p>Code Health Rating</p>
        </div>

        {securityAudit.length === 0 ? (
          <p className="clean-audit">
            No security warnings or missing .env issues detected.
          </p>
        ) : (
          <ul className="security-list">
            {securityAudit.map((item, index) => (
              <li key={index} className="security-item">
                <strong>{item.file}</strong> ({item.path}):{" "}
                <span>{item.warning}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* INSIGHTS */}

      <section className="insights-card">
        <h2>Project Insights</h2>

        <div className="insights-grid">
          <div>
            <h3>React Components</h3>

            {insights.components.length === 0 ? (
              <p>No React components found.</p>
            ) : (
              <ul>
                {insights.components.map((component, index) => (
                  <li key={index}>
                    <span>{component.name}</span>

                    <small>{component.path}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3>Important Files</h3>

            {insights.importantFiles.length === 0 ? (
              <p>No important files found.</p>
            ) : (
              <ul>
                {insights.importantFiles.map((file, index) => (
                  <li key={index}>
                    <span>{file.name}</span>

                    <small>{file.importance}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* PROJECT EXPLANATION */}

      <section className="explanation-card">
        <h2>Project Explanation</h2>

        <p>{generateProjectExplanation()}</p>
      </section>

      {/* ASK DEVLENS */}

      <section className="assistant-card">
        <h2>Ask DevLens</h2>

        <p className="assistant-description">
          Understand your codebase with DevLens. Ask about architecture,
          authentication, APIs, database, security and code quality.
        </p>

        <button
          type="button"
          onClick={() => {
            setAnswer("");
            setAskError("");
            setIsAskModalOpen(true);
          }}
        >
          ✦ Ask DevLens
        </button>

        {answer && <div className="answer">{answer}</div>}
      </section>
      {/* API CALLS */}

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

      {/* BACKEND ROUTES */}

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

      {/* API FLOW MAP */}

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

      {/* ROUTE HEALTH */}

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

      {/* IMPORT MAP */}

      <section className="imports-card">
        <h2>Import Map</h2>

        {importFiles.length === 0 ? (
          <p>No imports found yet.</p>
        ) : (
          <ul>
            {importFiles.map((file, index) => (
              <li key={index}>
                <span>{file.name}</span>

                <small>{file.path}</small>

                <div className="import-list">
                  {(file.analysis?.imports || []).map(
                    (importPath, importIndex) => (
                      <code key={importIndex}>
                        imports {"->"} {importPath}
                      </code>
                    ),
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* DATABASE MODELS */}

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

      {/* UNUSED FILES */}

      <section className="unused-card">
        <h2>Unused File Detector</h2>

        {unusedFiles.length === 0 ? (
          <p>No unused code files detected.</p>
        ) : (
          <ul>
            {unusedFiles.map((file, index) => (
              <li key={index}>
                <span>{file.name}</span>

                <small>{file.path}</small>

                <code>Not imported anywhere</code>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* SECURITY WARNINGS */}

      <section className="security-card">
        <h2>Security Warnings</h2>

        {securityWarningFiles.length === 0 ? (
          <p>No security warnings found.</p>
        ) : (
          <ul>
            {securityWarningFiles.map((file, index) => (
              <li key={index}>
                <span>{file.name}</span>

                <small>{file.path}</small>

                <div className="security-warning-list">
                  {(file.analysis?.securityWarnings || []).map(
                    (warning, warningIndex) => (
                      <code key={warningIndex}>
                        Warning {"->"} {warning}
                      </code>
                    ),
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* DUPLICATES */}

      <section className="duplicates-card">
        <h2>Duplicate File Detector</h2>

        {duplicateGroups.length === 0 ? (
          <p>No possible duplicate files detected.</p>
        ) : (
          <ul>
            {duplicateGroups.map((group, groupIndex) => (
              <li key={groupIndex}>
                <span>Possible duplicate group {groupIndex + 1}</span>

                <div className="duplicate-list">
                  {group.map((file, fileIndex) => (
                    <code key={fileIndex}>{file.path}</code>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* FOLDERS */}

      <section className="folders-card">
        <h2>Folder Structure</h2>

        {folders.length === 0 ? (
          <p>No folders found yet.</p>
        ) : (
          <ul>
            {folders.map((folder, index) => (
              <li key={index}>
                <code>{folder}/</code>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* COMPLEXITY */}

      <section className="complexity-card">
        <h2>Complexity Detector</h2>

        {complexFiles.length === 0 ? (
          <p>No complex files detected.</p>
        ) : (
          <ul>
            {complexFiles.map((file, index) => (
              <li key={index}>
                <span>{file.name}</span>

                <small>{file.path}</small>

                <div className="complexity-list">
                  <code>Lines: {file.analysis.lines}</code>

                  <code>Functions: {file.analysis.functionCount}</code>

                  <code>Complexity: {file.analysis.complexity}</code>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* LARGE FILES */}

      <section className="large-files-card">
        <h2>Large File Detector</h2>

        {largeFiles.length === 0 ? (
          <p>No large files detected.</p>
        ) : (
          <ul>
            {largeFiles.map((file, index) => (
              <li key={index}>
                <span>{file.name}</span>

                <small>{file.path}</small>

                <code>{file.analysis.lines} lines</code>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ALL FILES */}

      <section className="files-card">
        <h2>Files</h2>

        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search files, routes, controllers..."
        />

        {files.length === 0 ? (
          <p>No files scanned yet.</p>
        ) : filteredFiles.length === 0 ? (
          <p>No matching files found.</p>
        ) : (
          <ul>
            {filteredFiles.map((file, index) => (
              <li key={index}>
                <div className="file-row">
                  <div>
                    <span>{file.name}</span>

                    <small>{file.path}</small>
                  </div>

                  <div className="file-tags">
                    <strong>{file.type}</strong>

                    {file.importance !== "Normal file" && (
                      <strong className="important-tag">
                        {file.importance}
                      </strong>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AskDevLensModal
        isOpen={isAskModalOpen}
        onClose={() => {
          setIsAskModalOpen(false);
          setAskError("");
        }}
        onAsk={handleModalQuestion}
        onClearAnswer={() => {
          setAnswer("");
          setAskError("");
        }}
        answer={answer}
        loading={askLoading}
        error={askError}
      />
    </main>
  );
}

// ==========================================
// APP
// ==========================================

function App() {
  const { user, logout } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>DevLens</h1>

          <p>AI Project Understanding Platform</p>
        </div>

        {user && (
          <div className="user-profile-header">
            <span>
              Welcome, <strong>{user.name}</strong>
            </span>

            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        )}
      </header>

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardView />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
