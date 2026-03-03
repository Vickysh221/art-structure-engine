import express from "express";
import cors from "cors";
import { extractStructure } from "./extract";
import { generateMarkdownFiles } from "./markdown";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post("/extract", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const extraction = await extractStructure(text);
    const files = generateMarkdownFiles(text, extraction);

    res.json({
      extraction,
      files,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
