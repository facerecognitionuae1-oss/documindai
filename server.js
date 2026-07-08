const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const { Pool } = require("pg");
const { randomUUID } = require("crypto");
const { spawnSync } = require("child_process");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const { toFile } = require("openai");
const { zodTextFormat } = require("openai/helpers/zod");
const { z } = require("zod");
const pptxgen = require("pptxgenjs");

dotenv.config();

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 50,
    fileSize: 50 * 1024 * 1024
  }
});

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "workspace.db");
const LEGACY_CASES_PATH = path.join(DATA_DIR, "cases.json");
const LEGACY_USERS_PATH = path.join(DATA_DIR, "users.json");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const GENERATED_DIR = path.join(DATA_DIR, "generated");
const OUTPUTS_DIR = path.join(DATA_DIR, "outputs");
const HAS_OPENAI_KEY = Boolean(process.env.OPENAI_API_KEY);
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/+$/, "");
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1:8b";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const ANTHROPIC_BASE_URL = (process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com").replace(/\/+$/, "");
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.5";
const LLM_PROVIDER = normalizeProvider(process.env.LLM_PROVIDER);
const ACTIVE_PROVIDER = resolveActiveProvider();
const HAS_ANTHROPIC_KEY = Boolean(ANTHROPIC_API_KEY);
const HAS_CONFIGURED_PROVIDER = canUseProvider(ACTIVE_PROVIDER);
const SESSION_SECRET = process.env.SESSION_SECRET || "local-dev-session-secret";
const DATABASE_URL = process.env.DATABASE_URL || "";
const USE_POSTGRES = Boolean(DATABASE_URL);
const DEFAULT_ADMIN_EMAIL = normalizeEmail(process.env.ADMIN_EMAIL || "admin@documentintel.local");
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMe123!";
const SUPPORTED_EXTENSIONS = new Set([
  ".pdf", ".doc", ".docx", ".txt", ".rtf", ".md", ".csv", ".xlsx", ".xls", ".png", ".jpg", ".jpeg", ".tif", ".tiff"
]);
const CONFIDENCE_LEVELS = ["confirmed", "probable", "possible", "insufficient_evidence"];
const WORKSPACE_TYPES = ["general"];
const WORKSPACE_LANGUAGES = ["en", "ar"];
const OPENAI_MODELS = ["gpt-5.5", "gpt-5.4-mini", "gpt-5.4-nano", "gpt-5.1", "gpt-4.1"];
const ANTHROPIC_MODELS = ["claude-opus-4-1-20250805", "claude-sonnet-4-20250514", "claude-3-7-sonnet-20250219"];
const OLLAMA_MODELS = ["qwen3:8b", "qwen3:14b", "qwen3:30b", "qwen3:32b", "qwen2.5:7b", "qwen2.5:14b", "qwen2.5:32b", "llama3.1:8b", "llama3.1:70b"];

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
fs.mkdirSync(GENERATED_DIR, { recursive: true });
fs.mkdirSync(OUTPUTS_DIR, { recursive: true });

const client = HAS_OPENAI_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const sqliteDb = USE_POSTGRES ? null : new Database(DB_PATH);
const pgPool = USE_POSTGRES ? new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined
}) : null;
const jobs = new Map();

const analysisSchema = z.object({
  mode: z.enum(["guarded", "unguarded"]),
  workspace_type: z.enum(WORKSPACE_TYPES),
  workspace_language: z.enum(WORKSPACE_LANGUAGES),
  summary: z.string(),
  working_theory: z.string(),
  overall_confidence: z.enum(CONFIDENCE_LEVELS),
  uncertainty_note: z.string(),
  findings: z.array(
    z.object({
      title: z.string(),
      detail: z.string(),
      confidence: z.enum(CONFIDENCE_LEVELS),
      source_file: z.string(),
      source_excerpt: z.string(),
      citation_reference: z.string()
    })
  ).max(8),
  evidence: z.array(
    z.object({
      claim: z.string(),
      importance: z.string(),
      source_file: z.string(),
      source_excerpt: z.string(),
      confidence: z.enum(CONFIDENCE_LEVELS),
      citation_reference: z.string()
    })
  ).max(8),
  contradictions: z.array(
    z.object({
      issue: z.string(),
      why_it_matters: z.string(),
      source_file_a: z.string(),
      source_excerpt_a: z.string(),
      source_file_b: z.string(),
      source_excerpt_b: z.string(),
      severity: z.enum(["critical", "moderate", "minor"])
    })
  ).max(6),
  entities: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      significance: z.string()
    })
  ).max(12),
  timeline: z.array(
    z.object({
      date_or_period: z.string(),
      event: z.string(),
      source_file: z.string()
    })
  ).max(10),
  strengths: z.array(z.string()).max(6),
  weaknesses: z.array(z.string()).max(6),
  opportunities: z.array(z.string()).max(6),
  risks: z.array(z.string()).max(6),
  development_priorities: z.array(
    z.object({
      area: z.string(),
      action: z.string(),
      urgency: z.enum(["high", "medium", "low"]),
      citation_reference: z.string()
    })
  ).max(6),
  scorecard: z.array(
    z.object({
      label: z.string(),
      score: z.number().min(0).max(100),
      rationale: z.string()
    })
  ).max(6),
  open_questions: z.array(z.string()).max(8),
  suggested_questions: z.array(z.string()).max(8),
  warnings: z.array(z.string()).max(6)
});

const answerSchema = z.object({
  mode: z.enum(["guarded", "unguarded"]),
  workspace_type: z.enum(WORKSPACE_TYPES),
  workspace_language: z.enum(WORKSPACE_LANGUAGES),
  short_answer: z.string(),
  overall_confidence: z.enum(CONFIDENCE_LEVELS),
  uncertainty_note: z.string(),
  verification_note: z.string(),
  key_points: z.array(
    z.object({
      point: z.string(),
      evidence_strength: z.enum(CONFIDENCE_LEVELS),
      citation_reference: z.string()
    })
  ).max(4),
  supporting_points: z.array(
    z.object({
      point: z.string(),
      source_file: z.string(),
      source_excerpt: z.string(),
      evidence_strength: z.enum(CONFIDENCE_LEVELS),
      citation_reference: z.string()
    })
  ).max(6),
  counterpoints: z.array(z.string()).max(5),
  speculative_leads: z.array(z.string()).max(5),
  next_questions: z.array(z.string()).max(5)
});

const agentTaskSchema = z.object({
  task_title: z.string(),
  summary: z.string(),
  output_filename: z.string(),
  output_markdown: z.string()
});

const guardedSystemPrompt = `
You are the UAEICP Employee Intelligence Assistant operating in Guarded Mode.
Your posture is conservative, evidence-bound, citation-heavy, and review-ready.
Only state what is directly supported by the provided documents.
Distinguish confirmed facts from inference.
If evidence is weak, conflicting, or missing, say so clearly.
Do not speculate about motives, intent, or unstated facts.
Every important point must be grounded in the uploaded files.
Use confidence labels only from: Confirmed, Probable, Possible, Insufficient Evidence.
`;

const unguardedSystemPrompt = `
You are the UAEICP Employee Intelligence Assistant operating in Unguarded Mode.
Your posture is investigative, pattern-seeking, and hypothesis-driven.
You may propose plausible theories, hidden relationships, and implications suggested by the documents.
All speculative claims must be clearly framed as hypotheses.
Keep one foot in the evidence while exploring beyond it.
Every important point should still tie back to the uploaded files whenever possible.
Speculative ideas must be labeled and separated from verified findings.
`;

const qaInstructions = `
Answer the user's question like a careful UAEICP employee-support analyst.
Use the file search tool results to ground the answer in the uploaded workspace materials.
Include source file names and short excerpts in supporting points.
Keep the main answer crisp and readable.
Write the direct answer in 2 to 4 sentences max.
Put the rest of the explanation into short key points, not a long paragraph.
If the user asks for edits, drafting, legality, compliance, missing clauses, policy fit, or improvements, answer like a document-review assistant:
- identify the exact issue
- explain why it matters operationally or procedurally
- propose improved wording or a concrete next step
- clearly label what requires human legal/supervisor review
For every key point and supporting point, include a citation_reference using a compact format like "Document.pdf, p. 4" or "Document.pdf, section 2.1".
Use only these confidence levels: confirmed, probable, possible, insufficient_evidence.
If evidence is missing or weak, emphasize that in uncertainty_note and verification_note.
Prefer insufficient_evidence over guessing.
If the documents do not support a conclusion, say that directly.
`;

const languageInstructions = {
  en: "Write the final answer in English only.",
  ar: "Write the final answer in Arabic only. Keep citations and references readable even when file names are in English."
};

app.use(express.json({ limit: "2mb" }));
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    }
  })
);
app.use(express.static(PUBLIC_DIR));
app.use("/generated", express.static(GENERATED_DIR));
app.use("/outputs", express.static(OUTPUTS_DIR));

app.get("/api/health", async (_req, res) => {
  const admin = await dbGet("SELECT email FROM users WHERE role = 'admin' LIMIT 1");
  res.json({
    ok: true,
    configured: HAS_CONFIGURED_PROVIDER,
    provider: ACTIVE_PROVIDER,
    model: defaultModelForProvider(ACTIVE_PROVIDER),
    ollamaBaseUrl: ACTIVE_PROVIDER === "ollama" ? OLLAMA_BASE_URL : null,
    defaults: {
      provider: ACTIVE_PROVIDER,
      model: defaultModelForProvider(ACTIVE_PROVIDER)
    },
    providerOptions: [
      { value: "openai", label: "OpenAI", enabled: HAS_OPENAI_KEY, models: OPENAI_MODELS },
      { value: "anthropic", label: "Anthropic", enabled: HAS_ANTHROPIC_KEY, models: ANTHROPIC_MODELS },
      { value: "ollama", label: "Ollama", enabled: true, models: OLLAMA_MODELS }
    ],
    adminEmail: admin ? admin.email : DEFAULT_ADMIN_EMAIL,
    persistence: USE_POSTGRES ? "postgresql" : "sqlite",
    backgroundJobs: true
  });
});

app.get("/api/auth/me", requireUser, (req, res) => {
  res.json({ user: publicUser(req.currentUser) });
});

app.post("/api/auth/login", async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");
  const user = await findUserByEmail(email);

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  req.session.userId = user.id;
  res.json({ user: publicUser(user) });
});

