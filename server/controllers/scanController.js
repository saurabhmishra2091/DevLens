const fs = require("fs");
const path = require("path");
const ScanReport = require("../models/ScanReport");
const scanProject = require("../utils/scanProject");
const AdmZip = require("adm-zip");

const ENTRY_POINTS = [
  "index.js",
  "index.ts",
  "main.jsx",
  "main.tsx",
  "App.jsx",
  "App.tsx",
  "index.html",
  "package.json",
  "vite.config.js",
];

const EMPTY_ROUTE_HEALTH = {
  totalApiCalls: 0,
  matchedApiCalls: 0,
  unmatchedApiCalls: 0,
  unmatchedFlows: [],
};

function getProjectName(projectPath, projectName) {
  return projectName || path.basename(projectPath) || "Untitled Project";
}

function normalizePath(filePath) {
  return filePath.replaceAll("\\", "/");
}

function getFolders(files) {
  return [
    ...new Set(
      files
        .map((file) => {
          const parts = normalizePath(file.path).split("/");
          parts.pop();
          return parts.join("/");
        })
        .filter(Boolean)
    ),
  ];
}

function readPackageJson(projectPath, relativePath) {
  try {
    const fullPath = path.join(projectPath, relativePath);
    const content = fs.readFileSync(fullPath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

function detectTechStack(projectPath, files) {
  const packageFiles = files.filter((file) => file.name === "package.json");
  const allDependencies = {};

  packageFiles.forEach((file) => {
    const packageData = readPackageJson(projectPath, file.path);

    if (!packageData) {
      return;
    }

    Object.assign(
      allDependencies,
      packageData.dependencies || {},
      packageData.devDependencies || {}
    );
  });

  const dependencyNames = Object.keys(allDependencies);
  const techStack = [];

  if (dependencyNames.includes("react")) techStack.push("React");
  if (dependencyNames.includes("vite")) techStack.push("Vite");
  if (dependencyNames.includes("express")) techStack.push("Express");
  if (dependencyNames.includes("mongoose")) techStack.push("MongoDB / Mongoose");
  if (dependencyNames.includes("mongodb")) techStack.push("MongoDB Driver");
  if (dependencyNames.includes("cors")) techStack.push("CORS");
  if (dependencyNames.includes("dotenv")) techStack.push("Dotenv");
  if (dependencyNames.includes("axios")) techStack.push("Axios");
  if (dependencyNames.includes("react-router-dom")) techStack.push("React Router");
  if (dependencyNames.includes("bcrypt") || dependencyNames.includes("bcryptjs")) {
    techStack.push("Bcrypt");
  }
  if (dependencyNames.includes("jsonwebtoken")) techStack.push("JWT");
  if (dependencyNames.includes("cookie-parser")) techStack.push("Cookie Parser");
  if (dependencyNames.includes("nodemon")) techStack.push("Nodemon");

  return [...new Set(techStack)];
}

function getSummary(files) {
  return {
    reactComponents: files.filter((file) => file.type === "React Component").length,
    javascriptFiles: files.filter((file) => file.type === "JavaScript File").length,
    cssFiles: files.filter((file) => file.type === "CSS File").length,
    jsonFiles: files.filter((file) => file.type === "JSON File").length,
    backendFiles: files.filter((file) => file.type === "Backend File").length,
    otherFiles: files.filter((file) => file.type === "Other File").length,
  };
}

function getInsights(files) {
  return {
    components: files.filter((file) => file.type === "React Component"),
    importantFiles: files.filter((file) => file.importance !== "Normal file"),
  };
}

function getApiCalls(files) {
  return files.flatMap((file) => {
    if (!file.analysis) return [];

    return file.analysis.apiCalls.map((apiCall) => ({
      sourceFile: file.name,
      sourcePath: file.path,
      client: apiCall.client,
      method: apiCall.method,
      url: apiCall.url,
    }));
  });
}

function getBackendRoutes(files) {
  return files.flatMap((file) => {
    if (!file.analysis) return [];

    return file.analysis.backendRoutes.map((route) => ({
      routeFile: file.name,
      routePath: file.path,
      method: route.method,
      path: route.path,
    }));
  });
}

function getSecurityAudit(files) {
  const securityAudit = files.flatMap((file) => {
    if (!file.analysis || !file.analysis.securityWarnings) return [];

    return file.analysis.securityWarnings.map((warning) => ({
      file: file.name,
      path: file.path,
      warning,
    }));
  });

  const hasEnvFile = files.some((file) => file.name.toLowerCase() === ".env");

  if (!hasEnvFile) {
    securityAudit.push({
      file: "Project Root",
      path: ".env",
      warning: "Missing .env file for environment variables",
    });
  }

  return { securityAudit, hasEnvFile };
}

function getFlows(apiCalls, backendRoutes) {
  return apiCalls.map((apiCall) => {
    const matchedRoute = backendRoutes.find((route) => {
      const samePath = apiCall.url.includes(route.path);
      const sameMethod =
        apiCall.method === "UNKNOWN" || apiCall.method === route.method;

      return samePath && sameMethod;
    });

    return {
      ...apiCall,
      matchedRoute: matchedRoute || null,
    };
  });
}

function getRouteHealth(flows) {
  if (flows.length === 0) {
    return EMPTY_ROUTE_HEALTH;
  }

  const unmatchedFlows = flows.filter((flow) => !flow.matchedRoute);

  return {
    totalApiCalls: flows.length,
    matchedApiCalls: flows.length - unmatchedFlows.length,
    unmatchedApiCalls: unmatchedFlows.length,
    unmatchedFlows,
  };
}

function getDuplicateGroups(files) {
  const nameGroups = {};

  files.forEach((file) => {
    const simpleName = file.name
      .replace(/\.(jsx|tsx|js|ts|css|json)$/i, "")
      .replace(/primary|main|old|new|copy|component/gi, "")
      .toLowerCase();

    if (!nameGroups[simpleName]) {
      nameGroups[simpleName] = [];
    }

    nameGroups[simpleName].push(file);
  });

  return Object.values(nameGroups).filter((group) => group.length > 1);
}

function normalizeImportPath(importPath) {
  if (!importPath.startsWith(".")) {
    return null;
  }

  return normalizePath(importPath)
    .replace(/^(\.\/|\.\.\/)+/g, "")
    .replace(/\.(js|jsx|ts|tsx)$/i, "");
}

function getUnusedFiles(files) {
  const importedSources = files
    .flatMap((file) => {
      if (!file.analysis || !file.analysis.imports) {
        return [];
      }

      return file.analysis.imports;
    })
    .map(normalizeImportPath)
    .filter(Boolean);

  return files.filter((file) => {
    const isCodeFile = [".js", ".jsx", ".ts", ".tsx"].includes(file.extension);
    const isEntryFile = [
      "React entry point",
      "Backend entry point",
      "Main app component",
    ].includes(file.importance);

    if (!isCodeFile || isEntryFile) {
      return false;
    }

    const normalizedFilePath = normalizePath(file.path);
    const filePathWithoutExtension = normalizedFilePath.replace(
      /\.(js|jsx|ts|tsx)$/i,
      ""
    );

    const isImported = importedSources.some((importPath) => {
      return (
        filePathWithoutExtension.endsWith(importPath) ||
        normalizedFilePath.includes(`${importPath}.js`) ||
        normalizedFilePath.includes(`${importPath}.jsx`) ||
        normalizedFilePath.includes(`${importPath}.ts`) ||
        normalizedFilePath.includes(`${importPath}.tsx`)
      );
    });

    return !isImported;
  });
}

function getHealthScore(securityAudit, unusedFiles, hasEnvFile) {
  let healthScore = 100;
  healthScore -= securityAudit.length * 10;
  healthScore -= unusedFiles.length * 5;
  if (!hasEnvFile) healthScore -= 10;

  return Math.max(healthScore, 0);
}

function buildScanReport(projectPath, projectName) {
  const rawFiles = scanProject(projectPath);
  const folders = getFolders(rawFiles);
  const techStack = detectTechStack(projectPath, rawFiles);
  const filesWithDefaultFlags = rawFiles.map((file) => {
    const isEntryPoint = ENTRY_POINTS.some((entry) => file.name.includes(entry));

    if (isEntryPoint || file.importance !== "Normal file") {
      return { ...file, isUnused: false };
    }

    return {
      ...file,
      isUnused: false,
    };
  });

  const unusedFiles = getUnusedFiles(filesWithDefaultFlags);
  const unusedPaths = new Set(unusedFiles.map((file) => file.path));
  const files = filesWithDefaultFlags.map((file) => ({
    ...file,
    isUnused: unusedPaths.has(file.path),
  }));
  const markedUnusedFiles = files.filter((file) => unusedPaths.has(file.path));

  const summary = getSummary(files);
  const insights = getInsights(files);
  const apiCalls = getApiCalls(files);
  const backendRoutes = getBackendRoutes(files);
  const { securityAudit, hasEnvFile } = getSecurityAudit(files);
  const flows = getFlows(apiCalls, backendRoutes);
  const routeHealth = getRouteHealth(flows);
  const duplicateGroups = getDuplicateGroups(files);
  const healthScore = getHealthScore(securityAudit, markedUnusedFiles, hasEnvFile);

  return {
    projectName: getProjectName(projectPath, projectName),
    projectPath,
    totalFiles: files.length,
    files,
    summary,
    insights,
    flows,
    routeHealth,
    duplicateGroups,
    folders,
    techStack,
    unusedFiles: markedUnusedFiles,
    securityAudit,
    healthScore,
  };
}

// Scan project and persist to MongoDB if user is authenticated
// Scan project and create/update saved report
exports.scanAndSaveProject = async (req, res) => {
  const { projectPath, projectName } = req.body;

  if (!projectPath) {
    return res.status(400).json({
      success: false,
      message: "Project path is required",
    });
  }

  try {
    // Run the project analysis
    const report = buildScanReport(
      projectPath,
      projectName
    );

    let savedReport = null;

    // Save only for authenticated users
    if (req.user) {
      // Check whether this user already has
      // a saved report for this project
      savedReport = await ScanReport.findOne({
        user: req.user._id,
        projectPath: projectPath,
      });

      if (savedReport) {
        // ==========================================
        // EXISTING PROJECT → UPDATE
        // ==========================================

        savedReport.projectName =
          report.projectName;

        savedReport.totalFiles =
          report.totalFiles;

        savedReport.healthScore =
          report.healthScore;

        savedReport.summary =
          report.summary;

        savedReport.insights =
          report.insights;

        savedReport.flows =
          report.flows;

        savedReport.routeHealth =
          report.routeHealth;

        savedReport.duplicateGroups =
          report.duplicateGroups;

        savedReport.folders =
          report.folders;

        savedReport.techStack =
          report.techStack;

        savedReport.unusedFiles =
          report.unusedFiles;

        savedReport.securityAudit =
          report.securityAudit;

        savedReport.files =
          report.files;

        await savedReport.save();
      } else {
        // ==========================================
        // NEW PROJECT → CREATE
        // ==========================================

        savedReport = await ScanReport.create({
          user: req.user._id,
          ...report,
        });
      }
    }

    const responseReport = savedReport
      ? savedReport.toObject()
      : report;

    res.json({
      success: true,

      report: {
        ...responseReport,

        savedReportId: savedReport
          ? savedReport._id
          : null,

        // Tell frontend whether this was
        // a new report or an updated report
        reportAction: savedReport
          ? "updated_or_created"
          : "temporary_scan",
      },
    });
  } catch (error) {
    console.error(
      "Scan and save error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Could not scan project",
      error: error.message,
    });
  }
};

// ==========================================
// UPLOAD ZIP AND SCAN PROJECT
// ==========================================

exports.uploadAndScanProject = async (req, res) => {
  let extractedPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a ZIP file",
      });
    }

    const zipPath = req.file.path;

    // Create unique extraction directory
    const projectId =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    extractedPath = path.join(
      __dirname,
      "../uploads",
      projectId
    );

    fs.mkdirSync(extractedPath, {
      recursive: true,
    });

    // Extract ZIP
    const zip = new AdmZip(zipPath);

    zip.extractAllTo(
      extractedPath,
      true
    );

    // Some ZIP files contain:
    //
    // project/
    //   src/
    //   package.json
    //
    // Instead of:
    //
    // src/
    // package.json
    //
    // Find the actual project root.
    let projectRoot = extractedPath;

    const extractedItems =
      fs.readdirSync(extractedPath);

    if (extractedItems.length === 1) {
      const firstItem = path.join(
        extractedPath,
        extractedItems[0]
      );

      if (
        fs.existsSync(firstItem) &&
        fs.statSync(firstItem).isDirectory()
      ) {
        projectRoot = firstItem;
      }
    }

    // Project name from ZIP filename
    const projectName =
      path.basename(
        req.file.originalname,
        ".zip"
      );

    // Use the SAME existing scanner
    const report = buildScanReport(
      projectRoot,
      projectName
    );

    let savedReport = null;

    // Save report for authenticated user
    if (req.user) {
      const projectKey = `zip://${projectName}`;

savedReport = await ScanReport.findOne({
  user: req.user._id,
  projectPath: projectKey,
});

      if (savedReport) {
        // Update existing report
        savedReport.projectName =
          report.projectName;

        savedReport.totalFiles =
          report.totalFiles;

        savedReport.healthScore =
          report.healthScore;

        savedReport.summary =
          report.summary;

        savedReport.insights =
          report.insights;

        savedReport.flows =
          report.flows;

        savedReport.routeHealth =
          report.routeHealth;

        savedReport.duplicateGroups =
          report.duplicateGroups;

        savedReport.folders =
          report.folders;

        savedReport.techStack =
          report.techStack;

        savedReport.unusedFiles =
          report.unusedFiles;

        savedReport.securityAudit =
          report.securityAudit;

        savedReport.files =
          report.files;

        await savedReport.save();
      } else {
        savedReport =
  await ScanReport.create({
    user: req.user._id,
    ...report,
    projectPath: projectKey,
  });
      }
    }

    const responseReport =
      savedReport
        ? savedReport.toObject()
        : report;

    res.status(201).json({
      success: true,

      message:
        "ZIP uploaded and scanned successfully",

      report: {
        ...responseReport,

        savedReportId:
          savedReport
            ? savedReport._id
            : null,
      },
    });

    // Delete uploaded ZIP after scanning
    try {
      fs.unlinkSync(zipPath);
    } catch (error) {
      console.error(
        "Could not delete ZIP:",
        error.message
      );
    }

    // Delete extracted files after report is saved
    try {
      fs.rmSync(
        extractedPath,
        {
          recursive: true,
          force: true,
        }
      );
    } catch (error) {
      console.error(
        "Could not delete extracted project:",
        error.message
      );
    }
  } catch (error) {
    console.error(
      "ZIP scan error:",
      error
    );

    // Cleanup if something failed
    if (extractedPath) {
      try {
        fs.rmSync(
          extractedPath,
          {
            recursive: true,
            force: true,
          }
        );
      } catch (cleanupError) {
        console.error(
          "Cleanup error:",
          cleanupError.message
        );
      }
    }

    if (req.file?.path) {
      try {
        fs.unlinkSync(
          req.file.path
        );
      } catch (cleanupError) {
        console.error(
          "ZIP cleanup error:",
          cleanupError.message
        );
      }
    }

    res.status(500).json({
      success: false,
      message: "Could not scan ZIP project",
      error: error.message,
    });
  }
};
// Get all saved reports for logged in user
exports.getSavedReports = async (req, res) => {
  try {
    const reports = await ScanReport.find({ user: req.user._id })
      .select("projectName projectPath totalFiles healthScore createdAt")
      .sort({ createdAt: -1 });

    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single report by ID
exports.getReportById = async (req, res) => {
  try {
    const report = await ScanReport.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a report by ID
exports.deleteReport = async (req, res) => {
  try {
    const report = await ScanReport.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    res.json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
