const reportModel = require("../Models/reportModel");
const sessionModel = require("../Models/sessionModel");
const ticketsModel = require("../Models/ticketModel");
const knowledgeBaseModel = require("../Models/knowledgeBaseModel");
const reportController = {
  createReport: async (req, res) => {
    try {
      // Extract report data from the request body
      const { ticketId } = req.query;
      const { ticketStatus, resolutionTime, agentPerformance } = req.body;
      const targetToken = req.cookies.token;
      const session = await sessionModel
        .findOne({ token: targetToken })
        .select("userID");
      const managerId = session.userID.toString();
      // Create a new report

      //check if the report already exists
      const existingReport = await reportModel.findOne({ ticketId: ticketId });

      console.log(existingReport);
      if (existingReport) {
        return res.status(400).json({ message: "report already exists" });
      }

      const ticket = await ticketsModel.findById(ticketId);
      const newReport = new reportModel({
        managerId,
        ticketId,
        ticketTitle: ticket.title,
        ticketStatus,
        resolutionTime,
        agentPerformance,
      });

      // Save the report to the database
      await newReport.save();

      res
        .status(201)
        .json({ message: "Report created successfully", report: newReport });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  getAllReports: async (req, res) => {
    try {
      //getting all reports and outputting them
      const {ticketId} = req.query;
      if (ticketId) {
        const particReport = await reportModel.findOne({
          ticketId,
        });
        if (!particReport) {
          return res
            .status(404)
            .json({ message: "no report exists for thid ticket" });
        }
        return res.status(200).json({ reportsAnalytics: particReport });
      } else {
        const allReports = await reportModel.find().sort({resolutionTime: -1});
        if (!allReports) {
          return res
            .status(404)
            .json({ message: "no reports in the database" });
        }

        allReports.map(async (report) => {
          const ticket = await ticketsModel.findById(report.ticketId)
          if(ticket){
            report = {
              ...report,
              ticketTitle: ticket.title
            }
          }
        });
        return res.status(200).json({ reportsAnalytics: allReports });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  updateReport: async (req, res) => {
    try {
      // Extract report data from the request body
      const { _id } = req.query;
      const { ticketStatus, resolutionTime, agentPerformance } =
        req.body;
      const report = await reportModel.findById(_id);
      // Update the report
      if (ticketStatus) {
        report.ticketStatus = ticketStatus;
      }
      if (resolutionTime) {
        report.resolutionTime = resolutionTime;
      }
      if (agentPerformance) {
        report.agentPerformance = agentPerformance;
      }
      //check if the report exists
      if (!report.ticketId) {
        res.status(404).json({ message: "report does not exist" });
      }
      // check if the current manager is the same one that created it and if it caan be others should i update the managerID
      //
      // Save the updated report to the database
      await report.save();
      res
        .status(200)
        .json({ message: "report updated successfully", report: report });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  deleteReport: async (req, res) => {
    try {
      const { ticketId } = req.body;

      // Find the report by ticketId and remove it
      const deletedReport = await reportModel.findOneAndRemove({ ticketId });

      // Check if the report was found and deleted
      if (!deletedReport) {
        return res.status(404).json({ message: "Report not found" });
      }

      res.status(200).json({ message: "Report deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  getAnalytics: async (req, res) => {
    try {
      const body = req.body;
      const issue = await ticketsModel.aggregate([
        {
          $group: {
            _id: "$category", // Group by the 'issue' column
            count: { $sum: 1 }, // Count occurrences of each issue
          },
        },
        {
          $sort: { count: -1 }, // Sort in descending order based on the count
        },
        {
          $limit: 5, // You can adjust this limit based on how many top issues you want
        },
      ]);
      const total = await (async () => await ticketsModel.countDocuments({}))();
      const statusPercent = await ticketsModel.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            status: "$_id",
            percentage: {
              $round: [
                { $multiply: [{ $divide: ["$count", total] }, 100] },
                1, // 1 decimal place
              ],
            },
          },
        },
      ]);
      const statusPercentfilter = await ticketsModel.aggregate([
        {
          $match: { $or: [{ status: "open" }, { status: "in progress" }] }, // Filter by open or in progress status
        },
        {
          $group: {
            _id: { status: "$status", category: "$category" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            status: "$_id.status",
            category: "$_id.category",
            percentage: { $multiply: [{ $divide: ["$count", total] }, 100] },
          },
        },
        {
          $sort: { category: 1 }, // Sort by category in ascending order
        },
      ]);
      const relation = await ticketsModel.aggregate([
        {
          $match: { $or: [{ status: "open" }, { status: "in progress" }, { status: "closed" }] },
        },
        {
          $group: {
            _id: { createdAt: { $dateToString: { format: "%m-%d", date: "$createdAt" } } },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            createdAt: "$_id.createdAt",
            count: 1,
            percentage: { $multiply: [{ $divide: ["$count", total] }, 100] },
          },
        },
        {
          $sort: { createdAt: 1 },
        },
      ]);
      
      
      
      res.status(200).json({
        message: "meh",
        issue: issue,
        statusPercent: statusPercent,
        statusPercentfilter: statusPercentfilter,
        relation: relation,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },
};

module.exports = reportController;
