# Document Analysis Workspace

## Overview

Document Analysis Workspace is a local web application for uploading document sets, analyzing them with AI, and asking follow-up questions against the same corpus. It supports two reasoning modes:

- Guarded: conservative, evidence-bound, citation-heavy analysis
- Unguarded: exploratory analysis with speculative ideas clearly separated from verified findings

The system combines OpenAI file ingestion, retrieval-based question answering, structured outputs, session-based login, workspace history, and admin user management.

## Core Features

### Document ingestion

- Multi-file upload with support for PDF, DOC, DOCX, TXT, RTF, MD, CSV, XLSX, XLS, PNG, JPG, JPEG, TIF, and TIFF
- File validation before processing
- Up to 50 files per upload
- Local tracking of formats and supported file counts

### Analysis workflow

- Create a workspace for a document set
- Upload supported files
- Build an OpenAI vector store for retrieval
- Run structured analysis across the uploaded corpus
- Save analysis results and chat history per workspace

### Guarded and Unguarded modes

- Guarded mode emphasizes citation-backed, low-speculation answers
- Unguarded mode allows pattern-finding and hypotheses while labeling uncertainty
- Each mode can be rerun independently
- Mode-specific analysis can be cached per workspace

### Chat and Q&A

- Ask questions against the uploaded corpus
- Return a short direct answer plus key points
- Show citations, evidence strength, uncertainty notes, and verification guidance
- Cache repeated questions within a workspace

### Users and admin

- Session-based login
- Admin seed user created automatically if none exists
- Admin can create additional users
- Regular users only see their own workspaces
- Admin can view all workspaces

## Technical Architecture

### Backend

- Runtime: Node.js
- Framework: Express
- Sessions: express-session
- Auth hashing: bcryptjs
- Upload handling: multer
- AI integration: OpenAI Node SDK
- Validation/schema output: zod

### Frontend

- Plain HTML, CSS, and JavaScript
- No frontend framework
- Single-page workspace experience
- Local rendering of saved workspace history and chat history

### Storage

- `data/users.json`: local user store
- `data/cases.json`: local workspace and chat history store
- OpenAI vector stores: retrieval layer for document search and question answering

## AI and RAG Design

The app is built around retrieval-grounded document analysis rather than free-form answering.

### RAG flow

1. Documents are uploaded to OpenAI
2. Files are attached to a vector store
3. Analysis requests use file search against that vector store
4. Structured outputs are generated using Zod schemas
5. Answers are returned with confidence, citations, and uncertainty notes

### Analysis schema

The workspace analysis includes:

- summary
- working theory
- overall confidence
- uncertainty note
- findings
- evidence
- contradictions
- entities
- timeline
- open questions
- suggested questions
- warnings

### Answer schema

Each chat response includes:

- short answer
- overall confidence
- uncertainty note
- verification note
- key points
- supporting points
- counterpoints
- speculative leads
- next questions

## Confidence and uncertainty handling

The application currently uses these calibrated confidence levels:

- Confirmed
- Probable
- Possible
- Insufficient Evidence

These levels are used in both dashboard analysis and chat responses. The backend prompts explicitly instruct the model to prefer `insufficient_evidence` over guessing.

The interface also surfaces:

- uncertainty notes
- verification notes
- evidence strength chips
- citation references

## Citation behavior

The app pushes citations into both analysis and Q&A outputs by requiring:

- `source_file`
- `source_excerpt`
- `citation_reference`

On the frontend, citations are shown prominently in:

- findings
- evidence cards
- key points
- supporting points

## Reliability and safeguards

### Implemented

- File type validation before ingestion
- Citation-focused prompting
- Confidence calibration
- Uncertainty handling
- Cached mode-specific analysis
- Cached repeated Q&A requests
- Session-based access control
- Admin-only user creation

### Current limitations

- No OCR fallback pipeline implemented locally yet
- No background queue worker; progress is simulated on the frontend
- No true token streaming yet
- No relational database; storage is JSON-file based
- No hybrid search stack such as Weaviate currently implemented locally
- No human review workflow beyond visible citations and uncertainty labels

## Main API endpoints

### Authentication

- `GET /api/auth/me`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Users

- `GET /api/users`
- `POST /api/users`

### Workspaces

- `GET /api/cases`
- `GET /api/cases/:id`
- `POST /api/cases`
- `POST /api/cases/:id/analyze`
- `POST /api/cases/:id/questions`

### Health

- `GET /api/health`

## Important files

- `server.js`: backend, auth, ingestion, OpenAI integration, routing
- `public/index.html`: UI structure
- `public/styles.css`: UI styling
- `public/script.js`: frontend behavior
- `.env`: local configuration
- `.env.example`: configuration template
- `data/users.json`: user data
- `data/cases.json`: workspace data

## Environment configuration

Required or important variables:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `PORT`
- `SESSION_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## Current UX behavior

- Login-first experience
- Sidebar for new workspace creation and saved history
- Workspace summary with confidence and uncertainty
- Chat-first layout for immediate questioning
- Compact analysis cards for high-signal findings

## Recommended next steps

### Product

- Add full source highlighting inside documents
- Add workspace delete/archive actions
- Add password change and reset flows
- Add per-user profile management

### AI reliability

- Introduce stricter human-review workflows
- Add explicit hallucination QA checks
- Separate verified vs speculative views more strongly
- Track answer provenance more deeply

### Platform

- Move JSON storage to PostgreSQL
- Add Redis caching
- Add background workers and job queues
- Add true streaming responses
- Add OCR and richer ingestion pipelines
- Add audit logs and exportable reports

## Summary

This project is now a functional MVP for grounded document analysis with:

- workspace-based document ingestion
- retrieval-backed analysis
- Guarded and Unguarded modes
- saved user history
- admin user management
- confidence and citation-aware responses

It is not yet a production-ready platform, but it provides a strong foundation for a more robust legal-tech, compliance, research, or general document intelligence product.
