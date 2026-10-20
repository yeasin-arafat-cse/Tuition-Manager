import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String, // Base64 ইমেজ এখানে সেভ হবে (খুব ছোট সাইজের হলে)
    },
  },
  { timestamps: true }
);

const Material = mongoose.model("Material", materialSchema);
export default Material;