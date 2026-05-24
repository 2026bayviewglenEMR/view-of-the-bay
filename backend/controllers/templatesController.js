const Template = require("../models/Templates.js");
const {
  getTemplateById,
  getTemplates: getClinicTemplateSystem,
} = require("../templates/templateSystem.js");

const getTemplates = async (req, res) => {
  try {
    return res.status(200).json(getClinicTemplateSystem());
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getMyTemplates = async (req, res) => {
  try {
    const templates = await Template.find({
      authorId: req.user.id,
      isGlobal: false,
    }).sort({ updatedAt: -1 });

    return res.status(200).json(templates);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const createMyTemplate = async (req, res) => {
  try {
    const { title, type, content } = req.body;

    if (!title || !type || !content) {
      return res.status(400).json({
        message: "title, type, and content are required.",
      });
    }

    const template = await Template.create({
      authorId: req.user.id,
      title,
      type,
      content,
      isGlobal: false,
    });

    return res.status(201).json(template);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updateMyTemplate = async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.templateId,
      authorId: req.user.id,
      isGlobal: false,
    });

    if (!template) {
      return res.status(404).json({ message: "Template not found." });
    }

    if (req.body.title !== undefined) {
      template.title = req.body.title;
    }

    if (req.body.type !== undefined) {
      template.type = req.body.type;
    }

    if (req.body.content !== undefined) {
      template.content = req.body.content;
    }

    await template.save();

    return res.status(200).json(template);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const deleteMyTemplate = async (req, res) => {
  try {
    const template = await Template.findOneAndDelete({
      _id: req.params.templateId,
      authorId: req.user.id,
      isGlobal: false,
    });

    if (!template) {
      return res.status(404).json({ message: "Template not found." });
    }

    return res.status(200).json({ message: "Template deleted." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getClinicTemplates = (req, res) => {
  return res.status(200).json(getClinicTemplateSystem());
};

const getClinicTemplate = (req, res) => {
  const template = getTemplateById(req.params.templateId);

  if (!template) {
    return res.status(404).json({ message: "Template not found." });
  }

  return res.status(200).json(template);
};

module.exports = {
  getTemplates,
  getMyTemplates,
  createMyTemplate,
  updateMyTemplate,
  deleteMyTemplate,
  getClinicTemplates,
  getClinicTemplate,
};
