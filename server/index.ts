import express from "express";
import cors from "cors";
import fs from "node:fs/promises";
import path from "node:path";
import { extractStructure, runConnectivityTest } from "./extract";
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


function buildExportErrorPayload(error: unknown, vaultPath: string) {
  const err = error as NodeJS.ErrnoException;
  const code = err.code ?? "UNKNOWN";

  let suggestion = "请检查 vaultPath 是否存在且后端进程对该路径有写入权限。";
  if (code === "EACCES" || code === "EPERM") {
    suggestion = "后端进程没有写入权限。请确认路径存在，或将 vault 设置为后端可写目录。";
  } else if (code === "ENOENT") {
    suggestion = "路径不存在或父目录不存在。请确认 vaultPath 指向有效目录。";
  } else if (code === "EROFS") {
    suggestion = "目标目录是只读文件系统，无法导出。";
  }

  return {
    error: "Failed to export to Obsidian vault",
    code,
    details: err.message,
    vaultPath,
    suggestion,
  };
}

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


app.get("/connectivity", async (_req, res) => {
  try {
    const connectivity = await runConnectivityTest();
    const allOk =
      connectivity.inputInterface === "ok" &&
      connectivity.processingModule === "ok" &&
      connectivity.analysisEngine === "ok";

    res.status(allOk ? 200 : 503).json({
      status: allOk ? "ok" : "degraded",
      connectivity,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Connectivity test failed" });
  }
});

app.post("/extract", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }
    const connectivity = await runConnectivityTest();
    const extraction = await extractStructure(text);
    const files = generateMarkdownFiles(text, extraction);

    res.json({
      connectivity,
      extraction,
      files,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.post("/export/validate", async (req, res) => {
  try {
    const { vaultPath } = req.body as { vaultPath?: string };

    if (!vaultPath || !vaultPath.trim()) {
      return res.status(400).json({ error: "vaultPath is required" });
    }

    const normalizedVaultPath = vaultPath.trim();
    const probeDir = path.join(normalizedVaultPath, ".ase-write-check");
    const probeFile = path.join(probeDir, `${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`);

    await fs.mkdir(probeDir, { recursive: true });
    await fs.writeFile(probeFile, "ase-write-check", "utf-8");
    await fs.unlink(probeFile);

    res.json({
      ok: true,
      vaultPath: normalizedVaultPath,
      message: "路径可访问且可写，可执行导出。",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(buildExportErrorPayload(error, (req.body as { vaultPath?: string }).vaultPath ?? ""));
  }
});

app.post("/export", async (req, res) => {
  try {
    const { text, vaultPath } = req.body as { text?: string; vaultPath?: string };

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    if (!vaultPath || !vaultPath.trim()) {
      return res.status(400).json({ error: "vaultPath is required" });
    }

    const normalizedVaultPath = vaultPath.trim();

    const connectivity = await runConnectivityTest();
    const extraction = await extractStructure(text);
    const files = generateMarkdownFiles(text, extraction);

    const dirs = ["styles", "artists", "periods", "museums", "notes"];
    await Promise.all(dirs.map((dir) => fs.mkdir(path.join(normalizedVaultPath, dir), { recursive: true })));

    const notePath = path.join(normalizedVaultPath, "notes", files.note.filename);
    await fs.writeFile(notePath, files.note.content, "utf-8");

    const entityWrites = await Promise.all(
      files.entities.map(async (entity) => {
        const entityDir = entityDirMap[entity.type as keyof typeof entityDirMap];
        const entityPath = path.join(normalizedVaultPath, entityDir, entity.filename);
        const status = await upsertEntityFile(entityPath, entity.content, files.note.filename);
        return { ...entity, path: entityPath, status };
      })
    );

    res.json({
      connectivity,
      extraction,
      files,
      exported: {
        vaultPath: normalizedVaultPath,
        notePath,
        entities: entityWrites,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(buildExportErrorPayload(error, (req.body as { vaultPath?: string }).vaultPath ?? ""));
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