app.post("/api/auth/logout", requireUser, (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.post("/api/auth/profile", requireUser, async (req, res) => {
  const name = String(req.body.name || "").trim();
  const password = String(req.body.password || "");

  if (!name) {
    return res.status(400).json({ error: "Name is required." });
  }

  if (password && password.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters." });
  }

  const updatedUser = {
    ...req.currentUser,
    name,
    passwordHash: password ? bcrypt.hashSync(password, 10) : req.currentUser.passwordHash
  };

  await upsertUser(updatedUser);
  res.json({ user: publicUser(updatedUser) });
});

app.get("/api/users", requireAdmin, async (_req, res) => {
  res.json({ users: (await listUsers()).map(publicUser) });
});

app.post("/api/users", requireAdmin, async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");
  const role = req.body.role === "admin" ? "admin" : "user";

  if (!name || !email || password.length < 8) {
    return res.status(400).json({ error: "Name, email, and a password of at least 8 characters are required." });
  }

  if (await findUserByEmail(email)) {
    return res.status(409).json({ error: "A user with that email already exists." });
  }

  const user = {
    id: randomUUID(),
    name,
    email,
    role,
    passwordHash: bcrypt.hashSync(password, 10),
    createdAt: new Date().toISOString()
  };

  await upsertUser(user);
  res.status(201).json({ user: publicUser(user) });
});

app.get("/api/cases", requireUser, async (req, res) => {
  const cases = await listCasesForUser(req.currentUser);
  res.json({ cases: await Promise.all(cases.map(caseSummary)) });
});

app.get("/api/cases/:id", requireUser, async (req, res) => {
  const record = await getCaseForUser(req.params.id, req.currentUser);
  if (!record) {
    return res.status(404).json({ error: "Analysis workspace not found." });
  }

  res.json(await sanitizeCase(record));
});

app.get("/api/cases/:id/export.md", requireUser, async (req, res) => {
  const record = await getCaseForUser(req.params.id, req.currentUser);
  if (!record) {
    return res.status(404).json({ error: "Analysis workspace not found." });
  }

  const markdown = await buildWorkspaceMarkdown(record);
  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${safeFilename(record.title || record.id)}.md"`);
  res.send(markdown);
});

app.post("/api/cases", requireUser, upload.array("documents", 50), async (req, res) => {
  if (!HAS_CONFIGURED_PROVIDER) {
    return res.status(400).json({ error: "No LLM provider is configured. Add OPENAI_API_KEY or set LLM_PROVIDER=ollama in .env." });
  }

  const files = req.files || [];
  const mode = normalizeMode(req.body.mode);
  const analysisDepth = normalizeAnalysisDepth(req.body.analysisDepth);
  const workspaceType = normalizeWorkspaceType(req.body.workspaceType);
  const workspaceLanguage = normalizeWorkspaceLanguage(req.body.workspaceLanguage);
  const llmProvider = normalizeLlmProvider(req.body.llmProvider);
  const llmModel = normalizeLlmModel(llmProvider, req.body.llmModel);
  const intakeText = normalizeText(req.body.intakeText || "");
  const title = sanitizeTitle(req.body.title);
  if (!canUseProvider(llmProvider)) {
    return res.status(400).json({ error: providerUnavailableMessage(llmProvider) });
  }
  if (!files.length && !intakeText) {
    return res.status(400).json({ error: "Upload documents or provide a written project brief." });
  }

  const validation = validateFiles(files);
  if (validation.rejected.length) {
    return res.status(400).json({ error: "Some files are unsupported for ingestion.", rejected: validation.rejected });
  }

  const tempFiles = persistTempFiles(validation.accepted);
  if (intakeText) {
    tempFiles.push(createTextTempFile(title, intakeText));
  }
  const job = createJob({
    type: "create_case",
    ownerId: req.currentUser.id,
    ownerRole: req.currentUser.role,
    initialStep: "Queued for document ingestion",
    runner: async (jobRef) => {
      jobRef.step = "Preparing upload metadata";
      const createdCase = await createCaseWithAnalysis({
        title,
        mode,
        analysisDepth,
        workspaceType,
        workspaceLanguage,
        llmProvider,
        llmModel,
        tempFiles,
        owner: req.currentUser,
        jobRef
      });
      cleanupTempFiles(tempFiles);
      return { caseId: createdCase.id };
    }
  });

  res.status(202).json({ jobId: job.id, status: job.status });
});

app.post("/api/cases/:id/analyze", requireUser, async (req, res) => {
  if (!HAS_CONFIGURED_PROVIDER) {
    return res.status(400).json({ error: "No LLM provider is configured. Add OPENAI_API_KEY or set LLM_PROVIDER=ollama in .env." });
  }

  const record = await getCaseForUser(req.params.id, req.currentUser);
  if (!record) {
    return res.status(404).json({ error: "Analysis workspace not found." });
  }

  const mode = normalizeMode(req.body.mode || record.mode);
  const analysisDepth = normalizeAnalysisDepth(req.body.analysisDepth || record.analysisDepth);
  const workspaceType = normalizeWorkspaceType(req.body.workspaceType || record.workspaceType);
  const workspaceLanguage = normalizeWorkspaceLanguage(req.body.workspaceLanguage || record.workspaceLanguage);
  const llmProvider = normalizeLlmProvider(req.body.llmProvider || record.llmProvider);
  const llmModel = normalizeLlmModel(llmProvider, req.body.llmModel || record.llmModel);
  if (!canUseProvider(llmProvider)) {
    return res.status(400).json({ error: providerUnavailableMessage(llmProvider) });
  }
  const job = createJob({
    type: "reanalyze_case",
    ownerId: req.currentUser.id,
    ownerRole: req.currentUser.role,
    initialStep: "Queued for re-analysis",
    runner: async (jobRef) => {
      jobRef.step = "Checking cached analysis";
      record.analysisCache = record.analysisCache || {};
      const cacheKey = buildAnalysisCacheKey(llmProvider, llmModel, workspaceType, workspaceLanguage, mode, analysisDepth);
      if (record.analysisCache[cacheKey]) {
        record.mode = mode;
        record.analysisDepth = analysisDepth;
        record.workspaceType = workspaceType;
        record.workspaceLanguage = workspaceLanguage;
        record.llmProvider = llmProvider;
        record.llmModel = llmModel;
        record.analysis = record.analysisCache[cacheKey];
        record.updatedAt = new Date().toISOString();
        await saveCaseRecord(record);
        return { caseId: record.id, cached: true };
      }

      jobRef.step = "Running grounded re-analysis";
      const analysis = await runCaseAnalysis(record.vectorStoreId, mode, analysisDepth, workspaceType, workspaceLanguage, record.files, llmProvider, llmModel);
      record.mode = mode;
      record.analysisDepth = analysisDepth;
      record.workspaceType = workspaceType;
      record.workspaceLanguage = workspaceLanguage;
      record.llmProvider = llmProvider;
      record.llmModel = llmModel;
      record.analysis = analysis;
      record.analysisCache = { ...(record.analysisCache || {}), [cacheKey]: analysis };
      record.updatedAt = new Date().toISOString();
      await saveCaseRecord(record);
      return { caseId: record.id, cached: false };
    }
  });

  res.status(202).json({ jobId: job.id, status: job.status });
});

app.get("/api/jobs/:id", requireUser, (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job not found." });
  }

  if (req.currentUser.role !== "admin" && job.ownerId !== req.currentUser.id) {
    return res.status(403).json({ error: "Not authorized for this job." });
  }

  res.json(job);
});

app.post("/api/cases/:id/questions", requireUser, async (req, res) => {
  if (!HAS_CONFIGURED_PROVIDER) {
    return res.status(400).json({ error: "No LLM provider is configured. Add OPENAI_API_KEY or set LLM_PROVIDER=ollama in .env." });
  }

  const record = await getCaseForUser(req.params.id, req.currentUser);
  if (!record) {
    return res.status(404).json({ error: "Analysis workspace not found." });
  }

  const question = String(req.body.question || "").trim();
  const mode = normalizeMode(req.body.mode || record.mode);
  const responseLanguage = detectPreferredLanguage(question, req.body.workspaceLanguage || record.workspaceLanguage);
  if (!question) {
    return res.status(400).json({ error: "Enter a question before sending." });
  }

  try {
    const llmProvider = normalizeLlmProvider(req.body.llmProvider || record.llmProvider);
    const llmModel = normalizeLlmModel(llmProvider, req.body.llmModel || record.llmModel);
    if (!canUseProvider(llmProvider)) {
      return res.status(400).json({ error: providerUnavailableMessage(llmProvider) });
    }
    const cacheKey = buildAnswerCacheKey(mode, record.analysisDepth, record.workspaceType, responseLanguage, llmProvider, llmModel, question);
    record.answerCache = record.answerCache || {};
    if (record.answerCache[cacheKey]) {
      return res.json({ ...record.answerCache[cacheKey], cached: true });
    }

    const answer = await answerCaseQuestion(record.vectorStoreId, mode, record.analysisDepth, record.workspaceType, responseLanguage, question, record.files || [], llmProvider, llmModel);
    const message = {
      id: randomUUID(),
      askedAt: new Date().toISOString(),
      mode,
      llmProvider,
      llmModel,
      question,
      answer
    };
    record.answerCache[cacheKey] = message;
    record.qa = [message, ...(record.qa || [])].slice(0, 40);
    record.updatedAt = new Date().toISOString();
    await saveCaseRecord(record);

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: formatError(error) });
  }
});

