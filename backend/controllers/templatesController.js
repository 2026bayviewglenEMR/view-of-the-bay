const {
  getTemplateById,
  getTemplates,
} = require("../templates/templateSystem");

const getAllTemplates = (req, res) => {
  res.json(getTemplates());
};

const getTemplate = (req, res) => {
  const template = getTemplateById(req.params.templateId);

  if (!template) {
    return res.status(404).json({
      message: "Template not found",
    });
  }

  res.json(template);
};

module.exports = {
  getAllTemplates,
  getTemplate,
};