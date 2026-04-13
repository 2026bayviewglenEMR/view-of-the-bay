const mongoose = require("mongoose");
 
const drugInteractionSchema = new mongoose.Schema({
  drug_id:     { type: String },
  name:        { type: String },
  description: { type: String },
});
 
const drugSchema = new mongoose.Schema({
  id:                { type: String, required: true, unique: true },
  name:              { type: String, required: true },
  description:       { type: String },
  drug_interactions: [drugInteractionSchema],
});
 
// Index for fast name search
drugSchema.index({ name: 1 });
 
module.exports = mongoose.model("Drug", drugSchema, "drugs");