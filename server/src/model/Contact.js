// models/Contact.js

import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: String,

    phone: String,

    email: {
      type: String,
      required: true,
    },

    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Contact", contactSchema);