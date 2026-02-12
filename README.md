# 🤖 Customer Support Agent

An **AI-powered customer support chatbot** built with **LangGraph**, **FastAPI**, and **React**. The agent intelligently categorizes user queries, analyzes sentiment, and routes them to specialized handlers — delivering context-aware support responses in real time through a premium glassmorphic chat interface.

---

## ✨ Features

- **Intelligent Query Categorization** — Automatically classifies incoming queries into **Technical**, **Billing**, or **General** categories using an LLM.
- **Sentiment Analysis** — Detects the emotional tone of each query (**Positive**, **Negative**, **Neutral**) to tailor the response strategy.
- **Smart Routing** — Routes queries to the appropriate handler based on category and sentiment; negative-sentiment queries are automatically **escalated to a human agent**.
- **Rate Limiting** — API-level rate limiting (5 requests/minute per IP) powered by SlowAPI to prevent abuse.
- **Premium Chat UI** — A stunning dark-themed interface with glassmorphism, animated gradients, typing indicators, and metadata badges.
- **Markdown Rendering** — Bot responses are rendered as rich Markdown with support for code blocks, lists, tables, and more.
- **Suggestion Chips** — Pre-defined quick-action buttons to help users get started instantly.

---

## 🏗️ Architecture

The core of the application is a **LangGraph state machine** that orchestrates the support workflow:

```
┌─────────────┐
│   User Query │
└──────┬──────┘
       │
       ▼
┌──────────────┐
│  Categorize  │  →  Technical / Billing / General
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Analyse Sentiment │  →  Positive / Negative / Neutral
└──────┬───────────┘
       │
       ▼
┌──────────────────────┐
│   Conditional Router  │
├───────────────────────┤
│ Negative Sentiment?   │──→  Escalate to Human
│ Technical Category?   │──→  Technical Handler
│ Billing Category?     │──→  Billing Handler
│ Otherwise             │──→  General Handler
└───────────────────────┘
       │
       ▼
┌──────────────┐
│   Response   │
└──────────────┘
```

### Agent Workflow (LangGraph Nodes)

| Node                  | Description                                                                 |
|-----------------------|-----------------------------------------------------------------------------|
| `categorize`          | Classifies the query into Technical, Billing, or General                    |
| `analyse_sentiment`   | Detects the sentiment as Positive, Negative, or Neutral                    |
| `handle_technical`    | Generates a technical support response                                      |
| `handle_billing`      | Generates a billing support response                                        |
| `handle_general`      | Generates a general support response                                        |
| `escalate`            | Returns a pre-defined escalation message for negative-sentiment queries    |
| `route` *(conditional)* | Routes to the appropriate handler based on category and sentiment        |

---

## 🛠️ Tech Stack

### Backend
| Technology                  | Purpose                                |
|-----------------------------|----------------------------------------|
| **Python 3.13+**            | Runtime                                |
| **FastAPI**                 | REST API framework                     |
| **LangGraph**               | Agent state machine & workflow engine  |
| **LangChain**               | LLM integration & prompt management    |
| **Google Gemini (2.5 Flash)** | Large Language Model                 |
| **SlowAPI**                 | Rate limiting middleware               |
| **Uvicorn**                 | ASGI server                            |
| **Pydantic**                | Request/response validation            |
| **uv**                      | Python package manager                 |

### Frontend
| Technology              | Purpose                                  |
|-------------------------|------------------------------------------|
| **React 19**            | UI library                               |
| **Vite 8**              | Build tool & dev server                  |
| **Tailwind CSS 4**      | Utility-first CSS framework              |
| **Axios**               | HTTP client                              |
| **React Markdown**      | Markdown rendering for bot responses     |
| **Lucide React**        | Icon library                             |
| **shadcn/ui**           | Reusable UI components (Button, Card, Input) |

---

## 📁 Project Structure