app.post("/api/cases/:id/tasks", requireUser, async (req, res) => {
  if (!HAS_CONFIGURED_PROVIDER) {
    return res.status(400).json({ error: "No LLM provider is configured. Add OPENAI_API_KEY or set LLM_PROVIDER=ollama in .env." });
  }

  const record = await getCaseForUser(req.params.id, req.currentUser);
  if (!record) {
    return res.status(404).json({ error: "Analysis workspace not found." });
  }

  const title = sanitizeTaskTitle(req.body.title);
  const instructions = normalizeText(req.body.instructions || "");
  const requestedFilename = String(req.body.outputFilename || "").trim();
  const outputFormat = normalizeTaskOutputFormat(req.body.outputFormat);
  const workspaceLanguage = normalizeWorkspaceLanguage(req.body.workspaceLanguage || record.workspaceLanguage);
  const requestedProvider = req.body.llmProvider || (outputFormat === "pptx" && HAS_ANTHROPIC_KEY ? "anthropic" : record.llmProvider);
  const llmProvider = normalizeLlmProvider(requestedProvider);
  const llmModel = normalizeLlmModel(llmProvider, req.body.llmModel || record.llmModel);
  if (!instructions) {
    return res.status(400).json({ error: "Enter task instructions before launching the agent." });
  }
  if (!canUseProvider(llmProvider)) {
    return res.status(400).json({ error: providerUnavailableMessage(llmProvider) });
  }

  const task = {
    id: randomUUID(),
    caseId: record.id,
    title,
    instructions,
    outputFormat,
    outputFilename: requestedFilename || "",
    outputPath: "",
    outputUrl: "",
    outputSummary: "",
    llmProvider,
    llmModel,
    status: "queued",
    createdBy: req.currentUser.email,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await insertTask(task);

  const job = createJob({
    type: "agent_task",
    ownerId: req.currentUser.id,
    ownerRole: req.currentUser.role,
    initialStep: "Queued for agent execution",
    runner: async (jobRef) => {
      try {
        await updateTask({ ...task, status: "running", updatedAt: new Date().toISOString() });
        const result = await generateWorkspaceTask({
          record,
          title,
          instructions,
          requestedFilename,
          outputFormat,
          workspaceLanguage,
          llmProvider,
          llmModel,
          requestedBy: req.currentUser.email,
          jobRef
        });
        await updateTask({
          ...task,
          title: result.taskTitle,
          outputFilename: result.outputFilename,
          outputPath: result.outputPath,
          outputUrl: result.outputUrl,
          outputSummary: result.summary,
          status: "completed",
          updatedAt: new Date().toISOString()
        });
        record.updatedAt = new Date().toISOString();
        await saveCaseRecord(record);
        return { caseId: record.id, taskId: task.id };
      } catch (error) {
        await updateTask({ ...task, status: "failed", updatedAt: new Date().toISOString() });
        throw error;
      }
    }
  });

  res.status(202).json({ jobId: job.id, taskId: task.id, status: job.status });
});

app.post("/api/cases/:id/archive", requireUser, async (req, res) => {
  const record = await getCaseForUser(req.params.id, req.currentUser);
  if (!record) {
    return res.status(404).json({ error: "Analysis workspace not found." });
  }

  record.status = record.status === "archived" ? "ready" : "archived";
  record.updatedAt = new Date().toISOString();
  await saveCaseRecord(record);
  res.json({ ok: true, case: await sanitizeCase(record) });
});

app.delete("/api/cases/:id", requireUser, async (req, res) => {
  const record = await getCaseForUser(req.params.id, req.currentUser);
  if (!record) {
    return res.status(404).json({ error: "Analysis workspace not found." });
  }

  cleanupGeneratedVisuals(record.visuals || []);
  cleanupTaskOutputs(await listTasks(record.id));
  await dbRun("DELETE FROM reviews WHERE case_id = ?", [record.id]);
  await dbRun("DELETE FROM tasks WHERE case_id = ?", [record.id]);
  await dbRun("DELETE FROM cases WHERE id = ?", [record.id]);
  res.json({ ok: true, deletedId: record.id });
});

app.post("/api/cases/:id/reviews", requireUser, async (req, res) => {
  const record = await getCaseForUser(req.params.id, req.currentUser);
  if (!record) {
    return res.status(404).json({ error: "Analysis workspace not found." });
  }

  const status = ["reviewed", "needs_followup", "verified"].includes(req.body.status) ? req.body.status : "reviewed";
  const note = String(req.body.note || "").trim();
  const review = {
    id: randomUUID(),
    caseId: record.id,
    targetType: String(req.body.targetType || "case"),
    targetId: String(req.body.targetId || record.id),
    status,
    note,
    createdBy: req.currentUser.email,
    createdAt: new Date().toISOString()
  };
  await insertReview(review);
  res.status(201).json({ review });
});

app.post("/api/cases/:id/visuals", requireUser, async (req, res) => {
  const record = await getCaseForUser(req.params.id, req.currentUser);
  if (!record) {
    return res.status(404).json({ error: "Analysis workspace not found." });
  }

  if (!HAS_OPENAI_KEY || !client) {
    return res.status(400).json({ error: "Image generation requires OPENAI_API_KEY because visuals currently use OpenAI image generation." });
  }

  const visualType = normalizeVisualType(req.body.visualType);
  const prompt = String(req.body.prompt || "").trim();
  const aspectRatio = normalizeAspectRatio(req.body.aspectRatio);
  const sourceVisualId = String(req.body.sourceVisualId || "").trim();
  if (!prompt) {
    return res.status(400).json({ error: "Enter a visual request before generating." });
  }

  const job = createJob({
    type: "generate_visual",
    ownerId: req.currentUser.id,
    ownerRole: req.currentUser.role,
    initialStep: "Queued for visual concept generation",
    runner: async (jobRef) => {
      jobRef.step = "Preparing grounded visual brief";
      const visual = await generateWorkspaceVisual({
        record,
        visualType,
        prompt,
        aspectRatio,
        sourceVisualId,
        requestedBy: req.currentUser.email,
        jobRef
      });
      record.visuals = [visual, ...(record.visuals || [])].slice(0, 30);
      record.updatedAt = new Date().toISOString();
      await saveCaseRecord(record);
      return { caseId: record.id, visualId: visual.id };
    }
  });

  res.status(202).json({ jobId: job.id, status: job.status });
});

bootstrap().catch((error) => {
  console.error("Failed to start Document Analysis Workspace:", error);
  process.exit(1);
});

async function bootstrap() {
  await initDb();
  await migrateLegacyJson();
  await ensureSeedAdmin();
  app.listen(PORT, () => {
    console.log(`Document Analysis Workspace running at http://localhost:${PORT}`);
  });
}

async function dbExec(sql) {
  if (USE_POSTGRES) {
    await pgPool.query(sql);
    return;
  }
  sqliteDb.exec(sql);
}

async function dbGet(sql, params = []) {
  if (USE_POSTGRES) {
    const converted = convertSqlForPg(sql, params);
    const result = await pgPool.query(converted.text, converted.values);
    return result.rows[0];
  }
  return runSqliteStatement("get", sql, params);
}

async function dbAll(sql, params = []) {
  if (USE_POSTGRES) {
    const converted = convertSqlForPg(sql, params);
    const result = await pgPool.query(converted.text, converted.values);
    return result.rows;
  }
  return runSqliteStatement("all", sql, params);
}

async function dbRun(sql, params = []) {
  if (USE_POSTGRES) {
    const converted = convertSqlForPg(sql, params);
    return pgPool.query(converted.text, converted.values);
  }
  return runSqliteStatement("run", sql, params);
}

function runSqliteStatement(method, sql, params) {
  const statement = sqliteDb.prepare(sql);
  if (Array.isArray(params)) {
    return statement[method](...params);
  }
  if (params && typeof params === "object") {
    return statement[method](params);
  }
  if (typeof params === "undefined") {
    return statement[method]();
  }
  return statement[method](params);
}

function convertSqlForPg(sql, params) {
  if (Array.isArray(params)) {
    let index = 0;
    return {
      text: sql.replace(/\?/g, () => `$${++index}`),
      values: params
    };
  }

  const values = [];
  const seen = new Map();
  const text = sql.replace(/@([a-zA-Z0-9_]+)/g, (_match, key) => {
    if (!seen.has(key)) {
      values.push(params[key]);
      seen.set(key, values.length);
    }
    return `$${seen.get(key)}`;
  });
  return { text, values };
}

async function generateWorkspaceTask({
  record,
  title,
  instructions,
  requestedFilename,
  outputFormat,
  workspaceLanguage,
  llmProvider,
  llmModel,
  requestedBy,
  jobRef
}) {
  jobRef.step = "Reviewing workspace context";
  const resolvedLanguage = normalizeWorkspaceLanguage(workspaceLanguage);
  const desiredFilename = requestedFilename || title || "agent-output";
  const result = llmProvider === "ollama"
    ? await generateWorkspaceTaskWithOllama(record, title, instructions, desiredFilename, outputFormat, resolvedLanguage, llmModel)
    : llmProvider === "anthropic"
      ? await generateWorkspaceTaskWithAnthropic(record, title, instructions, desiredFilename, outputFormat, resolvedLanguage, llmModel)
      : await generateWorkspaceTaskWithOpenAI(record, title, instructions, desiredFilename, outputFormat, resolvedLanguage, llmModel);

  jobRef.step = "Writing output file";
  const safeBase = safeFilename(result.output_filename || desiredFilename || "agent-output").replace(/\.[^.]+$/, "");
  const extension = outputFormat === "json" ? ".json" : outputFormat === "txt" ? ".txt" : outputFormat === "pptx" ? ".pptx" : ".md";
  const finalFilename = `${record.id}-${Date.now()}-${safeBase}${extension}`;
  const outputPath = path.join(OUTPUTS_DIR, finalFilename);
  if (outputFormat === "pptx") {
    await writePowerPointDeck(outputPath, {
      title: result.task_title || title,
      summary: result.summary,
      markdown: result.output_markdown,
      workspaceTitle: record.title,
      requestedBy,
      analysis: record.analysis || {}
    });
  } else {
    const outputText = formatTaskOutputContent(outputFormat, result.output_markdown, result.summary, {
      taskTitle: result.task_title || title,
      workspaceTitle: record.title,
      requestedBy
    });
    fs.writeFileSync(outputPath, outputText, "utf8");
  }

  return {
    taskTitle: normalizeText(result.task_title || title),
    summary: normalizeText(result.summary),
    outputFilename: finalFilename,
    outputPath,
    outputUrl: `/outputs/${encodeURIComponent(finalFilename)}`
  };
}

async function createCaseWithAnalysis({ title, mode, analysisDepth, workspaceType, workspaceLanguage, llmProvider, llmModel, tempFiles, owner, jobRef }) {
  const id = randomUUID();
  let vectorStore = null;
  let uploadedFiles = [];

  if (ACTIVE_PROVIDER === "openai") {
    jobRef.step = "Creating vector store";
    vectorStore = await client.vectorStores.create({
      name: title,
      expires_after: { anchor: "last_active_at", days: 7 }
    });

    jobRef.step = "Uploading files";
    uploadedFiles = await Promise.all(
      tempFiles.map(async (file) => client.files.create({
        file: await toFile(fs.readFileSync(file.tempPath), file.originalname, { type: file.mimetype }),
        purpose: "user_data"
      }))
    );

    jobRef.step = "Indexing retrieval corpus";
    await client.vectorStores.fileBatches.createAndPoll(vectorStore.id, {
      file_ids: uploadedFiles.map((file) => file.id)
    });
  }

  jobRef.step = "Extracting ingestion metadata";
  const fileSummaries = [];
  let ocrFallbackCount = 0;
  for (let index = 0; index < tempFiles.length; index += 1) {
    const tempFile = tempFiles[index];
    const extraction = await extractDocumentText(tempFile);
    if (extraction.method.includes("ocr")) {
      ocrFallbackCount += 1;
    }
    fileSummaries.push({
      id: uploadedFiles[index]?.id || `local-${index + 1}`,
      name: tempFile.originalname,
      size: tempFile.size,
      type: tempFile.mimetype || "application/octet-stream",
      extension: path.extname(tempFile.originalname).toLowerCase(),
      extractionPreview: extraction.preview,
      extractionMethod: extraction.method,
      extractedText: extraction.text || extraction.preview || ""
    });
  }

  jobRef.step = "Running workspace analysis";
  const analysis = await runCaseAnalysis(vectorStore ? vectorStore.id : "", mode, analysisDepth, workspaceType, workspaceLanguage, fileSummaries, llmProvider, llmModel);
  const record = {
    id,
    title,
    mode,
    analysisDepth,
    workspaceType,
    workspaceLanguage,
    llmProvider,
    llmModel,
    status: "ready",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: owner.id,
    ownerEmail: owner.email,
    vectorStoreId: vectorStore ? vectorStore.id : "",
    files: fileSummaries,
    visuals: [],
    ingestion: {
      totalFiles: fileSummaries.length,
      supportedFiles: fileSummaries.length,
      rejectedFiles: [],
      formats: [...new Set(fileSummaries.map((file) => file.extension || "unknown"))],
      ocrFallbackCount
    },
    analysis,
    qa: [],
    analysisCache: { [buildAnalysisCacheKey(llmProvider, llmModel, workspaceType, workspaceLanguage, mode, analysisDepth)]: analysis },
    answerCache: {}
  };
  await saveCaseRecord(record);
  return record;
}

async function runCaseAnalysis(vectorStoreId, mode, analysisDepth, workspaceType, workspaceLanguage, files, llmProvider, llmModel) {
  if (llmProvider === "ollama") {
    return runCaseAnalysisWithOllama(mode, analysisDepth, workspaceType, workspaceLanguage, files, llmModel);
  }
  if (llmProvider === "anthropic") {
    return runCaseAnalysisWithAnthropic(mode, analysisDepth, workspaceType, workspaceLanguage, files, llmModel);
  }

  const fileNames = files.map((file) => file.name).join(", ");
  const depth = normalizeAnalysisDepth(analysisDepth);
  const resolvedWorkspaceType = normalizeWorkspaceType(workspaceType);
  const resolvedWorkspaceLanguage = normalizeWorkspaceLanguage(workspaceLanguage);
  const materialInstructions = getWorkspaceMaterialInstructions(files, resolvedWorkspaceLanguage);
  const maxResults = depth === "deep" ? 10 : 6;
  const effort = mode === "guarded"
    ? (depth === "deep" ? "medium" : "low")
    : (depth === "deep" ? "high" : "medium");
  const response = await client.responses.parse({
    model: llmModel,
    reasoning: { effort },
    input: [
      { role: "system", content: `${getModePrompt(mode)}\n${getWorkspaceTypeInstructions(resolvedWorkspaceType)}\n${materialInstructions}\n${getLanguageInstructions(resolvedWorkspaceLanguage)}`.trim() },
      {
        role: "user",
        content: `
Analyze this UAEICP employee workspace material set.

Materials in this workspace:
${fileNames}

Workspace type:
${resolvedWorkspaceType}

Workspace language:
${resolvedWorkspaceLanguage}

Return:
- a concise overall summary of what the document set is about
- a working review angle that explains what the materials collectively suggest for an employee reviewer
- an overall confidence level using only confirmed, probable, possible, insufficient_evidence
- an uncertainty note describing what still needs human verification
- the most important findings
- key evidence points
- contradictions or inconsistencies
- the most important entities
- a rough timeline
- clear points that are well supported
- document gaps and missing information
- improvement opportunities for clarity, completeness, wording, structure, and process
- legal, policy, compliance, and operational risks that require review
- action priorities
- scorecard using document clarity, completeness, policy/procedure alignment, evidence strength, legal/compliance review need, and action readiness
- open questions
- suggested follow-up questions
- warnings about missing evidence or ambiguity

If the workspace is mainly an employee-written brief or task note, make the analysis useful immediately:
- restate the request or issue clearly
- identify likely missing documents, data, approvals, or policy checks
- make action priorities practical, not generic
- use clear points, improvements, and suggested questions to move the employee forward
- suggest what document, memo, checklist, revised draft, or presentation the employee should generate next

Keep findings practical and grounded in the uploaded materials.
Every finding and evidence point must include a citation_reference and source excerpt.
Do not present legal conclusions as final legal advice. Label legal/compliance items as review points unless the uploaded documents directly prove them.
        `.trim()
      }
    ],
    tools: [{ type: "file_search", vector_store_ids: [vectorStoreId], max_num_results: maxResults }],
    include: ["file_search_call.results"],
    text: { format: zodTextFormat(analysisSchema, "document_workspace_analysis") }
  });

  return response.output_parsed;
}

async function answerCaseQuestion(vectorStoreId, mode, analysisDepth, workspaceType, workspaceLanguage, question, files = [], llmProvider, llmModel) {
  if (llmProvider === "ollama") {
    return answerCaseQuestionWithOllama(mode, analysisDepth, workspaceType, workspaceLanguage, question, files, llmModel);
  }
  if (llmProvider === "anthropic") {
    return answerCaseQuestionWithAnthropic(mode, analysisDepth, workspaceType, workspaceLanguage, question, files, llmModel);
  }

  const depth = normalizeAnalysisDepth(analysisDepth);
  const resolvedWorkspaceType = normalizeWorkspaceType(workspaceType);
  const resolvedWorkspaceLanguage = normalizeWorkspaceLanguage(workspaceLanguage);
  const materialInstructions = getWorkspaceMaterialInstructions(files, resolvedWorkspaceLanguage);
  const maxResults = depth === "deep" ? 8 : 5;
  const effort = mode === "guarded"
    ? (depth === "deep" ? "medium" : "low")
    : "medium";
  const response = await client.responses.parse({
    model: llmModel,
    reasoning: { effort },
    input: [
      { role: "system", content: `${getModePrompt(mode)}\n${qaInstructions}\n${getWorkspaceTypeQaInstructions(resolvedWorkspaceType)}\n${materialInstructions}\n${getLanguageInstructions(resolvedWorkspaceLanguage)}`.trim() },
      { role: "user", content: question }
    ],
    tools: [{ type: "file_search", vector_store_ids: [vectorStoreId], max_num_results: maxResults }],
    include: ["file_search_call.results"],
    text: { format: zodTextFormat(answerSchema, "document_workspace_answer") }
  });

  return response.output_parsed;
}

async function extractDocumentText(file) {
  const extension = path.extname(file.originalname).toLowerCase();
  if ([".txt", ".md", ".csv", ".rtf", ".pdf"].includes(extension)) {
    const result = spawnSync("python", [path.join(__dirname, "extract_local_text.py"), file.tempPath], { encoding: "utf8" });
    if (result.status === 0) {
      try {
        const parsed = JSON.parse(result.stdout.trim());
        return {
          method: parsed.method || "local_extract",
          preview: parsed.preview || "",
          text: parsed.text || parsed.preview || ""
        };
      } catch (_error) {
        return { method: "local_extract_parse_error", preview: "", text: "" };
      }
    }
  }

  if (HAS_OPENAI_KEY && [".png", ".jpg", ".jpeg", ".tif", ".tiff"].includes(extension)) {
    const base64 = fs.readFileSync(file.tempPath).toString("base64");
    const mimeType = file.mimetype || "image/png";
    const response = await client.responses.create({
      model: OPENAI_MODEL,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: "Extract any visible text from this image. Return only a concise plain text transcription." },
            { type: "input_image", image_url: `data:${mimeType};base64,${base64}` }
          ]
        }
      ]
    });
    return {
      method: "openai_ocr_fallback",
      preview: normalizeText(response.output_text || "").slice(0, 1500),
      text: normalizeText(response.output_text || "").slice(0, 40000)
    };
  }

  return { method: "not_extracted", preview: "", text: "" };
}

