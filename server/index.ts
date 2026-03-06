import express from "express";
import cors from "cors";
import fs from "node:fs/promises";
import path from "node:path";
import { extractStructure, runConnectivityTest } from "./extract";
import { generateMarkdownFiles } from "./markdown";
import { mergeEntityMarkdown } from "./entity-merge";

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

async function upsertMarkdownFile(
  filePath: string,
  content: string
): Promise<"created" | "updated"> {
  try {
    console.log("准备读取已存在文件:", filePath);
    const existing = await fs.readFile(filePath, "utf-8");
    const merged = mergeEntityMarkdown(existing, content);

    if (merged === existing) {
      console.log("检测到内容无变化，跳过写入:", filePath);
      return "updated";
    }

    await fs.writeFile(filePath, merged, "utf-8");
    console.log("文件已成功合并写入:", filePath);
    return "updated";
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("读取或合并文件失败:", { filePath, error });
      throw error;
    }

    console.log("准备创建新文件:", filePath);
    await fs.writeFile(filePath, content, "utf-8");
    console.log("文件已成功写入:", filePath);
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
    console.log('Export request received:', {
      textLength: text.length,
      vaultPath: normalizedVaultPath
    });

    const connectivity = await runConnectivityTest();
    const extraction = await extractStructure(text);
    console.log('Extraction result:', {
      styles: extraction.styles,
      artists: extraction.artists,
      periods: extraction.periods,
      relationships: extraction.relationships.length
    });

    const files = generateMarkdownFiles(text, extraction);
    console.log('Generated files:', {
      note: files.note.filename,
      entities: files.entities.map(e => ({ type: e.type, filename: e.filename }))
    });

    const dirs = ["styles", "artists", "periods", "museums", "notes"];
    await Promise.all(dirs.map((dir) => fs.mkdir(path.join(normalizedVaultPath, dir), { recursive: true })));

    const notePath = path.join(normalizedVaultPath, "notes", files.note.filename);
    console.log("准备写入路径:", notePath);
    const noteStatus = await upsertMarkdownFile(notePath, files.note.content);
    console.log("Note processed:", { path: notePath, status: noteStatus });

    const entityWrites = await Promise.all(
      files.entities.map(async (entity) => {
        const entityDir = entityDirMap[entity.type as keyof typeof entityDirMap];
        const entityPath = path.join(normalizedVaultPath, entityDir, entity.filename);
        console.log('Processing entity:', {
          path: entityPath,
          content: entity.content
        });
        const status = await upsertMarkdownFile(entityPath, entity.content);
        console.log('Entity processed:', { path: entityPath, status });
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
        noteStatus,
        entities: entityWrites,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json(buildExportErrorPayload(error, (req.body as { vaultPath?: string }).vaultPath ?? ""));
  }
});

app.post("/export/obsidian-script", async (req, res) => {
  try {
    const { text, vaultName = "Art Thinking Vault" } = req.body as { text?: string; vaultName?: string };

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    console.log('Obsidian script export request received:', {
      textLength: text.length,
      vaultName
    });

    const connectivity = await runConnectivityTest();
    const extraction = await extractStructure(text);
    const files = generateMarkdownFiles(text, extraction);

    // 生成 MCP Obsidian 脚本
    let script = `# Obsidian 导入脚本\n\nmcp\n`;

    // 处理笔记文件
    script += `mcp_mcp-obsidian_create-note {\n`;
    script += `  "vault": "${vaultName}",\n`;
    script += `  "filename": "${files.note.filename}",\n`;
    script += `  "folder": "notes",\n`;
    script += `  "content": "${files.note.content.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"\n`;
    script += `}\n\n`;

    // 处理实体文件
    for (const entity of files.entities) {
      const entityDir = entityDirMap[entity.type as keyof typeof entityDirMap];
      script += `mcp_mcp-obsidian_edit-note {\n`;
      script += `  "vault": "${vaultName}",\n`;
      script += `  "filename": "${entity.filename}",\n`;
      script += `  "folder": "${entityDir}",\n`;
      script += `  "operation": "replace",\n`;
      script += `  "content": "${entity.content.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"\n`;
      script += `}\n\n`;
    }

    res.json({
      connectivity,
      extraction,
      files,
      script
    });
  } catch (error) {
    console.error('Obsidian script export error:', error);
    res.status(500).json({ error: 'Failed to generate Obsidian script' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
