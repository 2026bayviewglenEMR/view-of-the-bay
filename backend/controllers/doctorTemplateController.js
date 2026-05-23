const DoctorTemplate = require("../models/DoctorTemplate");

const getDoctorTemplates = async (req, res) => {
  try {
    const doctorId = req.query.doctorId || req.user.id;

    if (!doctorId) {
      return res.status(400).json({
        message: "doctorId is required",
      });
    }

    const templates = await DoctorTemplate.find({ doctorId }).sort({
      updatedAt: -1,
    });

    res.json(templates);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get doctor templates",
      error: error.message,
    });
  }
};

const createDoctorTemplate = async (req, res) => {
  try {
    const doctorId = req.body.doctorId || req.user.id;

    if (!doctorId) {
      return res.status(400).json({
        message: "doctorId is required",
      });
    }

    const template = await DoctorTemplate.create({
      doctorId,
      title: req.body.title,
      category: req.body.category,
      content: req.body.content,
    });

    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create doctor template",
      error: error.message,
    });
  }
};

const updateDoctorTemplate = async (req, res) => {
  try {
    const template = await DoctorTemplate.findById(req.params.templateId);

    if (!template) {
      return res.status(404).json({
        message: "Doctor template not found",
      });
    }

    if (req.body.title !== undefined) {
      template.title = req.body.title;
    }

    if (req.body.category !== undefined) {
      template.category = req.body.category;
    }

    if (req.body.content !== undefined) {
      template.content = req.body.content;
    }

    await template.save();

    res.json(template);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update doctor template",
      error: error.message,
    });
  }
};

const deleteDoctorTemplate = async (req, res) => {
  try {
    const template = await DoctorTemplate.findByIdAndDelete(
      req.params.templateId
    );

    if (!template) {
      return res.status(404).json({
        message: "Doctor template not found",
      });
    }

    res.json({
      message: "Doctor template deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete doctor template",
      error: error.message,
    });
  }
};

module.exports = {
  getDoctorTemplates,
  createDoctorTemplate,
  updateDoctorTemplate,
  deleteDoctorTemplate,
};