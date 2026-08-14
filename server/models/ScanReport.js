const mongoose = require("mongoose");

const scanReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    projectPath: {
      type: String,
      required: true,
    },
    totalFiles: {
      type: Number,
      required: true,
    },
    healthScore: {
      type: Number,
      default: 100,
    },
    summary: {
      reactComponents: { type: Number, default: 0 },
      javascriptFiles: { type: Number, default: 0 },
      cssFiles: { type: Number, default: 0 },
      jsonFiles: { type: Number, default: 0 },
      backendFiles: { type: Number, default: 0 },
      otherFiles: { type: Number, default: 0 },
    },
    insights: {
      components: Array,
      importantFiles: Array,
    },
    flows: Array,
    routeHealth: {
      totalApiCalls: { type: Number, default: 0 },
      matchedApiCalls: { type: Number, default: 0 },
      unmatchedApiCalls: { type: Number, default: 0 },
      unmatchedFlows: Array,
    },
    duplicateGroups: Array,
    folders: [String],
    techStack: [String],
    unusedFiles: Array,
    securityAudit: Array,
    files: Array,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ScanReport", scanReportSchema);
