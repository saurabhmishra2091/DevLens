const ScanReport = require("../models/ScanReport");

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // ==========================================
    // TOTAL SCANS
    // ==========================================

    const totalScans = await ScanReport.countDocuments({
      user: userId,
    });

    // ==========================================
    // UNIQUE PROJECTS
    // ==========================================

    const uniqueProjects = await ScanReport.distinct(
      "projectPath",
      {
        user: userId,
      }
    );

    const totalProjects = uniqueProjects.length;

    // ==========================================
    // TOTAL FILES
    // ==========================================

    const fileStats = await ScanReport.aggregate([
      {
        $match: {
          user: userId,
        },
      },
      {
        $group: {
          _id: null,
          totalFiles: {
            $sum: "$totalFiles",
          },
        },
      },
    ]);

    // ==========================================
    // AVERAGE HEALTH
    // ==========================================

    const healthStats = await ScanReport.aggregate([
      {
        $match: {
          user: userId,
        },
      },
      {
        $group: {
          _id: null,
          averageHealth: {
            $avg: "$healthScore",
          },
        },
      },
    ]);

    // ==========================================
    // LATEST 5 SCANS
    // ==========================================

    const recentReports = await ScanReport.find({
      user: userId,
    })
      .select(
        "projectName projectPath totalFiles healthScore techStack createdAt"
      )
      .sort({
        createdAt: -1,
      })
      .limit(5);

    // ==========================================
    // RESPONSE
    // ==========================================

    res.json({
      success: true,

      dashboard: {
        statistics: {
          totalProjects,
          totalScans,
          totalFiles:
            fileStats[0]?.totalFiles || 0,

          averageHealth: Math.round(
            healthStats[0]?.averageHealth || 0
          ),
        },

        recentReports,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Could not load dashboard",
    });
  }
};