import { createRequire } from "module";
const require = createRequire(import.meta.url);
const dotenv = require("dotenv");
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST","PUT"],
  credentials: true
}));
app.use(express.json());
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log("success"))
  .catch(err => {
  console.error("Fail:", err);
  process.exit(1)});

const CourseSchema = new mongoose.Schema({
  name: String,
  tutor: String,
  students: [String]
});
const Course = mongoose.model("Course", CourseSchema);
const StudentSchema = new mongoose.Schema({
  name: String,
  email: String,
  enrolledCourses: [String],
});
const Student = mongoose.model("Student", StudentSchema);
const TutorSchema = new mongoose.Schema({
  name: String,
  expertise: String,
  coursesTaught: [String],
});
const Tutor = mongoose.model("Tutor", TutorSchema);
const settingsSchema = new mongoose.Schema({
  name: String,
  email: String,
  bio: String,
  avatarUrl: String,
  notifications: {
    emailNewCourses: Boolean,
    emailEventUpdates: Boolean,
    inAppAnnouncements: Boolean,
  },
  darkMode: Boolean,
});
const Settings = mongoose.model("Settings", settingsSchema);

app.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: "獲取課程失敗" });
  }
});
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "獲取學生失敗" });
  }
});
app.get("/tutors", async (req, res) => {
  try {
    const tutors = await Tutor.find();
    res.json(tutors);
  } catch (err) {
    res.status(500).json({ error: "獲取導師數據失敗" });
  }
});
app.get("/settings", async (req, res) => {
  try {
    const userSettings = {
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      bio: "Lifelong learner and enthusiast for new technologies.",
      avatarUrl: "https://picsum.photos/seed/user1/200/200",
      notifications: {
        emailNewCourses: true,
        emailEventUpdates: true,
        inAppAnnouncements: true,
      },
      darkMode: false,
    };
    res.json(userSettings);
  } catch (err) {
    res.status(500).json({ error: "獲取用戶設定失敗" });
  }
});
app.post("/students", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "姓名與 Email 為必填" });
    }
    const newStudent = new Student({ name, email, enrolledCourses: [] });
    await newStudent.save();
    res.json({ message: "學生已添加", student: newStudent });
  } catch (err) {
    res.status(500).json({ error: "新增學生失敗" });
  }
});



app.put("/settings", async (req, res) => {
  try {
    const updatedSettings = req.body;
    res.json({ message: "設定已更新", settings: updatedSettings });
  } catch (err) {
    res.status(500).json({ error: "更新設定失敗" });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`port：${PORT}`));