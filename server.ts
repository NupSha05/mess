import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { AIService } from './server/aiService.js';
import {
  getRAGStatus,
  getAllRAGDocuments,
  getRAGDocument,
  searchRAGKnowledgeBase,
} from './server/ragKnowledgeBase.js';
import fs from 'fs';
import {
  isServerSupabaseConfigured,
  ensureStorageBucketExists,
  checkDatabaseSchemaStatus,
} from './server/supabaseServer.js';
import { AccountStore } from './server/accountStore.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// 0. Authoritative Student Authentication & Profile Retrieval Endpoints
app.post('/api/auth/signup', (req: Request, res: Response) => {
  try {
    const { email, password, fullName, college, branch, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const result = AccountStore.signUp({
      email,
      password,
      fullName: fullName || '',
      college,
      branch,
      role,
    });
    return res.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        college: result.user.college,
        branch: result.user.branch,
        role: result.user.role,
        createdAt: result.user.createdAt,
      },
      profile: result.profile,
    });
  } catch (err: any) {
    console.error('Error in /api/auth/signup:', err);
    return res.status(500).json({ error: err.message || 'Signup failed' });
  }
});

app.post('/api/auth/signin', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const result = AccountStore.signIn(email, password);
    return res.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        college: result.user.college,
        branch: result.user.branch,
        role: result.user.role,
        createdAt: result.user.createdAt,
        lastSignInAt: result.user.lastSignInAt,
      },
      profile: result.profile,
    });
  } catch (err: any) {
    console.warn('Sign in notice:', err.message);
    return res.status(401).json({ error: err.message || 'Authentication failed' });
  }
});

