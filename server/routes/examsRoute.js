require("dotenv").config();
const router = require("express").Router();
const Exam = require("../models/examModel");
const authMiddleware = require("../middlewares/authMiddleware");
const Question = require("../models/questionModel");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// add exam
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const examExists = await Exam.findOne({ name: req.body.name });
    if (examExists) {
      return res
        .status(200)
        .send({ message: "Exam already exists", success: false });
    }
    req.body.questions = [];
    const newExam = new Exam(req.body);
    await newExam.save();
    res.send({
      message: "Exam added successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// get all exams
router.post("/get-all-exams", authMiddleware, async (req, res) => {
  try {
    const exams = await Exam.find({});
    res.send({
      message: "Exams fetched successfully",
      data: exams,
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// get exam by id
router.post("/get-exam-by-id", authMiddleware, async (req, res) => {
  try {
    const exam = await Exam.findById(req.body.examId).populate("questions");
    res.send({
      message: "Exam fetched successfully",
      data: exam,
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// edit exam by id
router.post("/edit-exam-by-id", authMiddleware, async (req, res) => {
  try {
    await Exam.findByIdAndUpdate(req.body.examId, req.body);
    res.send({
      message: "Exam edited successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// delete exam by id
router.post("/delete-exam-by-id", authMiddleware, async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.body.examId);
    res.send({
      message: "Exam deleted successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// add question to exam
router.post("/add-question-to-exam", authMiddleware, async (req, res) => {
  try {
    const newQuestion = new Question(req.body);
    const question = await newQuestion.save();
    const exam = await Exam.findById(req.body.exam);
    exam.questions.push(question._id);
    await exam.save();
    res.send({
      message: "Question added successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// edit question in exam
router.post("/edit-question-in-exam", authMiddleware, async (req, res) => {
  try {
    await Question.findByIdAndUpdate(req.body.questionId, req.body);
    res.send({
      message: "Question edited successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// delete question in exam
router.post("/delete-question-in-exam", authMiddleware, async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.body.questionId);
    const exam = await Exam.findById(req.body.examId);
    exam.questions = exam.questions.filter(
      (question) => question._id != req.body.questionId
    );
    await exam.save();
    res.send({
      message: "Question deleted successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

router.post("/generate-questions", authMiddleware, async (req, res) => {
  try {
    const { topic, difficulty, examId } = req.body;

    if (!topic || !difficulty || !examId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (topic, difficulty, examId).",
      });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a quiz generator. Return only valid JSON.",
        },
        {
          role: "user",
          content: `Generate 1 multiple-choice question on the topic "${topic}" with "${difficulty}" difficulty.
          The response should be structured as:
          {
            "name": "Question text",
            "correctOption": "A",
            "options": {
              "A": "Option 1",
              "B": "Option 2",
              "C": "Option 3",
              "D": "Option 4"
            }
          }`,
        },
      ],
      model: "llama-3.3-70b-versatile",

      response_format: { type: "json_object" },
    });

    const aiQuestion = JSON.parse(completion.choices[0].message.content);

    res.json({
      success: true,
      message: "AI-generated question fetched successfully",
      question: aiQuestion,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to generate quiz question",
      error: error.message,
    });
  }
});

module.exports = router;
