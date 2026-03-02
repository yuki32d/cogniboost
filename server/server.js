require("dotenv").config();
const express = require("express");
const app = express();
const cors = require('cors')

app.use(express.json());
app.use(cors());
const connectDB = require("./config/dbConfig");


const usersRoute = require("./routes/usersRoute");
const examsRoute = require("./routes/examsRoute");
const resportsRoute = require("./routes/reportsRoute");


connectDB();

app.use("/api/users", usersRoute);
app.use("/api/exams", examsRoute);
app.use("/api/reports", resportsRoute);
const port = process.env.PORT || 5000;

const path = require("path");
__dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client", "build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