```
Customer Support Agent/
├── app/                        # Backend application
│   ├── __init__.py
│   ├── agent.py                # LangGraph agent — nodes, edges & workflow
│   ├── limiter.py              # Rate limiter configuration (SlowAPI)
│   └── main.py                 # FastAPI app — routes, CORS & middleware
│
├── frontend/                   # React frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── assets/             # Images & media
│   │   ├── components/
│   │   │   └── ui/             # shadcn/ui components (Button, Card, Input)
│   │   ├── lib/
│   │   │   └── utils.js        # Utility functions (cn helper)
│   │   ├── App.jsx             # Main chat application component
│   │   ├── index.css           # Global styles, design system & animations
│   │   └── main.jsx            # React entry point
│   ├── index.html              # HTML template
│   ├── package.json
│   ├── vite.config.js          # Vite configuration with path aliases
│   ├── postcss.config.js
│   └── eslint.config.js
│
├── main.py                     # Entry point — starts Uvicorn server
├── pyproject.toml              # Python project metadata & dependencies
├── requirements.txt            # Pip-compatible dependency list
├── .env                        # Environment variables (not committed)
├── .gitignore
├── .python-version             # Python version pin (3.13)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.13+**
- **Node.js 18+** and **npm**
- **uv** (recommended Python package manager) — [Install uv](https://docs.astral.sh/uv/)
- A **Google AI Studio API Key** — [Get one here](https://aistudio.google.com/apikey)

### 1. Clone the Repository

```bash
git clone https://github.com/vetrinanda/Customer-Support-Agent.git
cd Customer-Support-Agent
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```env
GOOGLE_API_KEY=your_google_api_key_here
```

### 3. Backend Setup

#### Option A: Using `uv` (Recommended)

```bash
# Create virtual environment and install dependencies
uv sync
```

#### Option B: Using `pip`

```bash
# Create a virtual environment
python -m venv .venv

# Activate it
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Start the Backend Server

```bash
python main.py
```

The API server will start at **`http://127.0.0.1:8000`**.

### 5. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server will start at **`http://localhost:5173`** (default Vite port).

---

## 📡 API Reference

### `GET /`
Health check endpoint.

**Response:**
```json
{ "Hello": "World" }
```

### `POST /chat`
Send a customer support query to the AI agent.

**Request Body:**
```json
{
  "query": "I can't login to my account"
}
```

**Response:**
```json
{
  "query": "I can't login to my account",
  "category": "Technical",
  "sentiment": "Negative",
  "response": "I will escalate your query to the Human and they will connect you as soon as possible"
}
```

**Rate Limit:** 5 requests per minute per IP address. Returns `429 Too Many Requests` when exceeded.

---

## 🎨 UI Highlights

The frontend features a **premium dark-themed** chat interface designed with modern aesthetics:

- **Glassmorphism** — Frosted-glass card container with `backdrop-filter: blur(24px)`
- **Animated Background** — Slowly shifting radial gradients for a dynamic feel
- **Shimmer Border** — Subtle animated gradient border on the chat card
- **Typing Indicator** — Three pulsing dots shown while the AI is generating a response
- **Metadata Badges** — Each bot response displays its detected **category** and **sentiment** as color-coded pills
- **Rate Limit UX** — A dedicated warning card with amber styling when the user exceeds the rate limit
- **Smooth Animations** — `fadeInUp` entrance animations on every message for a polished experience
- **Custom Scrollbar** — Minimal, styled scrollbar matching the dark theme
- **Google Inter Font** — Clean, modern typography throughout

---

## 🔧 Configuration

| Variable           | Description                         | Default         |
|--------------------|-------------------------------------|-----------------|
| `GOOGLE_API_KEY`   | Google AI Studio API key            | *Required*      |
| Backend host       | Uvicorn host                        | `127.0.0.1`     |
| Backend port       | Uvicorn port                        | `8000`          |
| Rate limit         | Max requests per minute per IP      | `5/minute`      |
| LLM model          | Google Generative AI model          | `gemini-2.5-flash` |

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