function persistTempFiles(files) {
  const dir = path.join(UPLOADS_DIR, randomUUID());
  fs.mkdirSync(dir, { recursive: true });
  return files.map((file) => {
    const tempPath = path.join(dir, safeFilename(file.originalname));
    fs.writeFileSync(tempPath, file.buffer);
    return {
      tempPath,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    };
  });
}

function createTextTempFile(title, text) {
  const dir = path.join(UPLOADS_DIR, randomUUID());
  fs.mkdirSync(dir, { recursive: true });
  const filename = safeFilename(`employee_brief_${title || "workspace"}.txt`);
  const tempPath = path.join(dir, filename);
  fs.writeFileSync(tempPath, text, "utf8");
  return {
    tempPath,
    originalname: filename,
    mimetype: "text/plain",
    size: Buffer.byteLength(text, "utf8")
  };
}

function cleanupTempFiles(files) {
  if (!files.length) {
    return;
  }
  const dir = path.dirname(files[0].tempPath);
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch (_error) {
    // ignore cleanup failures
  }
}

async function runCaseAnalysisWithOllama(mode, analysisDepth, workspaceType, workspaceLanguage, files, llmModel) {
  const resolvedWorkspaceType = normalizeWorkspaceType(workspaceType);
  const resolvedWorkspaceLanguage = normalizeWorkspaceLanguage(workspaceLanguage);
  const context = buildAnalysisContext(files, normalizeAnalysisDepth(analysisDepth) === "deep" ? 14 : 8);
  const materialInstructions = getWorkspaceMaterialInstructions(files, resolvedWorkspaceLanguage);
  const prompt = `
${getModePrompt(mode)}
${getWorkspaceTypeInstructions(resolvedWorkspaceType)}
${materialInstructions}
${getLanguageInstructions(resolvedWorkspaceLanguage)}

You are analyzing a grounded UAEICP employee intelligence workspace.
Use the context below as the only evidence base. Every finding, evidence item, contradiction, and supporting claim must cite the relevant file and chunk label.

Return only valid JSON with this exact shape:
{
  "mode": "guarded or unguarded",
  "workspace_type": "general",
  "workspace_language": "en or ar",
  "summary": "string",
  "working_theory": "string",
  "overall_confidence": "confirmed|probable|possible|insufficient_evidence",
  "uncertainty_note": "string",
  "findings": [{"title":"string","detail":"string","confidence":"confirmed|probable|possible|insufficient_evidence","source_file":"string","source_excerpt":"string","citation_reference":"string"}],
  "evidence": [{"claim":"string","importance":"string","source_file":"string","source_excerpt":"string","confidence":"confirmed|probable|possible|insufficient_evidence","citation_reference":"string"}],
  "contradictions": [{"issue":"string","why_it_matters":"string","source_file_a":"string","source_excerpt_a":"string","source_file_b":"string","source_excerpt_b":"string","severity":"critical|moderate|minor"}],
  "entities": [{"name":"string","type":"string","significance":"string"}],
  "timeline": [{"date_or_period":"string","event":"string","source_file":"string"}],
  "strengths": ["string"],
  "weaknesses": ["string"],
  "opportunities": ["string"],
  "risks": ["string"],
  "development_priorities": [{"area":"string","action":"string","urgency":"high|medium|low","citation_reference":"string"}],
  "scorecard": [{"label":"string","score":0,"rationale":"string"}],
  "open_questions": ["string"],
  "suggested_questions": ["string"],
  "warnings": ["string"]
}

Keep arrays concise and evidence-backed. If context is weak, say so.

Context:
${context}
`.trim();

  const raw = await callOllamaJson(prompt, llmModel);
  return parseStructuredJson(raw, analysisSchema, "Ollama analysis");
}

async function answerCaseQuestionWithOllama(mode, analysisDepth, workspaceType, workspaceLanguage, question, files, llmModel) {
  const resolvedWorkspaceType = normalizeWorkspaceType(workspaceType);
  const resolvedWorkspaceLanguage = normalizeWorkspaceLanguage(workspaceLanguage);
  const context = buildQuestionContext(files, question, normalizeAnalysisDepth(analysisDepth) === "deep" ? 10 : 6);
  const materialInstructions = getWorkspaceMaterialInstructions(files, resolvedWorkspaceLanguage);
  const prompt = `
${getModePrompt(mode)}
${qaInstructions}
${getWorkspaceTypeQaInstructions(resolvedWorkspaceType)}
${materialInstructions}
${getLanguageInstructions(resolvedWorkspaceLanguage)}

Use only the retrieved context below to answer the user's question. Be direct, concise, and citation-grounded.

Return only valid JSON with this exact shape:
{
  "mode": "guarded or unguarded",
  "workspace_type": "general",
  "workspace_language": "en or ar",
  "short_answer": "string",
  "overall_confidence": "confirmed|probable|possible|insufficient_evidence",
  "uncertainty_note": "string",
  "verification_note": "string",
  "key_points": [{"point":"string","evidence_strength":"confirmed|probable|possible|insufficient_evidence","citation_reference":"string"}],
  "supporting_points": [{"point":"string","source_file":"string","source_excerpt":"string","evidence_strength":"confirmed|probable|possible|insufficient_evidence","citation_reference":"string"}],
  "counterpoints": ["string"],
  "speculative_leads": ["string"],
  "next_questions": ["string"]
}

Question:
${question}

Retrieved context:
${context}
`.trim();

  const raw = await callOllamaJson(prompt, llmModel);
  return parseStructuredJson(raw, answerSchema, "Ollama answer");
}

