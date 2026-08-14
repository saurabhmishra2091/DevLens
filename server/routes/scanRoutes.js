const express = require("express");

const { protect } = require("../middleware/authMiddleware");

const {
  scanAndSaveProject: scanHandler,
  uploadAndScanProject: uploadScanHandler,
  getSavedReports: getReportsHandler,
  getReportById: getReportHandler,
  deleteReport: deleteReportHandler,
} = require("../controllers/scanController");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// ==========================================
// NORMAL PROJECT SCAN
// ==========================================

router.post(
  "/scan",
  protect,
  scanHandler
);

// ==========================================
// ZIP PROJECT UPLOAD + SCAN
// ==========================================

router.post(
  "/scan/upload",
  protect,
  upload.single("project"),
  uploadScanHandler
);

// ==========================================
// PUBLIC SCAN
// ==========================================

router.post(
  "/public-scan",
  scanHandler
);

// ==========================================
// SAVED REPORTS
// ==========================================

router.get(
  "/reports",
  protect,
  getReportsHandler
);

router.get(
  "/reports/:id",
  protect,
  getReportHandler
);

router.delete(
  "/reports/:id",
  protect,
  deleteReportHandler
);

module.exports = router;