import express from "express";
import cors from "cors";
import fs from "node:fs/promises";
import path from "node:path";
import { extractStructure } from "./extract";
import { generateMarkdownFiles } from "./markdown";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const entityDirMap = {
  style: "styles",
  artist: "artists",
  period: "periods",
  museum: "museums",
} as const;

function normalizeNoteLink(noteFilename: string): string {
  return noteFilename.replace(/\.md$/i, "");
}

async function upsertEntityFile(
  filePath: string,
  content: string,
  noteFilename: string
): Promise<"created" | "updated"> {
  try {
    const existing = await fs.readFile(filePath, "utf-8");
    const noteLink = `[[${normalizeNoteLink(noteFilename)}]]`;

    if (existing.includes(noteLink)) {
      return "updated";
    }

    const updated = `${existing.trimEnd()}\n- ${noteLink}\n`;
    await fs.writeFile(filePath, updated, "utf-8");
    return "updated";
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }

    await fs.writeFile(filePath, content, "utf-8");
    return "created";
  }
}

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

app.post("/export", async (req, res) => {
  try {
    const { text, vaultPath } = req.body as { text?: string; vaultPath?: string };

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    if (!vaultPath) {
      return res.status(400).json({ error: "vaultPath is required" });
    }

    const extraction = await extractStructure(text);
    const files = generateMarkdownFiles(text, extraction);

    const dirs = ["styles", "artists", "periods", "museums", "notes"];
    await Promise.all(dirs.map((dir) => fs.mkdir(path.join(vaultPath, dir), { recursive: true })));

    const notePath = path.join(vaultPath, "notes", files.note.filename);
    await fs.writeFile(notePath, files.note.content, "utf-8");

    const entityWrites = await Promise.all(
      files.entities.map(async (entity) => {
        const entityDir = entityDirMap[entity.type as keyof typeof entityDirMap];
        const entityPath = path.join(vaultPath, entityDir, entity.filename);
        const status = await upsertEntityFile(entityPath, entity.content, files.note.filename);
        return { ...entity, path: entityPath, status };
      })
    );

    res.json({
      extraction,
      files,
      exported: {
        vaultPath,
        notePath,
        entities: entityWrites,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