async function callOllamaJson(prompt, model) {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      format: "json",
      options: { temperature: 0.2 }
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed with status ${response.status}.`);
  }

  const data = await response.json();
  return String(data.response || "").trim();
}

async function runCaseAnalysisWithAnthropic(mode, analysisDepth, workspaceType, workspaceLanguage, files, llmModel) {
  const resolvedWorkspaceType = normalizeWorkspaceType(workspaceType);
  const resolvedWorkspaceLanguage = normalizeWorkspaceLanguage(workspaceLanguage);
  const context = buildAnalysisContext(files, normalizeAnalysisDepth(analysisDepth) === "deep" ? 14 : 8);
  const materialInstructions = getWorkspaceMaterialInstructions(files, resolvedWorkspaceLanguage);
  const prompt = `
${getModePrompt(mode)}
${getWorkspaceTypeInstructions(resolvedWorkspaceType)}
${materialInstructions}
${getLanguageInstructions(resolvedWorkspaceLanguage)}

You are analyzing a grounded UAEICP employee intelligence workspace.
Use the context below as the only evidence base. Every finding, evidence item, contradiction, and supporting claim must cite the relevant file and chunk label.

Return only valid JSON with this exact shape:
{
  "mode": "guarded or unguarded",
  "workspace_type": "general",
  "workspace_language": "en or ar",
  "summary": "string",
  "working_theory": "string",
  "overall_confidence": "confirmed|probable|possible|insufficient_evidence",
  "uncertainty_note": "string",
  "findings": [{"title":"string","detail":"string","confidence":"confirmed|probable|possible|insufficient_evidence","source_file":"string","source_excerpt":"string","citation_reference":"string"}],
  "evidence": [{"claim":"string","importance":"string","source_file":"string","source_excerpt":"string","confidence":"confirmed|probable|possible|insufficient_evidence","citation_reference":"string"}],
  "contradictions": [{"issue":"string","why_it_matters":"string","source_file_a":"string","source_excerpt_a":"string","source_file_b":"string","source_excerpt_b":"string","severity":"critical|moderate|minor"}],
  "entities": [{"name":"string","type":"string","significance":"string"}],
  "timeline": [{"date_or_period":"string","event":"string","source_file":"string"}],
  "strengths": ["string"],
  "weaknesses": ["string"],
  "opportunities": ["string"],
  "risks": ["string"],
  "development_priorities": [{"area":"string","action":"string","urgency":"high|medium|low","citation_reference":"string"}],
  "scorecard": [{"label":"string","score":0,"rationale":"string"}],
  "open_questions": ["string"],
  "suggested_questions": ["string"],
  "warnings": ["string"]
}

Context:
${context}
`.trim();

  const raw = await callAnthropicJson(prompt, llmModel, 6000);
  return parseStructuredJson(raw, analysisSchema, "Anthropic analysis");
}

async function answerCaseQuestionWithAnthropic(mode, analysisDepth, workspaceType, workspaceLanguage, question, files, llmModel) {
  const resolvedWorkspaceType = normalizeWorkspaceType(workspaceType);
  const resolvedWorkspaceLanguage = normalizeWorkspaceLanguage(workspaceLanguage);
  const context = buildQuestionContext(files, question, normalizeAnalysisDepth(analysisDepth) === "deep" ? 10 : 6);
  const materialInstructions = getWorkspaceMaterialInstructions(files, resolvedWorkspaceLanguage);
  const prompt = `
${getModePrompt(mode)}
${qaInstructions}
${getWorkspaceTypeQaInstructions(resolvedWorkspaceType)}
${materialInstructions}
${getLanguageInstructions(resolvedWorkspaceLanguage)}

Use only the retrieved context below to answer the user's question. Be direct, concise, and citation-grounded.

Return only valid JSON with this exact shape:
{
  "mode": "guarded or unguarded",
  "workspace_type": "general",
  "workspace_language": "en or ar",
  "short_answer": "string",
  "overall_confidence": "confirmed|probable|possible|insufficient_evidence",
  "uncertainty_note": "string",
  "verification_note": "string",
  "key_points": [{"point":"string","evidence_strength":"confirmed|probable|possible|insufficient_evidence","citation_reference":"string"}],
  "supporting_points": [{"point":"string","source_file":"string","source_excerpt":"string","evidence_strength":"confirmed|probable|possible|insufficient_evidence","citation_reference":"string"}],
  "counterpoints": ["string"],
  "speculative_leads": ["string"],
  "next_questions": ["string"]
}

Question:
${question}

Retrieved context:
${context}
`.trim();

  const raw = await callAnthropicJson(prompt, llmModel, 4000);
  return parseStructuredJson(raw, answerSchema, "Anthropic answer");
}

async function generateWorkspaceTaskWithOpenAI(record, title, instructions, desiredFilename, outputFormat, workspaceLanguage, llmModel) {
  const tools = record.vectorStoreId && record.files?.length
    ? [{ type: "file_search", vector_store_ids: [record.vectorStoreId], max_num_results: 8 }]
    : [];
  const response = await client.responses.parse({
    model: llmModel,
    input: [
      {
        role: "system",
        content: `
You are an execution-focused UAEICP employee workspace agent.
You turn workspace material into a usable deliverable file.
Do not stop at analysis commentary. Produce the file contents the user asked for.
If the workspace contains only an employee brief or early request, convert it into something practical and structured.
${getLanguageInstructions(workspaceLanguage)}
Return a complete markdown-style deliverable in the structured JSON format requested.
        `.trim()
      },
      {
        role: "user",
        content: `
Workspace title: ${record.title}
Requested task title: ${title}
Requested output filename: ${desiredFilename}
Requested output format: ${outputFormat}

Workspace summary:
${normalizeText(record.analysis?.summary || "No prior summary available.")}

Workspace working angle:
${normalizeText(record.analysis?.working_theory || "No prior working angle available.")}

Task instructions:
${instructions}

Produce a deliverable the user could actually use immediately.
${outputFormat === "pptx" ? "Because the requested output is PowerPoint, organize the content as slide sections using markdown headings. Use concise bullets suitable for a presentation, include evidence/citation notes where relevant, and avoid long paragraphs." : ""}
        `.trim()
      }
    ],
    tools,
    include: tools.length ? ["file_search_call.results"] : [],
    text: { format: zodTextFormat(agentTaskSchema, "workspace_agent_task") }
  });

  return response.output_parsed;
}

async function generateWorkspaceTaskWithOllama(record, title, instructions, desiredFilename, outputFormat, workspaceLanguage, llmModel) {
  const raw = await callOllamaJson(
    buildAgentTaskPrompt(record, title, instructions, desiredFilename, outputFormat, workspaceLanguage),
    llmModel
  );
  return parseStructuredJson(raw, agentTaskSchema, "Ollama agent task");
}

async function generateWorkspaceTaskWithAnthropic(record, title, instructions, desiredFilename, outputFormat, workspaceLanguage, llmModel) {
  const raw = await callAnthropicJson(
    buildAgentTaskPrompt(record, title, instructions, desiredFilename, outputFormat, workspaceLanguage),
    llmModel,
    6000
  );
  return parseStructuredJson(raw, agentTaskSchema, "Anthropic agent task");
}

async function callAnthropicJson(prompt, model, maxTokens) {
  const response = await fetch(`${ANTHROPIC_BASE_URL}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic request failed with status ${response.status}.`);
  }

  const data = await response.json();
  const text = Array.isArray(data.content)
    ? data.content.filter((item) => item.type === "text").map((item) => item.text).join("\n")
    : "";
  return String(text || "").trim();
}

function parseStructuredJson(raw, schema, label) {
  const parsed = tryParseJson(raw);
  if (!parsed) {
    throw new Error(`${label} did not return valid JSON.`);
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`${label} returned an unexpected JSON shape.`);
  }

  return result.data;
}

function tryParseJson(raw) {
  try {
    return JSON.parse(raw);
  } catch (_error) {
    const match = String(raw || "").match(/\{[\s\S]*\}$/);
    if (!match) {
      return null;
    }
    try {
      return JSON.parse(match[0]);
    } catch (_nestedError) {
      return null;
    }
  }
}

function buildAnalysisContext(files, maxChunks) {
  return buildRelevantChunks(files, "", maxChunks)
    .map((chunk) => `[${chunk.id}] ${chunk.file}\n${chunk.text}`)
    .join("\n\n");
}

function buildQuestionContext(files, question, maxChunks) {
  const chunks = buildRelevantChunks(files, question, maxChunks);
  if (!chunks.length) {
    return "No extracted source text was available from the workspace materials.";
  }
  return chunks.map((chunk) => `[${chunk.id}] ${chunk.file}\n${chunk.text}`).join("\n\n");
}

function classifyWorkspaceMaterials(files) {
  const list = files || [];
  const hasFiles = list.length > 0;
  const employeeBriefFiles = list.filter((file) => String(file.name || "").toLowerCase().includes("employee_brief"));
  const onlyEmployeeBrief = hasFiles && employeeBriefFiles.length === list.length;
  const hasEmployeeBrief = employeeBriefFiles.length > 0;
  return { hasFiles, hasEmployeeBrief, onlyEmployeeBrief };
}

function getWorkspaceMaterialInstructions(files, workspaceLanguage) {
  const materials = classifyWorkspaceMaterials(files);
  const isArabic = false;
  if (materials.onlyEmployeeBrief) {
    return isArabic
      ? `تعتمد مساحة العمل هذه فقط على وصف أو ملخص كتبه المؤسس، وليس على حزمة مستندات متكاملة.
تعامل مع هذا الوصف على أنه نواة فكرة حقيقية، ثم ساعد المستخدم على تطويرها.
لا تصغ الإجابة وكأن المشكلة هي فقط غياب المستندات.
بدلاً من ذلك:
- استخرج الفكرة الأساسية بوضوح
- اقترح 2 إلى 4 اتجاهات عملية أو زوايا تموضع
- حدد ما يحتاج إلى افتراضات أو تحقق
- قدم خطوات تالية مفيدة لبناء المشروع
- أعط أمثلة حقيقية على ما يمكن أن يبدو عليه المشروع أو التجربة أو العرض
- لا تكتفِ بقول إن الفكرة مبكرة؛ حوّلها إلى خيارات عملية يمكن للمستخدم البناء عليها`
      : `This workspace currently contains only an employee-written brief rather than a full document pack.
Treat that brief as real UAEICP employee input and help the user turn it into practical next steps.
Do not frame the main answer as merely "there is not enough documentation."
Instead:
- restate the request clearly
- identify missing documents, data, approvals, or policy checks
- propose practical verification steps
- separate confirmed facts from assumptions
- provide draft wording, checklist items, or escalation points where useful
- turn a vague request into employee-ready guidance`;
  }
  if (materials.hasEmployeeBrief) {
    return isArabic
      ? "تحتوي مساحة العمل على وصف مؤسس إلى جانب مواد أخرى. استخدم الوصف كنقطة انطلاق تفسيرية ثم وازنه مع بقية المواد."
      : "This workspace includes an employee brief alongside other materials. Use the brief as request context and balance it against the rest of the sources.";
  }
  return isArabic
    ? "تعامل مع المواد على أنها مصادر عمل أو مستندات داعمة، واستند إليها في التحليل."
    : "Treat the workspace materials as UAEICP work sources or supporting documents and ground the analysis in them.";
}

function buildVisualContext(record) {
  const analysis = record.analysis || {};
  const lines = [];
  lines.push(`Workspace title: ${record.title}`);
  lines.push(`Workspace type: ${record.workspaceType || "general"}`);
  lines.push(`Mode: ${record.mode}`);
  lines.push(`Language: ${record.workspaceLanguage || "en"}`);
  if (analysis.summary) {
    lines.push(`Summary: ${normalizeText(analysis.summary)}`);
  }
  if (analysis.working_theory) {
    lines.push(`Working angle: ${normalizeText(analysis.working_theory)}`);
  }
  if ((analysis.strengths || []).length) {
    lines.push(`Strengths: ${(analysis.strengths || []).slice(0, 4).join("; ")}`);
  }
  if ((analysis.opportunities || []).length) {
    lines.push(`Opportunities: ${(analysis.opportunities || []).slice(0, 4).join("; ")}`);
  }
  if ((analysis.risks || []).length) {
    lines.push(`Risks: ${(analysis.risks || []).slice(0, 3).join("; ")}`);
  }
  if ((record.files || []).length) {
    lines.push(`Source files: ${(record.files || []).map((file) => file.name).join(", ")}`);
  }
  return lines.join("\n");
}

function normalizeVisualType(value) {
  const raw = String(value || "").trim().toLowerCase();
  const allowed = new Set(["general", "logo", "cup", "packaging", "mockup", "moodboard", "social"]);
  return allowed.has(raw) ? raw : "general";
}

function normalizeAspectRatio(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (["1:1", "3:2", "2:3"].includes(raw)) {
    return raw;
  }
  return "1:1";
}

function getVisualTypeInstructions(visualType, workspaceLanguage) {
  const isArabic = false;
  const copy = {
    general: isArabic
      ? "أنشئ تصوراً بصرياً إبداعياً واحترافياً يترجم فكرة المشروع أو العلامة التجارية وفق طلب المستخدم."
      : "Create a polished internal communication visual that supports the employee request or workspace content.",
    logo: isArabic
      ? "أنشئ مفهوماً بصرياً لشعار احترافي يعبّر عن العلامة التجارية بوضوح، مع قابلية للاستخدام على الأكواب والمواد التسويقية."
      : "Create a professional visual mark or header concept suitable for an internal memo, guide, or presentation.",
    cup: isArabic
      ? "أنشئ تصميماً لكوب أو كأس يحمل هوية العلامة التجارية ويمكن تخيله في مقهى أو منتج استهلاكي."
      : "Create a clear service journey or workflow visual suitable for internal employee guidance.",
    packaging: isArabic
      ? "أنشئ تصوراً لتغليف أو عبوة يعكس تموضع العلامة التجارية ونبرة المشروع."
      : "Create a document, checklist, or quick-reference layout concept that reflects the workspace topic.",
    mockup: isArabic
      ? "أنشئ نموذجاً بصرياً عالي الجودة لتطبيق الفكرة أو العلامة في العالم الواقعي."
      : "Create a polished mockup showing the guidance, workflow, or memo concept in a realistic internal-use setting.",
    moodboard: isArabic
      ? "أنشئ لوحة توجه بصري توضّح الألوان والخامات والأجواء والأسلوب العام."
      : "Create a moodboard-style visual that captures colors, materials, atmosphere, and overall style.",
    social: isArabic
      ? "أنشئ تصوراً إعلانياً أو اجتماعياً يمكن استخدامه في التسويق أو عرض الفكرة."
      : "Create an internal announcement, training, or employee guidance visual concept."
  };
  return copy[visualType] || copy.logo;
}

async function generateWorkspaceVisual({ record, visualType, prompt, aspectRatio, sourceVisualId, requestedBy, jobRef }) {
  jobRef.step = "Collecting workspace context";
  const context = buildVisualContext(record);
  const sourceVisual = resolveSourceVisual(record, sourceVisualId);
  const recentPrompts = (record.visuals || []).slice(0, 4).map((item) => `- ${item.prompt}`).join("\n");
  const finalPrompt = [
    false
      ? "أنت مصمم إبداعي يبني تصورات بصرية انطلاقاً من مستندات الأعمال والتحليل."
      : "You are a creative director generating clear internal communication visuals from UAEICP employee workspace context.",
    getLanguageInstruction(record.workspaceLanguage),
    getVisualTypeInstructions(visualType, record.workspaceLanguage),
    false
      ? "اعتمد على سياق مساحة العمل التالي باعتباره المرجع الإبداعي الأساسي، لكن لا تضع نصاً كثيراً داخل الصورة."
      : "Use the following workspace context as the main creative brief, but avoid excessive text inside the image.",
    sourceVisual
      ? (normalizeWorkspaceLanguage(record.workspaceLanguage) === "ar"
        ? "اعتبر الصورة المرجعية الحالية أساساً للتعديل والتحسين، وحافظ على الهوية العامة إلا إذا طلب المستخدم تغييراً واضحاً."
        : "Treat the attached reference image as the current design to refine. Preserve the overall identity unless the user clearly asks to change it.")
      : (normalizeWorkspaceLanguage(record.workspaceLanguage) === "ar"
        ? "أنشئ مفهوماً بصرياً جديداً من الصفر اعتماداً على هذا السياق."
        : "Create a fresh visual concept from scratch based on this context."),
    `Visual type: ${visualType}`,
    `Aspect ratio: ${aspectRatio}`,
    `Workspace context:\n${context}`,
    recentPrompts ? `Recent visual prompts:\n${recentPrompts}` : "",
    `User request:\n${prompt}`,
    false
      ? "أنتج صورة واحدة نظيفة وعصرية واحترافية تناسب عرض الفكرة أو العلامة التجارية."
      : "Produce one clean, modern, professional image suitable for internal explanation, presentation, or employee guidance."
  ].filter(Boolean).join("\n\n");

  jobRef.step = "Generating visual";
  const response = sourceVisual
    ? await editWorkspaceVisual(sourceVisual, finalPrompt, aspectRatio)
    : await client.images.generate({
      model: OPENAI_IMAGE_MODEL,
      prompt: finalPrompt,
      size: mapAspectRatioToSize(aspectRatio)
    });

  const base64 = response.data?.[0]?.b64_json;
  if (!base64) {
    throw new Error("Image generation returned no image data.");
  }

  jobRef.step = "Saving visual output";
  const visualId = randomUUID();
  const filename = `${visualId}.png`;
  fs.writeFileSync(path.join(GENERATED_DIR, filename), Buffer.from(base64, "base64"));

  return {
    id: visualId,
    type: visualType,
    prompt,
    aspectRatio,
    model: OPENAI_IMAGE_MODEL,
    provider: "openai",
    imageUrl: `/generated/${filename}`,
    sourceVisualId: sourceVisual?.id || null,
    createdAt: new Date().toISOString(),
    requestedBy
  };
}

async function editWorkspaceVisual(sourceVisual, prompt, aspectRatio) {
  const sourcePath = path.join(GENERATED_DIR, path.basename(String(sourceVisual.imageUrl || "")));
  const imageFile = await toFile(fs.readFileSync(sourcePath), path.basename(sourcePath), { type: "image/png" });
  return client.images.edit({
    model: OPENAI_IMAGE_MODEL,
    image: imageFile,
    prompt,
    size: mapAspectRatioToSize(aspectRatio)
  });
}

function resolveSourceVisual(record, sourceVisualId) {
  const visuals = record.visuals || [];
  if (!visuals.length) {
    return null;
  }
  if (sourceVisualId) {
    return visuals.find((item) => item.id === sourceVisualId) || null;
  }
  return visuals[0] || null;
}

function mapAspectRatioToSize(aspectRatio) {
  if (aspectRatio === "3:2") {
    return "1536x1024";
  }
  if (aspectRatio === "2:3") {
    return "1024x1536";
  }
  return "1024x1024";
}

function cleanupGeneratedVisuals(visuals) {
  for (const visual of visuals || []) {
    const imageUrl = String(visual.imageUrl || "");
    if (!imageUrl.startsWith("/generated/")) {
      continue;
    }
    const target = path.join(GENERATED_DIR, path.basename(imageUrl));
    try {
      fs.unlinkSync(target);
    } catch (_error) {
      // ignore missing files
    }
  }
}

function buildRelevantChunks(files, query, maxChunks) {
  const chunks = [];
  for (const file of files || []) {
    const text = normalizeText(file.extractedText || file.extractionPreview || "");
    if (!text) {
      continue;
    }
    const fileChunks = chunkText(text, 1000, 150).map((chunkTextValue, index) => ({
      id: `${file.name}#${index + 1}`,
      file: file.name,
      text: chunkTextValue,
      score: scoreChunk(chunkTextValue, query)
    }));
    chunks.push(...fileChunks);
  }

  if (!query) {
    return chunks.slice(0, maxChunks);
  }

  return chunks
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks);
}

