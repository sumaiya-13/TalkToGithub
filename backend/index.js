import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
console.log("TOKEN:", process.env.GITHUB_TOKEN ? "LOADED" : "MISSING");


const app = express();
app.use(cors());
app.use(express.json());

const github = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json"
  }
});

app.get("/repos", async (req, res) => {
  try {
    const response = await github.get("/user/repos");
    const repoNames = response.data.map(repo => repo.name);
    res.json(repoNames);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch repos" });
  }
});

app.post("/create-repo", async (req, res) => {

  console.log("CREATE HIT");
  console.log("BODY:", req.body);

  const { name, isPrivate } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Repository name required" });
  }

  try {
    const response = await github.post("/user/repos", {
      name: name,
      private: isPrivate || false
    });

    console.log("GITHUB RESPONSE:", response.data);

    res.json({ success: true, message: "Repository created" });

  } catch (err) {
    console.log("GITHUB ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Repo creation failed" });
  }
});



app.delete("/delete-repo/:name", async (req, res) => {
  const repoName = req.params.name;

  try {
    const user = await github.get("/user");
    const username = user.data.login;

    await github.delete(`/repos/${username}/${repoName}`);

    res.json({ success: true, message: "Repository deleted" });
  } catch (err) {
    console.log(err.response?.data);
    res.status(500).json({ error: "Delete failed" });
  }
});





app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
