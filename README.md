# ScamShield AI 🛡️
### AI-Powered Scam Message Analysis & Phishing URL Scanner

ScamShield AI is a cybersecurity awareness web application designed to help users identify potentially suspicious messages and website URLs. It combines AI-powered text analysis using Google's Gemma model with a rule-based heuristic algorithm for URL scanning.

The goal is to help users recognize potential scam indicators and make more informed decisions before trusting suspicious messages or links.

## Problem Statement

Online scams and phishing attempts often use urgent messages, fake offers, suspicious links, and misleading claims to trick people into sharing sensitive information.

Many users struggle to distinguish legitimate communications from potential scams.

ScamShield AI addresses this problem by providing an accessible interface where users can analyze suspicious messages and inspect URLs for potentially risky patterns.

## Key Features

### 1. AI-Powered Message Analysis
- Analyzes suspicious text using Google's Gemma generative AI model.
- Identifies potential scam indicators in messages.
- Provides a risk assessment and explanatory findings.
- Uses a dedicated instruction file to guide the analysis.

### 2. Phishing URL Scanner
- Examines URL structure without opening the submitted website.
- Detects potentially suspicious URL characteristics.
- Calculates a heuristic risk score.
- Displays detected indicators and an associated risk level.
- Supports HTTP and HTTPS URLs.

### 3. Analysis History
- Stores previous message analyses in a JSON file.
- Provides an interface for viewing recent checks.

### 4. Interactive Dashboard
- Dark cybersecurity-inspired interface.
- Message and URL scanning interfaces.
- Dynamic results and risk indicators.
- Responsive styling for different screen sizes.

## How It Works

### Message Analysis

1. The user enters a suspicious message.
2. The frontend sends the message to the Express backend.
3. The backend sends it to the Gemma model with analysis instructions.
4. The AI generates an assessment of potential scam indicators.
5. The frontend displays the returned findings.

### URL Scanning

1. The user enters a website URL.
2. The frontend submits it to the backend.
3. The backend validates the URL and inspects its structure.
4. Custom heuristic rules assign points to detected characteristics.
5. The backend calculates a risk level and returns the detected indicators.
6. The frontend displays the results.

**Important:** The URL scanner does not visit the submitted website or currently check its reputation against a live threat-intelligence database.

## Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Structures the web interface |
| CSS3 | Styling, layout, and responsive design |
| JavaScript | Frontend interactions and API communication |
| Node.js | JavaScript runtime for the backend |
| Express.js | Backend server and REST API endpoints |
| Google Gemma | AI-powered message analysis |
| Google GenAI SDK | Integration with Google's generative AI model |
| JSON | Stores analysis history |
| dotenv | Loads environment configuration |
| Git | Version control |

## URL Risk Scoring Algorithm

The URL scanner uses a **rule-based heuristic scoring algorithm**, not a trained machine-learning classifier.

It checks URL characteristics and assigns points to certain warning indicators.

| Indicator | Score |
|---|---:|
| Uses HTTP instead of HTTPS | +1 |
| Contains embedded credentials | +3 |
| Uses an IP address as the hostname | +2 |
| Contains a punycode hostname | +2 |
| Has five or more hostname parts | +1 |
| Hostname exceeds 50 characters | +1 |
| URL exceeds 150 characters | +1 |
| Contains sensitive wording | +1 |

The application maps the total score to a risk level:

- **LOW:** Score below 3
- **MEDIUM:** Score from 3 to 4
- **HIGH:** Score of 5 or above

HTTPS is recorded as a positive indicator but does not subtract points.

These are heuristic signals, not definitive proof that a website is malicious or safe.

## Project Structure

```text
ScamShield-AI/
│
├── index.js
├── package.json
├── package-lock.json
├── .env
├── .gitignore
│
├── skills/
│   └── scam-analysis/
│       └── SKILL.md
│
├── data/
│   └── history.json
│
└── public/
    ├── index.html
    ├── style.css
    └── script.js
```

### File Responsibilities

- `index.js` — Express server, Gemma integration, message analysis, URL scanning, and API routes.
- `package.json` — Project metadata, dependencies, and npm scripts.
- `.env` — API key, model configuration, and server port.
- `.gitignore` — Excludes secrets and unnecessary files from Git.
- `skills/scam-analysis/SKILL.md` — Instructions for AI message analysis.
- `data/history.json` — Stores message-analysis history.
- `public/index.html` — Dashboard structure.
- `public/style.css` — Dashboard styling and responsive layout.
- `public/script.js` — Frontend interactions and API communication.

## Installation and Setup

### Prerequisites

Install the following:

- Node.js and npm
- A Google Gemini API key with access to the configured Gemma model
- A code editor, such as Visual Studio Code

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Navigate to the project directory:

```bash
cd hackfest-test
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
GEMMA_API_KEY=your_api_key_here
GEMMA_MODEL=gemma-4-26b-a4b-it
PORT=3000
```

Replace `your_api_key_here` with your own API key. Keep this file private and never commit it to GitHub.

Ensure that the configured model name is available to your API key.

### 4. Start the application

```bash
npm start
```

If your project does not have a `start` script configured, use:

```bash
node index.js
```

### 5. Open the application

Visit:

```text
http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Checks server status |
| POST | `/api/analyze` | Analyzes suspicious message text using Gemma |
| GET | `/api/history` | Retrieves saved message-analysis history |
| POST | `/api/scan-url` | Inspects URL structure and returns heuristic risk indicators |

### Example: URL Scanner Request

**Endpoint:** `POST /api/scan-url`

Request body:

```json
{
  "url": "http://192.0.2.1/login/verify"
}
```

The response includes the URL's hostname, protocol, heuristic score, risk level, detected indicators, and a disclaimer.

The example address uses a reserved documentation IP range and is intended only for testing.

## Security and Limitations

ScamShield AI is a prototype for cybersecurity awareness and preliminary risk assessment.

- AI-generated message assessments can be inaccurate.
- URL scoring uses heuristic rules and may produce false positives or miss malicious URLs.
- The scanner does not currently integrate a live threat-intelligence or website-reputation service.
- HTTPS does not guarantee that a website is trustworthy.
- A LOW risk result does not establish that a message or URL is safe.
- The application should not replace professional security tools or independent verification.

Avoid entering real passwords, authentication codes, financial information, or other sensitive personal data.

## Future Improvements

Potential future enhancements include:

- Integration with a trusted URL threat-intelligence service.
- More comprehensive phishing URL detection.
- Evaluation against labeled legitimate and malicious examples.
- Measurement of false-positive and false-negative rates.
- Improved analysis history and reporting.
- User accounts and database-backed storage.
- Additional security checks and automated testing.

## Project Purpose

ScamShield AI was developed as a cybersecurity-focused hackathon project to demonstrate how generative AI and transparent, rule-based analysis can work together to help users recognize potential online scams.

## Disclaimer

ScamShield AI provides informational risk assessments only. It does not guarantee the detection of scams or phishing attacks, and it does not guarantee the safety of any message or website.

Use independent verification and trusted security services before acting on suspicious communications.

---

**Built with Node.js, Express, JavaScript, and Google Gemma AI.**