function chunkText(text, size, overlap) {
  const clean = normalizeText(text);
  if (!clean) {
    return [];
  }

  const chunks = [];
  let start = 0;
  while (start < clean.length) {
    const end = Math.min(clean.length, start + size);
    chunks.push(clean.slice(start, end));
    if (end >= clean.length) {
      break;
    }
    start = Math.max(end - overlap, start + 1);
  }
  return chunks;
}

function scoreChunk(chunk, query) {
  const terms = normalizeText(query).toLowerCase().split(/\s+/).filter((term) => term.length > 2);
  if (!terms.length) {
    return 0;
  }
  const haystack = chunk.toLowerCase();
  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}

function createJob({ type, ownerId, ownerRole, initialStep, runner }) {
  const job = {
    id: randomUUID(),
    type,
    ownerId,
    ownerRole,
    status: "queued",
    step: initialStep,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    result: null,
    error: null
  };
  jobs.set(job.id, job);

  setImmediate(async () => {
    job.status = "running";
    job.updatedAt = new Date().toISOString();
    try {
      const result = await runner(job);
      job.status = "completed";
      job.result = result;
    } catch (error) {
      job.status = "failed";
      job.error = formatError(error);
    } finally {
      job.updatedAt = new Date().toISOString();
    }
  });

  return job;
}

async function requireUser(req, res, next) {
  const userId = req.session.userId;
  const user = userId ? await findUserById(userId) : null;
  if (!user) {
    return res.status(401).json({ error: "Sign in first." });
  }
  req.currentUser = user;
  next();
}

async function requireAdmin(req, res, next) {
  const userId = req.session.userId;
  const user = userId ? await findUserById(userId) : null;
  if (!user) {
    return res.status(401).json({ error: "Sign in first." });
  }
  if (user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required." });
  }
  req.currentUser = user;
  next();
}

async function initDb() {
  if (!USE_POSTGRES) {
    sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      owner_email TEXT NOT NULL,
      title TEXT NOT NULL,
      mode TEXT NOT NULL,
      workspace_type TEXT NOT NULL DEFAULT 'general',
      workspace_language TEXT NOT NULL DEFAULT 'en',
      analysis_depth TEXT NOT NULL DEFAULT 'quick',
      llm_provider TEXT NOT NULL DEFAULT 'openai',
      llm_model TEXT NOT NULL DEFAULT 'gpt-5.5',
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      vector_store_id TEXT NOT NULL,
      files_json TEXT NOT NULL,
      visuals_json TEXT NOT NULL DEFAULT '[]',
      ingestion_json TEXT NOT NULL,
      analysis_json TEXT NOT NULL,
      qa_json TEXT NOT NULL,
      analysis_cache_json TEXT NOT NULL,
      answer_cache_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      status TEXT NOT NULL,
      note TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL,
      title TEXT NOT NULL,
      instructions TEXT NOT NULL,
      output_format TEXT NOT NULL DEFAULT 'markdown',
      output_filename TEXT,
      output_path TEXT,
      output_url TEXT,
      output_summary TEXT,
      llm_provider TEXT NOT NULL,
      llm_model TEXT NOT NULL,
      status TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    `);

    const caseColumns = sqliteDb.prepare("PRAGMA table_info(cases)").all();
    if (!caseColumns.some((column) => column.name === "analysis_depth")) {
      sqliteDb.exec("ALTER TABLE cases ADD COLUMN analysis_depth TEXT NOT NULL DEFAULT 'quick'");
    }
    if (!caseColumns.some((column) => column.name === "workspace_type")) {
      sqliteDb.exec("ALTER TABLE cases ADD COLUMN workspace_type TEXT NOT NULL DEFAULT 'general'");
    }
    if (!caseColumns.some((column) => column.name === "workspace_language")) {
      sqliteDb.exec("ALTER TABLE cases ADD COLUMN workspace_language TEXT NOT NULL DEFAULT 'en'");
    }
    if (!caseColumns.some((column) => column.name === "llm_provider")) {
      sqliteDb.exec("ALTER TABLE cases ADD COLUMN llm_provider TEXT NOT NULL DEFAULT 'openai'");
    }
    if (!caseColumns.some((column) => column.name === "llm_model")) {
      sqliteDb.exec("ALTER TABLE cases ADD COLUMN llm_model TEXT NOT NULL DEFAULT 'gpt-5.5'");
    }
    if (!caseColumns.some((column) => column.name === "visuals_json")) {
      sqliteDb.exec("ALTER TABLE cases ADD COLUMN visuals_json TEXT NOT NULL DEFAULT '[]'");
    }
    return;
  }

  await dbExec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      owner_email TEXT NOT NULL,
      title TEXT NOT NULL,
      mode TEXT NOT NULL,
      workspace_type TEXT NOT NULL DEFAULT 'general',
      workspace_language TEXT NOT NULL DEFAULT 'en',
      analysis_depth TEXT NOT NULL DEFAULT 'quick',
      llm_provider TEXT NOT NULL DEFAULT 'openai',
      llm_model TEXT NOT NULL DEFAULT 'gpt-5.5',
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      vector_store_id TEXT NOT NULL,
      files_json TEXT NOT NULL,
      visuals_json TEXT NOT NULL DEFAULT '[]',
      ingestion_json TEXT NOT NULL,
      analysis_json TEXT NOT NULL,
      qa_json TEXT NOT NULL,
      analysis_cache_json TEXT NOT NULL,
      answer_cache_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      status TEXT NOT NULL,
      note TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL,
      title TEXT NOT NULL,
      instructions TEXT NOT NULL,
      output_format TEXT NOT NULL DEFAULT 'markdown',
      output_filename TEXT,
      output_path TEXT,
      output_url TEXT,
      output_summary TEXT,
      llm_provider TEXT NOT NULL,
      llm_model TEXT NOT NULL,
      status TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

async function migrateLegacyJson() {
  const caseCount = Number((await dbGet("SELECT COUNT(*) AS count FROM cases"))?.count || 0);
  const userCount = Number((await dbGet("SELECT COUNT(*) AS count FROM users"))?.count || 0);

  if (USE_POSTGRES && userCount === 0 && caseCount === 0 && fs.existsSync(DB_PATH)) {
    const legacySqlite = new Database(DB_PATH, { readonly: true });
    try {
      const legacyUsers = legacySqlite.prepare("SELECT * FROM users").all();
      for (const row of legacyUsers) {
        await upsertUser(rowToUser(row));
      }

      const legacyCases = legacySqlite.prepare("SELECT * FROM cases").all();
      for (const row of legacyCases) {
        await saveCaseRecord(rowToCaseRecord(row));
      }

      const hasReviews = legacySqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='reviews'").get();
      if (hasReviews) {
        const legacyReviews = legacySqlite.prepare("SELECT * FROM reviews").all();
        for (const row of legacyReviews) {
          await insertReview({
            id: row.id,
            caseId: row.case_id,
            targetType: row.target_type,
            targetId: row.target_id,
            status: row.status,
            note: row.note,
            createdBy: row.created_by,
            createdAt: row.created_at
          });
        }
      }

      const hasTasks = legacySqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'").get();
      if (hasTasks) {
        const legacyTasks = legacySqlite.prepare("SELECT * FROM tasks").all();
        for (const row of legacyTasks) {
          await insertTask({
            id: row.id,
            caseId: row.case_id,
            title: row.title,
            instructions: row.instructions,
            outputFormat: row.output_format,
            outputFilename: row.output_filename,
            outputPath: row.output_path,
            outputUrl: row.output_url,
            outputSummary: row.output_summary,
            llmProvider: row.llm_provider,
            llmModel: row.llm_model,
            status: row.status,
            createdBy: row.created_by,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          });
        }
      }
      return;
    } finally {
      legacySqlite.close();
    }
  }

  if (userCount === 0 && fs.existsSync(LEGACY_USERS_PATH)) {
    const users = JSON.parse(fs.readFileSync(LEGACY_USERS_PATH, "utf8") || "[]");
    for (const user of users) {
      await upsertUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt
      });
    }
  }

  if (caseCount === 0 && fs.existsSync(LEGACY_CASES_PATH)) {
    const cases = JSON.parse(fs.readFileSync(LEGACY_CASES_PATH, "utf8") || "{}");
    for (const record of Object.values(cases)) {
      await saveCaseRecord(record);
    }
  }
}

async function upsertUser(user) {
  await dbRun(`
    INSERT INTO users (id, name, email, role, password_hash, created_at)
    VALUES (@id, @name, @email, @role, @passwordHash, @createdAt)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      email = excluded.email,
      role = excluded.role,
      password_hash = excluded.password_hash,
      created_at = excluded.created_at
  `, user);
}

async function saveCaseRecord(record) {
  await dbRun(`
    INSERT INTO cases (
      id, owner_id, owner_email, title, mode, workspace_type, workspace_language, analysis_depth, llm_provider, llm_model, status, created_at, updated_at, vector_store_id,
      files_json, visuals_json, ingestion_json, analysis_json, qa_json, analysis_cache_json, answer_cache_json
    ) VALUES (
      @id, @ownerId, @ownerEmail, @title, @mode, @workspaceType, @workspaceLanguage, @analysisDepth, @llmProvider, @llmModel, @status, @createdAt, @updatedAt, @vectorStoreId,
      @filesJson, @visualsJson, @ingestionJson, @analysisJson, @qaJson, @analysisCacheJson, @answerCacheJson
    )
    ON CONFLICT(id) DO UPDATE SET
      owner_id = excluded.owner_id,
      owner_email = excluded.owner_email,
      title = excluded.title,
      mode = excluded.mode,
      workspace_type = excluded.workspace_type,
      workspace_language = excluded.workspace_language,
      analysis_depth = excluded.analysis_depth,
      llm_provider = excluded.llm_provider,
      llm_model = excluded.llm_model,
      status = excluded.status,
      created_at = excluded.created_at,
      updated_at = excluded.updated_at,
      vector_store_id = excluded.vector_store_id,
      files_json = excluded.files_json,
      visuals_json = excluded.visuals_json,
      ingestion_json = excluded.ingestion_json,
      analysis_json = excluded.analysis_json,
      qa_json = excluded.qa_json,
      analysis_cache_json = excluded.analysis_cache_json,
      answer_cache_json = excluded.answer_cache_json
  `, {
    id: record.id,
    ownerId: record.ownerId,
    ownerEmail: record.ownerEmail,
    title: record.title,
    mode: record.mode,
    workspaceType: normalizeWorkspaceType(record.workspaceType),
    workspaceLanguage: normalizeWorkspaceLanguage(record.workspaceLanguage),
    analysisDepth: normalizeAnalysisDepth(record.analysisDepth),
    llmProvider: normalizeLlmProvider(record.llmProvider),
    llmModel: normalizeLlmModel(record.llmProvider, record.llmModel),
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    vectorStoreId: record.vectorStoreId,
    filesJson: JSON.stringify(record.files || []),
    visualsJson: JSON.stringify(record.visuals || []),
    ingestionJson: JSON.stringify(record.ingestion || {}),
    analysisJson: JSON.stringify(record.analysis || {}),
    qaJson: JSON.stringify(record.qa || []),
    analysisCacheJson: JSON.stringify(record.analysisCache || {}),
    answerCacheJson: JSON.stringify(record.answerCache || {})
  });
}

async function insertTask(task) {
  await dbRun(`
    INSERT INTO tasks (
      id, case_id, title, instructions, output_format, output_filename, output_path, output_url,
      output_summary, llm_provider, llm_model, status, created_by, created_at, updated_at
    ) VALUES (
      @id, @caseId, @title, @instructions, @outputFormat, @outputFilename, @outputPath, @outputUrl,
      @outputSummary, @llmProvider, @llmModel, @status, @createdBy, @createdAt, @updatedAt
    )
  `, task);
}

async function updateTask(task) {
  await dbRun(`
    UPDATE tasks SET
      title = @title,
      instructions = @instructions,
      output_format = @outputFormat,
      output_filename = @outputFilename,
      output_path = @outputPath,
      output_url = @outputUrl,
      output_summary = @outputSummary,
      llm_provider = @llmProvider,
      llm_model = @llmModel,
      status = @status,
      created_by = @createdBy,
      created_at = @createdAt,
      updated_at = @updatedAt
    WHERE id = @id
  `, task);
}

async function insertReview(review) {
  await dbRun(`
    INSERT INTO reviews (id, case_id, target_type, target_id, status, note, created_by, created_at)
    VALUES (@id, @caseId, @targetType, @targetId, @status, @note, @createdBy, @createdAt)
  `, review);
}

async function listReviews(caseId) {
  return (await dbAll("SELECT * FROM reviews WHERE case_id = ? ORDER BY created_at DESC", [caseId])).map((row) => ({
    id: row.id,
    caseId: row.case_id,
    targetType: row.target_type,
    targetId: row.target_id,
    status: row.status,
    note: row.note,
    createdBy: row.created_by,
    createdAt: row.created_at
  }));
}

async function listTasks(caseId) {
  return (await dbAll("SELECT * FROM tasks WHERE case_id = ? ORDER BY created_at DESC", [caseId])).map((row) => ({
    id: row.id,
    caseId: row.case_id,
    title: row.title,
    instructions: row.instructions,
    outputFormat: row.output_format,
    outputFilename: row.output_filename,
    outputPath: row.output_path,
    outputUrl: row.output_url,
    outputSummary: row.output_summary,
    llmProvider: row.llm_provider,
    llmModel: row.llm_model,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

async function listUsers() {
  return (await dbAll("SELECT * FROM users ORDER BY created_at DESC")).map(rowToUser);
}

async function findUserByEmail(email) {
  const row = await dbGet("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
  return row ? rowToUser(row) : null;
}

async function findUserById(id) {
  const row = await dbGet("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
  return row ? rowToUser(row) : null;
}

async function ensureSeedAdmin() {
  const admin = await dbGet("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  if (admin) {
    return;
  }

  await upsertUser({
    id: randomUUID(),
    name: "Admin",
    email: DEFAULT_ADMIN_EMAIL,
    role: "admin",
    passwordHash: bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10),
    createdAt: new Date().toISOString()
  });
}

async function listCasesForUser(user) {
  const rows = user.role === "admin"
    ? await dbAll("SELECT * FROM cases ORDER BY updated_at DESC")
    : await dbAll("SELECT * FROM cases WHERE owner_id = ? ORDER BY updated_at DESC", [user.id]);
  return rows.map(rowToCaseRecord);
}

async function getCaseForUser(caseId, user) {
  const row = await dbGet("SELECT * FROM cases WHERE id = ? LIMIT 1", [caseId]);
  if (!row) {
    return null;
  }
  const record = rowToCaseRecord(row);
  if (user.role === "admin" || record.ownerId === user.id) {
    return record;
  }
  return null;
}

function rowToUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    passwordHash: row.password_hash,
    createdAt: row.created_at
  };
}

function rowToCaseRecord(row) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    ownerEmail: row.owner_email,
    title: row.title,
    mode: row.mode,
    workspaceType: normalizeWorkspaceType(row.workspace_type),
    workspaceLanguage: normalizeWorkspaceLanguage(row.workspace_language),
    analysisDepth: normalizeAnalysisDepth(row.analysis_depth),
    llmProvider: normalizeLlmProvider(row.llm_provider),
    llmModel: normalizeLlmModel(row.llm_provider, row.llm_model),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    vectorStoreId: row.vector_store_id,
    files: JSON.parse(row.files_json || "[]"),
    visuals: JSON.parse(row.visuals_json || "[]"),
    ingestion: JSON.parse(row.ingestion_json || "{}"),
    analysis: JSON.parse(row.analysis_json || "{}"),
    qa: JSON.parse(row.qa_json || "[]"),
    analysisCache: JSON.parse(row.analysis_cache_json || "{}"),
    answerCache: JSON.parse(row.answer_cache_json || "{}")
  };
}

async function caseSummary(record) {
  return {
    id: record.id,
    title: record.title,
    mode: record.mode,
    workspaceType: record.workspaceType,
    workspaceLanguage: record.workspaceLanguage,
    analysisDepth: record.analysisDepth,
    llmProvider: record.llmProvider,
    llmModel: record.llmModel,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    status: record.status,
    fileCount: record.files.length,
    questionCount: (record.qa || []).length,
    ownerEmail: record.ownerEmail,
    ingestion: record.ingestion || null,
    visualCount: (record.visuals || []).length,
    taskCount: (await listTasks(record.id)).length
  };
}

async function sanitizeCase(record) {
  return {
    id: record.id,
    title: record.title,
    mode: record.mode,
    workspaceType: record.workspaceType,
    workspaceLanguage: record.workspaceLanguage,
    analysisDepth: record.analysisDepth,
    llmProvider: record.llmProvider,
    llmModel: record.llmModel,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    ownerEmail: record.ownerEmail,
    files: record.files,
    visuals: record.visuals || [],
    ingestion: record.ingestion || null,
    analysis: record.analysis,
    qa: record.qa || [],
    reviews: await listReviews(record.id),
    tasks: await listTasks(record.id)
  };
}

async function buildWorkspaceMarkdown(record) {
  const analysis = record.analysis || {};
  const lines = [];
  lines.push(`# ${record.title}`);
  lines.push("");
  lines.push(`- Mode: ${record.mode}`);
  lines.push(`- Workspace type: ${record.workspaceType || "general"}`);
  lines.push(`- Workspace language: ${record.workspaceLanguage || "en"}`);
  lines.push(`- Status: ${record.status}`);
  lines.push(`- Analysis depth: ${record.analysisDepth || "quick"}`);
  lines.push(`- Generated visuals: ${(record.visuals || []).length}`);
  lines.push(`- Agent tasks: ${(await listTasks(record.id)).length}`);
  lines.push(`- Owner: ${record.ownerEmail}`);
  lines.push(`- Confidence: ${analysis.overall_confidence || "possible"}`);
  lines.push("");
  if ((record.visuals || []).length) {
    lines.push("## Visual Studio");
    lines.push("");
    for (const visual of record.visuals) {
      lines.push(`- ${visual.type}: ${visual.prompt}`);
      lines.push(`  - Model: ${visual.model}`);
      lines.push(`  - Aspect ratio: ${visual.aspectRatio}`);
      lines.push(`  - Created: ${visual.createdAt}`);
    }
    lines.push("");
  }
  const tasks = await listTasks(record.id);
  if (tasks.length) {
    lines.push("");
    lines.push("## Agent Outputs");
    lines.push("");
    for (const task of tasks) {
      lines.push(`- ${task.title}`);
      lines.push(`  - Status: ${task.status}`);
      lines.push(`  - Provider: ${task.llmProvider} / ${task.llmModel}`);
      lines.push(`  - Summary: ${task.outputSummary || "No summary available."}`);
      if (task.outputUrl) {
        lines.push(`  - Output: ${task.outputUrl}`);
      }
    }
  }
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(analysis.summary || "No summary available.");
  lines.push("");
  lines.push("## Working Theory");
  lines.push("");
  lines.push(analysis.working_theory || "No working theory available.");
  lines.push("");
  lines.push("## Uncertainty");
  lines.push("");
  lines.push(analysis.uncertainty_note || "No uncertainty note available.");
  lines.push("");
  lines.push("## Key Findings");
  lines.push("");
  for (const item of analysis.findings || []) {
    lines.push(`- ${item.title}: ${item.detail} (${item.citation_reference || item.source_file})`);
  }
  lines.push("");
  lines.push("## Evidence");
  lines.push("");
  for (const item of analysis.evidence || []) {
    lines.push(`- ${item.claim}: ${item.importance} (${item.citation_reference || item.source_file})`);
  }
  lines.push("");
  lines.push("## Chat History");
  lines.push("");
  for (const item of record.qa || []) {
    lines.push(`### Q: ${item.question}`);
    lines.push("");
    lines.push(item.answer?.short_answer || "No answer.");
    lines.push("");
  }
  return lines.join("\n");
}

function validateFiles(files) {
  const accepted = [];
  const rejected = [];
  for (const file of files) {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(extension)) {
      rejected.push({ name: file.originalname, reason: `Unsupported format ${extension || "(no extension)"}` });
      continue;
    }
    accepted.push(file);
  }
  return { accepted, rejected };
}