app.get('/api/auth/profile/:userId', (req: Request, res: Response) => {
  try {
    const profile = AccountStore.getProfile(req.params.userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    return res.json({ profile });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch profile' });
  }
});

app.post('/api/auth/profile/:userId', (req: Request, res: Response) => {
  try {
    const saved = AccountStore.saveProfile(req.params.userId, req.body);
    return res.json({ success: true, profile: saved });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to save profile' });
  }
});

app.get('/api/auth/userdata/:userId/:key', (req: Request, res: Response) => {
  try {
    const data = AccountStore.getUserData(req.params.userId, req.params.key);
    return res.json({ data: data || [] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch user data' });
  }
});

app.post('/api/auth/userdata/:userId/:key', (req: Request, res: Response) => {
  try {
    AccountStore.saveUserData(req.params.userId, req.params.key, req.body);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to save user data' });
  }
});

// 1. Ask Career Saathi (Conversational Agent with Selective RAG)
app.post('/api/ai/ask', async (req: Request, res: Response) => {
  try {
    const { question, studentContext, currentJD, chatHistory } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const result = await AIService.askCareerSaathi({
      question,
      studentContext,
      currentJD,
      chatHistory,
    });

    return res.json(result);
  } catch (error: any) {
    console.error('Error in /api/ai/ask:', error);
    return res.status(500).json({
      error: 'Failed to process career query',
      details: error.message,
    });
  }
});

// 2. Parse Job Description (Semantic Requirement Extraction & Classification)
app.post('/api/ai/parse-jd', async (req: Request, res: Response) => {
  try {
    const { jdText } = req.body;
    if (!jdText) return res.status(400).json({ error: 'Job description text is required' });

    const parsed = await AIService.parseJobDescription(jdText);
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error parsing JD:', err);
    return res.status(500).json({ error: 'Failed to parse JD', message: err.message });
  }
});

// 3. AI Practice Coach Answer Evaluation (STAR / Case / Technical Rubrics)
app.post('/api/ai/evaluate-practice', async (req: Request, res: Response) => {
  try {
    const { question, answer, category, targetRole, rubricFramework } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and student answer are required' });
    }

    const evaluation = await AIService.evaluatePracticeAnswer({
      question,
      answer,
      category: category || 'Personal Interview',
      targetRole: targetRole || 'Software Development Engineer',
      rubricFramework: rubricFramework || 'STAR Method',
    });

    return res.json(evaluation);
  } catch (err: any) {
    console.error('Error in practice evaluation:', err);
    return res.status(500).json({ error: 'Failed to evaluate practice answer', message: err.message });
  }
});

// 4. CV Analysis (Cross-Validation: Profile ↔ CV ↔ Target JD)
app.post('/api/document/extract-text', async (req: Request, res: Response) => {
  try {
    const { fileBase64, fileName, mimeType } = req.body;
    if (!fileBase64) {
      return res.status(400).json({ error: 'File data is required' });
    }

    const buffer = Buffer.from(fileBase64, 'base64');
    let extractedText = '';

    // If text or markdown file, decode UTF-8 directly
    if (
      mimeType?.includes('text') ||
      mimeType?.includes('markdown') ||
      fileName?.endsWith('.txt') ||
      fileName?.endsWith('.md')
    ) {
      extractedText = buffer.toString('utf-8');
      return res.json({ success: true, text: extractedText, fileName });
    }

    // If PDF or Doc and AI service is available, attempt multimodal document reading
    if (mimeType?.includes('pdf') || fileName?.endsWith('.pdf')) {
      const aiText = await AIService.extractDocumentText({ fileBase64, fileName, mimeType });
      if (aiText) {
        return res.json({ success: true, text: aiText, fileName });
      }
    }

    // Robust text scraper fallback for binary documents (strips nulls/control chars)
    const rawStr = buffer.toString('utf-8');
    const cleaned = rawStr
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (cleaned.length > 50) {
      extractedText = cleaned;
    } else {
      extractedText = `[Uploaded Document: ${fileName || 'document'}]\n(Parsed file size: ${(buffer.length / 1024).toFixed(1)} KB)`;
    }

    return res.json({ success: true, text: extractedText, fileName });
  } catch (err: any) {
    console.error('Error extracting document text:', err);
    return res.status(500).json({ error: 'Failed to extract document text', message: err.message });
  }
});

app.post('/api/ai/analyze-cv', async (req: Request, res: Response) => {
  try {
    const { profile, cvText, activeJD } = req.body;
    if (!cvText) return res.status(400).json({ error: 'CV text is required' });

    const analysis = await AIService.analyzeCV(profile, cvText, activeJD);
    return res.json(analysis);
  } catch (err: any) {
    console.error('Error in CV analysis:', err);
    return res.status(500).json({ error: 'Failed to analyze CV', message: err.message });
  }
});

// 4b. Extract CV Entities & Quality Analysis
app.post('/api/ai/extract-cv', async (req: Request, res: Response) => {
  try {
    const { cvText } = req.body;
    if (!cvText) return res.status(400).json({ error: 'CV text is required' });

    const extracted = await AIService.extractCVEntities(cvText);
    return res.json({ success: true, extracted });
  } catch (err: any) {
    console.error('Error in CV entity extraction:', err);
    return res.status(500).json({ error: 'Failed to extract CV entities', message: err.message });
  }
});

// 5. LinkedIn Analysis (Visibility vs Genuine Skill Gaps)
app.post('/api/ai/analyze-linkedin', async (req: Request, res: Response) => {
  try {
    const { profile, linkedInData, activeJD } = req.body;
    const analysis = await AIService.analyzeLinkedIn(profile, linkedInData, activeJD);
    return res.json(analysis);
  } catch (err: any) {
    console.error('Error in LinkedIn analysis:', err);
    return res.status(500).json({ error: 'Failed to analyze LinkedIn profile', message: err.message });
  }
});

app.post('/api/ai/parse-linkedin-export', async (req: Request, res: Response) => {
  try {
    const { exportText } = req.body;
    if (!exportText) return res.status(400).json({ error: 'Export text is required' });
    const parsed = await AIService.parseLinkedInExport(exportText);
    return res.json({ success: true, parsed });
  } catch (err: any) {
    console.error('Error in parsing LinkedIn export:', err);
    return res.status(500).json({ error: 'Failed to parse LinkedIn export', message: err.message });
  }
});

// 6. Direct Email Report Delivery Endpoint Retired (Prompt Requirement 14)
app.post('/api/email/send-report', (_req: Request, res: Response) => {
  return res.status(410).json({
    success: false,
    error: 'Email report transmission has been retired. Please use Download Complete Report for offline PDF and audit export.',
  });
});

app.get('/api/email/logs', (_req: Request, res: Response) => {
  return res.json({ logs: [] });
});

// 7. RAG Knowledge Base Endpoints (Directly linked to /RAG_KNOWLEDGE_BASE)
app.get('/api/rag/status', (_req: Request, res: Response) => {
  return res.json(getRAGStatus());
});

app.get('/api/rag/documents', (_req: Request, res: Response) => {
  return res.json({ documents: getAllRAGDocuments() });
});

app.get('/api/rag/documents/:docId', (req: Request, res: Response) => {
  const doc = getRAGDocument(req.params.docId);
  if (!doc) {
    return res.status(404).json({ error: `RAG document ${req.params.docId} not found` });
  }
  return res.json(doc);
});

app.post('/api/rag/query', (req: Request, res: Response) => {
  const { query, limit } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  const matches = searchRAGKnowledgeBase(query, limit ? Number(limit) : 5);
  return res.json({ query, matches });
});

// 8. System Healthcheck & Service Status
app.get('/api/health', (_req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    service: 'Career Saathi AI Centralized Intelligence Service',
    hasApiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY',
    supabaseConnected: isServerSupabaseConfigured(),
    version: '1.0.0',
    mode: process.env.NODE_ENV || 'development',
  });
});

app.get('/api/supabase/status', (_req: Request, res: Response) => {
  return res.json({
    configured: isServerSupabaseConfigured(),
    hasServerUrl: Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
    hasServerSecretKey: Boolean(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
    provider: 'Supabase PostgreSQL + Storage + Auth',
  });
});

app.get('/api/supabase/migration-sql', (_req: Request, res: Response) => {
  try {
    const migrationPath = path.resolve(__dirname, 'supabase', 'migrations', '20261008000001_initial_career_saathi_schema.sql');
    if (fs.existsSync(migrationPath)) {
      const sql = fs.readFileSync(migrationPath, 'utf8');
      return res.json({ success: true, sql, fileName: '20261008000001_initial_career_saathi_schema.sql' });
    }
    return res.status(404).json({ error: 'Migration file not found' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to read migration SQL', message: err.message });
  }
});

app.get('/api/supabase/schema-status', async (_req: Request, res: Response) => {
  try {
    const bucketStatus = await ensureStorageBucketExists();
    const schemaStatus = await checkDatabaseSchemaStatus();
    return res.json({
      configured: isServerSupabaseConfigured(),
      bucket: bucketStatus,
      schema: schemaStatus,
      supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to check schema status', message: err.message });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  // Ensure storage bucket is initialized
  ensureStorageBucketExists().then((res) => {
    console.log(`[Storage] Init check: ${res.message}`);
  }).catch(() => {});
  const isProd = process.env.NODE_ENV === 'production';
  const httpServer = http.createServer(app);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const port = Number(PORT) || 3000;
  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`Career Saathi AI Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
