// controllers/reportController.js
import Report from "../models/Report.js";
import Prompt from "../models/Prompt.js";

// POST /reports — private. Body: { promptId, reason, description }
export const createReport = async (req, res) => {
  try {
    const { promptId, reason, description } = req.body;
    const prompt = await Prompt.findById(promptId);
    if (!prompt) return res.status(404).send({ message: "Prompt not found" });

    const report = await Report.create({
      promptId,
      promptTitle: prompt.title,
      reporterEmail: req.user.email,
      reason,
      description,
    });

    res.status(201).send(report);
  } catch (error) {
    res.status(500).send({ message: "Failed to submit report", error: error.message });
  }
};

// GET /reports — admin only. "Reported Prompts" table.
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.send(reports);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch reports" });
  }
};

// PATCH /reports/:id — admin only. Body: { action: "removed" | "warned" | "dismissed" }
export const resolveReport = async (req, res) => {
  try {
    const { action } = req.body; // "removed" | "warned" | "dismissed"

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).send({ message: "Report not found" });

    if (action === "removed") {
      await Prompt.findByIdAndDelete(report.promptId);
    }

    report.status = action;
    await report.save();

    res.send(report);
  } catch (error) {
    res.status(500).send({ message: "Failed to resolve report", error: error.message });
  }
};