function cleanupTaskOutputs(tasks) {
  for (const task of tasks || []) {
    if (task.outputPath && fs.existsSync(task.outputPath)) {
      fs.unlinkSync(task.outputPath);
    }
  }
}

function safeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function sanitizeTaskTitle(value) {
  const trimmed = String(value || "").trim();
  return trimmed || "Workspace agent task";
}

function normalizeTaskOutputFormat(value) {
  return ["markdown", "txt", "json", "pptx"].includes(String(value || "").trim().toLowerCase())
    ? String(value || "").trim().toLowerCase()
    : "markdown";
}

function buildAgentTaskPrompt(record, title, instructions, desiredFilename, outputFormat, workspaceLanguage) {
  const context = buildAnalysisContext(record.files || [], 10);
  return `
You are an execution-focused UAEICP employee workspace agent.
You create complete employee-ready deliverables from workspace context.
You can prepare document analyses, legal/compliance review memos, revised document drafts, internal memos, service checklists, policy comparisons, PowerPoint decks, and action plans.
When producing revised text, preserve the original intent, improve clarity and structure, identify assumptions, and include an edits summary.
When reviewing legality or compliance, do not claim to provide final legal advice. Identify review points, missing authorities, required approvals, policy/procedure conflicts, and items needing human legal or supervisor verification.
${getWorkspaceTypeQaInstructions(record.workspaceType)}
${getWorkspaceMaterialInstructions(record.files || [], workspaceLanguage)}
${getLanguageInstructions(workspaceLanguage)}

Workspace title: ${record.title}
Requested task title: ${title}
Requested filename: ${desiredFilename}
Requested output format: ${outputFormat}

Current workspace summary:
${normalizeText(record.analysis?.summary || "No prior summary available.")}

Current workspace working angle:
${normalizeText(record.analysis?.working_theory || "No prior working angle available.")}

Task instructions:
${instructions}

Available workspace context:
${context}

Return strict JSON using this exact shape:
{
  "task_title": "string",
  "summary": "string",
  "output_filename": "string",
  "output_markdown": "string"
}

The output_markdown must be a genuinely useful file deliverable, not just commentary.
If the workspace is only an employee brief, turn it into a practical working draft the user can use immediately.
If the task asks for edits or a revised document, include:
- revised draft
- edits made
- unresolved assumptions
- citations or source references where relevant
${outputFormat === "pptx" ? "Because the requested output is PowerPoint, organize output_markdown as slide-ready content with markdown headings and concise bullets. Include an executive summary, key findings, evidence, legal/compliance review points, risks/gaps, recommended actions, and human review notes." : ""}
  `.trim();
}

function formatTaskOutputContent(outputFormat, markdown, summary, meta) {
  const taskTitle = normalizeText(meta.taskTitle || "Workspace agent output");
  const workspaceTitle = normalizeText(meta.workspaceTitle || "Workspace");
  const requestedBy = normalizeText(meta.requestedBy || "Unknown");
  if (outputFormat === "json") {
    return JSON.stringify({
      taskTitle,
      workspaceTitle,
      requestedBy,
      summary: normalizeText(summary),
      content: normalizeText(markdown)
    }, null, 2);
  }
  if (outputFormat === "txt") {
    return [
      taskTitle,
      `Workspace: ${workspaceTitle}`,
      `Requested by: ${requestedBy}`,
      `Summary: ${normalizeText(summary)}`,
      "",
      normalizeText(markdown)
    ].join("\n");
  }
  return [
    `# ${taskTitle}`,
    "",
    `- Workspace: ${workspaceTitle}`,
    `- Requested by: ${requestedBy}`,
    `- Summary: ${normalizeText(summary)}`,
    "",
    normalizeText(markdown)
  ].join("\n");
}

async function writePowerPointDeck(outputPath, meta) {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "UAEICP Employee Intelligence Workspace";
  pptx.subject = normalizeText(meta.summary || meta.workspaceTitle || "Workspace presentation");
  pptx.title = normalizeText(meta.title || "Workspace Presentation");
  pptx.company = "UAEICP";
  pptx.lang = "en-US";
  pptx.theme = {
    headFontFace: "Aptos Display",
    bodyFontFace: "Aptos",
    lang: "en-US"
  };
  pptx.defineLayout({ name: "UAEICP_WIDE", width: 13.333, height: 7.5 });
  pptx.layout = "UAEICP_WIDE";

  const colors = {
    green: "0B6B55",
    dark: "17211D",
    muted: "64736D",
    gold: "B9985B",
    pale: "F4F7F5",
    white: "FFFFFF",
    line: "D9E4DE"
  };

  const slides = buildPresentationSlides(meta);
  addTitleSlide(pptx, colors, slides[0]);
  slides.slice(1).forEach((slideData) => addContentSlide(pptx, colors, slideData));
  await pptx.writeFile({ fileName: outputPath });
}

