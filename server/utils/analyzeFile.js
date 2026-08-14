const fs = require("fs");

function analyzeFile(fullPath) {
  const content = fs.readFileSync(fullPath, "utf-8");

  const apiCalls = [];
  const backendRoutes = [];
  const models = [];
  const imports = [];
  const securityWarnings = [];
  const lines = content.split("\n").length;

const functionMatches =
  content.match(/function\s+\w+\s*\(/g) ||
  content.match(/const\s+\w+\s*=\s*\(/g) ||
  [];

const functionCount = functionMatches.length;

let complexity = "Low";

if (lines > 300 || functionCount > 10) {
  complexity = "High";
} else if (lines > 120 || functionCount > 5) {
  complexity = "Medium";
}

  // 1. Detect fetch API calls with HTTP method parsing
  const fetchRegex = /fetch\(\s*["'`\`](.*?)["'`\`]\s*(?:,\s*\{[\s\S]*?method\s*:\s*["'`\`](.*?)["'`\`])?/g;
  let fetchMatch;
  while ((fetchMatch = fetchRegex.exec(content)) !== null) {
    apiCalls.push({
      client: "fetch",
      method: fetchMatch[2] ? fetchMatch[2].toUpperCase() : "GET",
      url: fetchMatch[1],
    });
  }

  if (apiCalls.length === 0) {
    const simpleFetchMatches = content.match(/fetch\(["'`\`](.*?)["'`\`]/g) || [];
    simpleFetchMatches.forEach((match) => {
      const urlMatch = match.match(/fetch\(["'`\`](.*?)["'`\`]/);
      if (urlMatch) {
        apiCalls.push({
          client: "fetch",
          method: "GET",
          url: urlMatch[1],
        });
      }
    });
  }

  // 2. Detect Axios API calls
  const axiosMatches = content.match(/axios\.(get|post|put|delete|patch)\(["'`\`](.*?)["'`\`]/g) || [];
  axiosMatches.forEach((match) => {
    const urlMatch = match.match(/axios\.(get|post|put|delete|patch)\(["'`\`](.*?)["'`\`]/);
    if (urlMatch) {
      apiCalls.push({
        client: `axios.${urlMatch[1]}`,
        method: urlMatch[1].toUpperCase(),
        url: urlMatch[2],
      });
    }
  });

  // 3. Detect Express routes
  const routeMatches = content.match(/(app|router)\.(get|post|put|delete|patch)\(["'`\`](.*?)["'`\`]/g) || [];
  routeMatches.forEach((match) => {
    const routeMatch = match.match(/(app|router)\.(get|post|put|delete|patch)\(["'`\`](.*?)["'`\`]/);
    if (routeMatch) {
      backendRoutes.push({
        method: routeMatch[2].toUpperCase(),
        path: routeMatch[3],
      });
    }
  });

  // 4. Detect MongoDB / Mongoose models
  const modelMatches = content.match(/mongoose\.model\(["'`\`](.*?)["'`\`]/g) || [];
  modelMatches.forEach((match) => {
    const nameMatch = match.match(/mongoose\.model\(["'`\`](.*?)["'`\`]/);
    if (nameMatch) {
      models.push(nameMatch[1]);
    }
  });

  // 5. Detect imports
  const importMatches = content.match(/(?:import\s+.*?\s+from\s+["'`\`](.*?)["'`\`]|require\(["'`\`](.*?)["'`\`]\))/g) || [];
  importMatches.forEach((match) => {
    const pathMatch = match.match(/["'`\`](.*?)["'`\`]/);
    if (pathMatch) {
      imports.push(pathMatch[1]);
    }
  });

  // 6. Security Audit: Scan for hardcoded keys or database URIs
  if (/mongodb(?:\+srv)?:\/\/[^\s"'`]+/i.test(content)) {
    securityWarnings.push("Hardcoded MongoDB Connection URI detected");
  }
  if (/(secret|jwt_secret|private_key)\s*[:=]\s*["'`][^"'`]{6,}["'`]/i.test(content)) {
    securityWarnings.push("Hardcoded Secret / JWT Key detected");
  }
  if (/(api_key|apikey)\s*[:=]\s*["'`][^"'`]{6,}["'`]/i.test(content)) {
    securityWarnings.push("Hardcoded API Key detected");
  }

  return {
    apiCalls,
    backendRoutes,
    models,
    imports,
    securityWarnings,
    lines,
  functionCount,
  complexity,
  };
}

module.exports = analyzeFile;