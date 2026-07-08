# DocuMind AI

DocuMind AI is a UAEICP-focused employee document intelligence workspace.

It helps employees upload documents or write a brief, analyze document completeness and risks, ask grounded questions, generate revised drafts, prepare internal memos, create service checklists, build compliance review notes, and export PowerPoint briefing decks.

## Core Features

- Secure login and admin user management
- Saved workspaces and workspace history
- Multi-file document upload
- Text-only workspace creation when no file is available
- Guarded and unguarded AI analysis modes
- Document Q&A with evidence, citations, uncertainty, and confidence labels
- UAEICP document review framing for policies, circulars, forms, memos, case notes, and service workflows
- Legal/compliance review-point identification with human verification notes
- Generated outputs including markdown, text, JSON, and PowerPoint
- Visual generation and refinement using OpenAI image generation
- OpenAI, Claude/Anthropic, and Ollama provider support
- PostgreSQL support for production and SQLite fallback for local development

## Local Development

Create `.env` from `.env.example`, then run:

```bash
npm install
npm start
```

Open:

```text
http://localhost:3000
```

## Easy Hostinger Deployment

See:

```text
deploy/README_EASY_HOSTINGER.md
```