function buildPresentationSlides(meta) {
  const analysis = meta.analysis || {};
  const slides = [
    {
      title: normalizeText(meta.title || "Workspace Presentation"),
      subtitle: normalizeText(meta.workspaceTitle || "UAEICP workspace"),
      bullets: [
        `Prepared for: ${normalizeText(meta.requestedBy || "UAEICP employee")}`,
        `Confidence: ${formatPresentationConfidence(analysis.overall_confidence || "possible")}`,
        normalizeText(meta.summary || analysis.summary || "")
      ].filter(Boolean)
    },
    {
      title: "Executive Summary",
      bullets: splitToBullets(meta.summary || analysis.summary || "No summary available.", 4)
    },
    {
      title: "Main Finding",
      bullets: splitToBullets(analysis.working_theory || "No working angle available.", 4)
    }
  ];

  const markdownSlides = parseMarkdownForSlides(meta.markdown || "");
  if (markdownSlides.length) {
    slides.push(...markdownSlides.slice(0, 8));
  } else {
    slides.push(
      { title: "Key Findings", bullets: (analysis.findings || []).slice(0, 5).map((item) => `${item.title}: ${item.detail}`) },
      { title: "Evidence", bullets: (analysis.evidence || []).slice(0, 5).map((item) => `${item.claim}: ${item.importance}`) },
      { title: "Risks And Gaps", bullets: [...(analysis.risks || []), ...(analysis.weaknesses || [])].slice(0, 6) },
      { title: "Recommended Next Actions", bullets: (analysis.development_priorities || []).slice(0, 5).map((item) => `${item.area}: ${item.action}`) }
    );
  }

  slides.push({
    title: "Human Review Notes",
    bullets: [
      normalizeText(analysis.uncertainty_note || "Review citations, assumptions, and missing documents before relying on this deck for decisions."),
      "Use the workspace evidence panel for exact document references.",
      "Escalate unclear policy or approval questions to the relevant internal owner."
    ]
  });

  return slides
    .map((slide) => ({
      title: normalizeText(slide.title || "Untitled Slide").slice(0, 90),
      subtitle: normalizeText(slide.subtitle || ""),
      bullets: normalizeBulletList(slide.bullets).slice(0, 6)
    }))
    .filter((slide) => slide.title || slide.bullets.length);
}

function parseMarkdownForSlides(markdown) {
  const lines = String(markdown || "").split(/\r?\n/);
  const slides = [];
  let current = null;
  for (const rawLine of lines) {
    const line = normalizeText(rawLine.replace(/^[-*]\s+/, ""));
    if (!line) {
      continue;
    }
    const heading = rawLine.match(/^#{1,3}\s+(.+)/);
    if (heading) {
      if (current) {
        slides.push(current);
      }
      current = { title: heading[1], bullets: [] };
      continue;
    }
    if (!current) {
      current = { title: "Presentation Notes", bullets: [] };
    }
    if (/^[-*]\s+/.test(rawLine) || current.bullets.length < 4) {
      current.bullets.push(line);
    }
  }
  if (current) {
    slides.push(current);
  }
  return slides.filter((slide) => normalizeBulletList(slide.bullets).length);
}

function normalizeBulletList(items) {
  return (Array.isArray(items) ? items : [items])
    .flatMap((item) => splitToBullets(item, 2))
    .map((item) => normalizeText(item).replace(/^[-*]\s+/, ""))
    .filter(Boolean)
    .slice(0, 8);
}

function splitToBullets(value, maxItems = 4) {
  const text = normalizeText(value);
  if (!text) {
    return [];
  }
  const sentenceParts = text
    .split(/(?<=[.!?])\s+/)
    .map((part) => normalizeText(part))
    .filter(Boolean);
  const parts = sentenceParts.length > 1 ? sentenceParts : text.split(/;\s+/);
  return parts.slice(0, maxItems).map((part) => part.length > 180 ? `${part.slice(0, 177).trim()}...` : part);
}

function addTitleSlide(pptx, colors, data) {
  const slide = pptx.addSlide();
  slide.background = { color: colors.pale };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.16, fill: { color: colors.green }, line: { color: colors.green } });
  slide.addText("UAEICP", { x: 0.55, y: 0.48, w: 1.5, h: 0.32, fontFace: "Aptos Display", fontSize: 13, bold: true, color: colors.green, margin: 0 });
  slide.addText(data.title, { x: 0.75, y: 1.7, w: 9.6, h: 1.1, fontFace: "Aptos Display", fontSize: 34, bold: true, color: colors.dark, breakLine: false, fit: "shrink" });
  slide.addText(data.subtitle || "Employee Intelligence Workspace", { x: 0.78, y: 2.92, w: 8.8, h: 0.35, fontSize: 15, color: colors.muted, margin: 0 });
  addBulletText(slide, colors, data.bullets, 0.95, 3.75, 10.6, 2.3);
  slide.addShape(pptx.ShapeType.rect, { x: 11.15, y: 0.52, w: 1.24, h: 0.62, rectRadius: 0.12, fill: { color: colors.green }, line: { color: colors.green } });
  slide.addText("ICP", { x: 11.43, y: 0.68, w: 0.7, h: 0.22, fontSize: 16, bold: true, color: colors.white, margin: 0, align: "center" });
  slide.addText(new Date().toLocaleDateString("en-GB"), { x: 0.78, y: 6.78, w: 2.2, h: 0.25, fontSize: 9, color: colors.muted, margin: 0 });
}

function addContentSlide(pptx, colors, data) {
  const slide = pptx.addSlide();
  slide.background = { color: colors.white };
  slide.addText("UAEICP", { x: 0.45, y: 0.28, w: 1.2, h: 0.22, fontSize: 9, bold: true, color: colors.green, margin: 0 });
  slide.addShape(pptx.ShapeType.line, { x: 0.45, y: 0.72, w: 12.3, h: 0, line: { color: colors.line, width: 1 } });
  slide.addText(data.title, { x: 0.68, y: 0.98, w: 11.7, h: 0.52, fontFace: "Aptos Display", fontSize: 24, bold: true, color: colors.dark, fit: "shrink" });
  if (data.subtitle) {
    slide.addText(data.subtitle, { x: 0.72, y: 1.56, w: 10.8, h: 0.28, fontSize: 10, color: colors.muted, margin: 0 });
  }
  addBulletText(slide, colors, data.bullets, 0.85, data.subtitle ? 2.02 : 1.88, 11.3, 4.65);
  slide.addShape(pptx.ShapeType.rect, { x: 0.45, y: 6.93, w: 12.3, h: 0.03, fill: { color: colors.gold }, line: { color: colors.gold } });
}

function addBulletText(slide, colors, bullets, x, y, w, h) {
  const textRuns = normalizeBulletList(bullets).map((bullet) => ({
    text: bullet,
    options: {
      bullet: { type: "bullet" },
      hanging: 4,
      breakLine: true
    }
  }));
  if (!textRuns.length) {
    slide.addText("No content available.", { x, y, w, h, fontSize: 15, color: colors.muted, margin: 0.08, fit: "shrink" });
    return;
  }
  slide.addText(textRuns, {
    x,
    y,
    w,
    h,
    fontSize: 15,
    color: colors.dark,
    breakLine: false,
    fit: "shrink",
    valign: "top",
    paraSpaceAfterPt: 10,
    margin: 0.08
  });
}

function formatPresentationConfidence(value) {
  return String(value || "possible").replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildAnalysisCacheKey(llmProvider, llmModel, workspaceType, workspaceLanguage, mode, analysisDepth) {
  return `${normalizeLlmProvider(llmProvider)}::${normalizeLlmModel(llmProvider, llmModel)}::${normalizeWorkspaceType(workspaceType)}::${normalizeWorkspaceLanguage(workspaceLanguage)}::${mode}::${normalizeAnalysisDepth(analysisDepth)}`;
}

function buildAnswerCacheKey(mode, analysisDepth, workspaceType, workspaceLanguage, llmProvider, llmModel, question) {
  return `${buildAnalysisCacheKey(llmProvider, llmModel, workspaceType, workspaceLanguage, mode, analysisDepth)}::${normalizeTextForCache(question)}`;
}

function normalizeTextForCache(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

function normalizeMode(value) {
  return value === "unguarded" ? "unguarded" : "guarded";
}

function normalizeProvider(value) {
  return value === "ollama" ? "ollama" : value === "anthropic" ? "anthropic" : value === "openai" ? "openai" : "auto";
}

function normalizeLlmProvider(value) {
  return value === "ollama" ? "ollama" : value === "anthropic" ? "anthropic" : "openai";
}

function defaultModelForProvider(provider) {
  const resolvedProvider = normalizeLlmProvider(provider);
  if (resolvedProvider === "ollama") {
    return OLLAMA_MODEL;
  }
  if (resolvedProvider === "anthropic") {
    return ANTHROPIC_MODEL;
  }
  return OPENAI_MODEL;
}

function normalizeLlmModel(provider, value) {
  const resolvedProvider = normalizeLlmProvider(provider);
  const raw = String(value || "").trim();
  const allowed = resolvedProvider === "ollama"
    ? OLLAMA_MODELS
    : resolvedProvider === "anthropic"
      ? ANTHROPIC_MODELS
      : OPENAI_MODELS;
  if (raw && allowed.includes(raw)) {
    return raw;
  }
  return defaultModelForProvider(resolvedProvider);
}

function canUseProvider(provider) {
  const resolvedProvider = normalizeLlmProvider(provider);
  if (resolvedProvider === "openai") {
    return HAS_OPENAI_KEY;
  }
  if (resolvedProvider === "anthropic") {
    return HAS_ANTHROPIC_KEY;
  }
  return Boolean(OLLAMA_BASE_URL);
}

function providerUnavailableMessage(provider) {
  const resolvedProvider = normalizeLlmProvider(provider);
  if (resolvedProvider === "openai") {
    return "OpenAI is not configured. Add OPENAI_API_KEY to .env before using the OpenAI provider.";
  }
  if (resolvedProvider === "anthropic") {
    return "Anthropic is not configured. Add ANTHROPIC_API_KEY to .env before using the Anthropic provider.";
  }
  return "Ollama is not configured. Start Ollama and set OLLAMA_BASE_URL in .env before using the Ollama provider.";
}

function resolveActiveProvider() {
  if (LLM_PROVIDER === "openai") {
    return "openai";
  }
  if (LLM_PROVIDER === "anthropic") {
    return "anthropic";
  }
  if (LLM_PROVIDER === "ollama") {
    return "ollama";
  }
  if (HAS_OPENAI_KEY) {
    return "openai";
  }
  if (HAS_ANTHROPIC_KEY) {
    return "anthropic";
  }
  return "ollama";
}

function normalizeWorkspaceType(value) {
  return "general";
}

function normalizeWorkspaceLanguage(value) {
  return value === "ar" ? "ar" : "en";
}

function detectPreferredLanguage(text, fallback = "en") {
  if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(String(text || ""))) {
    return "ar";
  }
  return normalizeWorkspaceLanguage(fallback);
}

function normalizeAnalysisDepth(value) {
  return value === "deep" ? "deep" : "quick";
}

function getModePrompt(mode) {
  return mode === "unguarded" ? unguardedSystemPrompt : guardedSystemPrompt;
}

function getWorkspaceTypeInstructions(workspaceType) {
  return `
This is a unified UAEICP employee intelligence workspace.
UAEICP means the Federal Authority for Identity, Citizenship, Customs & Port Security.
The uploaded files may include service requests, identity/citizenship/passport/residency/visa/customs/port-security materials, policy documents, circulars, forms, internal memos, case notes, correspondence, SOPs, checklists, or mixed operational records.
Analyze them as a grounded internal operations, document-review, and compliance-support analyst for UAEICP employees.
Always return the strongest practical takeaways, missing requirements, legal/compliance review points, policy or evidence gaps, wording/structure improvements, risks, and next actions supported by the documents.
When the input is only a typed employee request, help convert it into clear next steps, required information, draft wording, and suggested outputs.
Do not present legal conclusions as final legal advice; mark them as review points for human legal/supervisor verification unless the uploaded source directly proves them.
`.trim();
}

function getWorkspaceTypeQaInstructions(workspaceType) {
  return `
Answer like a careful UAEICP employee-support analyst.
Stay grounded in the documents and focus on document meaning, requirements, evidence, missing support, process implications, policy conflicts, legality/compliance review points, risks, improvements, and next steps.
If the user asks for drafting or editing help, produce concise employee-ready language, revised wording, and an edits summary while labeling assumptions clearly.
If the user asks whether something is legal or compliant, provide a review-oriented answer: what the documents support, what may be risky, what rule/policy source is missing, and what needs legal/supervisor verification.
Keep the framing limited to UAEICP employee document review, internal operations, compliance support, drafting, and service-workflow assistance.
`.trim();
}

function getLanguageInstructions(workspaceLanguage) {
  return languageInstructions[normalizeWorkspaceLanguage(workspaceLanguage)];
}

function getLanguageInstruction(workspaceLanguage) {
  return getLanguageInstructions(workspaceLanguage);
}

function sanitizeTitle(value) {
  const trimmed = String(value || "").trim();
  return trimmed || `Document Workspace ${new Date().toLocaleString("en-US")}`;
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function formatError(error) {
  if (error && typeof error === "object" && "message" in error) {
    return error.message;
  }
  return "Unexpected error while processing the workspace.";
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}
