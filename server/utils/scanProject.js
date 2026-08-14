const fs = require("fs");
const path = require("path");
const analyzeFile = require("./analyzeFile");

const ignoredFolders = ["node_modules", ".git", "dist", "build"];

function getFileType(extension, relativePath) {
  const normalizedPath = relativePath.replaceAll("\\", "/");

  if (extension === ".jsx" || extension === ".tsx") {
    return "React Component";
  }

  if (extension === ".js" || extension === ".ts") {
    if (
      normalizedPath.startsWith("server/") ||
      normalizedPath.startsWith("backend/") ||
      normalizedPath.includes("/server/") ||
      normalizedPath.includes("/backend/") ||
      normalizedPath.includes("controller") ||
      normalizedPath.includes("route") ||
      normalizedPath.includes("middleware") ||
      normalizedPath.includes("model")
    ) {
      return "Backend File";
    }

    return "JavaScript File";
  }

  if (extension === ".css") {
    return "CSS File";
  }

  if (extension === ".json") {
    return "JSON File";
  }

  return "Other File";
}
function getImportance(fileName, relativePath) {
  const lowerName = fileName.toLowerCase();
  const lowerPath = relativePath.toLowerCase();

  if (lowerName === "package.json") {
    return "Project config";
  }

  if (lowerName === ".env") {
    return "Environment variables";
  }

  if (lowerName === "app.jsx" || lowerName === "app.js") {
    return "Main app component";
  }

  if (lowerName === "main.jsx" || lowerName === "main.js") {
    return "React entry point";
  }

  if (lowerName === "index.js" && lowerPath.includes("server")) {
    return "Backend entry point";
  }

  if (lowerPath.includes("route")) {
    return "API routes";
  }

  if (lowerPath.includes("controller")) {
    return "Controller logic";
  }

  if (lowerPath.includes("model")) {
    return "Database model";
  }

  if (lowerPath.includes("middleware")) {
    return "Middleware";
  }

  return "Normal file";
}

function scanProject(projectPath, basePath = projectPath) {
  const files = [];

  const items = fs.readdirSync(projectPath);

  items.forEach((item) => {
    const fullPath = path.join(projectPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!ignoredFolders.includes(item)) {
        files.push(...scanProject(fullPath, basePath));
      }
    } else {
      const extension = path.extname(item);
      const relativePath = path.relative(basePath, fullPath);

      const shouldAnalyze = [".js", ".jsx", ".ts", ".tsx"].includes(extension);

files.push({
  name: item,
  path: relativePath,
  extension,
  type: getFileType(extension, relativePath.toLowerCase()),
  importance: getImportance(item, relativePath),
  analysis: shouldAnalyze ? analyzeFile(fullPath) : null,
});
    }
  });

  return files;
}

module.exports = scanProject;