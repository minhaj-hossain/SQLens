# AI Engineering Bootcamp: Plan and Tracker

## 1. Vision and Goal
A free, open-source AI Engineering bootcamp specifically designed for Full-Stack Web Developers (React, Node, SQL/PostgreSQL). The goal is to transition developers from standard web development to modern AI engineering (APIs, RAG, Tool Calling, Agents) using their existing skills.

## 2. Core Pedagogy & Technical Strategy

### The Ladder Method
- Build up concepts line-by-line using small, cumulative additions.
- Emphasize "Predict the Output" checkpoints.
- Use deliberate bug-fixing exercises to build real intuition.

### The Hybrid Sandbox Execution Environment
- **Phase 1 (Tracks 0-2): Pyodide In-Browser.** We use `next/dynamic` to lazy-load Pyodide and CodeMirror. This provides a zero-setup, frictionless sandbox for learning Python syntax and basic Data/ML concepts without crashing the browser. Uses "Browser-Native API-First" strategy (calling Hugging Face/Groq APIs instead of running local heavy models).
- **Phase 2 (Tracks 3-6): Local Handoff.** Transition learners to their local VS Code environment. They build a FastAPI backend connected to a React frontend, bridging their old skills with their new skills.

### Bridging Existing Knowledge
- **Vector Search:** Instead of Pinecone or Chroma, we use **PostgreSQL with `pgvector`** (and Prisma) because the users already know SQL and relational databases.
- **Architecture:** We explicitly teach Server-Sent Events (SSE) and Streaming (Vercel AI SDK) because AI API latency breaks standard Request/Response MERN architectures.

---

## 3. Curriculum Tracks (Web Dev to AI Engineer)

| Track | Topic | Focus for a Web Dev | Portfolio Project | Status |
|---|---|---|---|---|
| **0** | **Python for JS Devs** | `npm` vs `pip`, JS Objects vs Python Dicts, `fetch` vs `requests`. | *Setup Workspace* | ✅ Drafted |
| **1** | **Data Engineering** | Pandas basics (advanced array/object mapping on steroids). | *Data Cleaner Script* | 🔲 Not Started |
| **2** | **Applied ML APIs** | Using Hugging Face Inference APIs (Bridging Node backends to AI). | *Sentiment API* | 🔲 Not Started |
| **3** | **LLMs & Prompting** | System prompts, Tool Calling (Returning JSON for React). | *JSON Extraction Tool* | 🔲 Not Started |
| **4** | **RAG & Vector Search**| Embeddings, Chunking, and **PostgreSQL `pgvector`** via Prisma. | *Semantic Search Engine* | 🔲 Not Started |
| **5** | **Agents & State** | LangGraph (Managing complex state loops, similar to Redux). | *Research Agent* | 🔲 Not Started |
| **6** | **The AI Full-Stack** | FastAPI + React integration, **Streaming (SSE)**, Vercel AI SDK. | *Full-Stack AI Web App* | 🔲 Not Started |

---

## 4. Implementation Tracker

### Phase 1: Platform Prototype & Technical Spike
- [x] Create hidden test route `/ai-sandbox` in the Next.js app.
- [x] Implement lazy-loaded CodeMirror editor.
- [x] Implement Pyodide execution environment (`next/dynamic`).
- [x] Intercept standard output (`print()`) to display in the UI.
- [x] Write a silent test-runner that can append `assert` statements to user code and return friendly hints.

### Phase 2: Curriculum Content Writing (Markdown)
- [x] Draft Track 0 (Python for JS Devs) markdown content.
- [ ] Draft Track 1 (Data Engineering) markdown content.
- [ ] Draft Track 2 (Applied ML APIs) markdown content.
- [ ] Draft Track 3 (LLMs & Prompting) markdown content.
- [ ] Draft Track 4 (RAG & Vector Search with pgvector) markdown content.
- [ ] Draft Track 5 (Agents & State) markdown content.
- [ ] Draft Track 6 (The AI Full-Stack) markdown content.

### Phase 3: Platform Integration
- [ ] Build Landing Page (`/`).
- [ ] Build Learner Dashboard (`/dashboard`) with progress tracking.
- [ ] Build Interactive Lesson Interface (`/learn/[track]/[module]`) with split-screen (Concept vs Pyodide).
- [ ] Integrate content markdown parser with the UI.

### Phase 4: Polish & Deployment
- [ ] QA testing the Pyodide environment on various devices.
- [ ] Finalize the "Colab Handoff" or "Local IDE Handoff" instructions for later tracks.
- [ ] Launch MVP.
