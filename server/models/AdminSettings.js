import mongoose from "mongoose";

const adminSettingsSchema = new mongoose.Schema(
  {
    registrationOpen: {
      type: Boolean,
      default: true,
    },
    requireApproval: {
      type: Boolean,
      default: false,
    },
    inviteOnly: {
      type: Boolean,
      default: false,
    },
    maxTeachers: {
      type: Number,
      default: 100,
    },
    maxStudentsPerTeacher: {
      type: Number,
      default: 50,
    },
  },
  { timestamps: true }
);

const AdminSettings = mongoose.model("AdminSettings", adminSettingsSchema);
export default AdminSettings;