# ResumeAI Analyzer

ResumeAI Analyzer is an AI-powered Full-Stack Web Application designed to act as an Applicant Tracking System (ATS) and career assistant. It allows users to upload their resume (PDF) and an optional job description to receive a comprehensive analysis, ATS compatibility score, and actionable feedback to improve their chances of landing an interview.

## 🚀 Features

- **ATS Scoring:** Generates an overall ATS compatibility score (0-100) based on formatting, keywords, skills, experience, and grammar.
- **Job Description Matching:** Compares the uploaded resume directly against a job description to find missing keywords and skill gaps.
- **Real-Time AI Streaming:** Analysis is streamed in real-time to the frontend (using Server-Sent Events) so you don't have to wait for the entire generation process to finish.
- **Detailed Markdown Reports:** Feedback is beautifully formatted in Markdown, highlighting strengths, weaknesses, grammar issues, and professional suggestions.
- **PDF Extraction:** Extracts text seamlessly from uploaded PDF resumes.

## 🛠️ Technology Stack

**Frontend:**
- [React 19](https://react.dev/)
- [Vite](https://vitejs.dev/)
- `lucide-react` (Icons)
- `react-markdown` (Report rendering)
- `axios` & `fetch` (API requests & Streaming SSE)

**Backend:**
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- [Google GenAI API (Gemini 2.5 Flash)](https://ai.google.dev/) (AI Core)
- `multer` (In-memory file uploads)
- `pdf-parse` (PDF text extraction)
- `mongoose` (Database integration)
- `dotenv` (Environment variable management)

## 📋 Requirements & Prerequisites

To run this project locally, you will need:
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- A **Google Gemini API Key**. You can get one from [Google AI Studio](https://aistudio.google.com/).

## ⚙️ Local Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/arunsakthi2802-star/ResumeAI-Analyzer.git
cd ResumeAI-Analyzer
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory and add your Gemini API Key:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
PORT=5000
```
Start the backend development server:
```bash
npm run dev
# or
node index.js
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
Start the Vite development server:
```bash
npm run dev
```

### 4. Open the App
Navigate to `http://localhost:5173` in your browser.

## 🧠 Existing System & Architecture

1. **Client Interface (`Dashboard.jsx`):** 
   - Users upload a resume file and paste a Job Description. 
   - A `FormData` object is sent to the backend via a `POST` request.
   - The UI listens to a Server-Sent Events (SSE) stream using the native `fetch` API and `TextDecoder` to render the Markdown output progressively, eliminating long loading screens.
2. **Server-side Processing (`analyzeController.js`):**
   - Express router receives the file via `multer` (stored in-memory).
   - `pdf-parse` reads the buffer and extracts raw text.
   - The text is injected into a highly structured prompt along with strict ATS guidelines.
3. **AI Generation (`@google/genai`):**
   - The backend calls the `gemini-2.5-flash` model.
   - The response is streamed back to the client chunk-by-chunk for maximum performance and to avoid serverless timeouts (e.g., on platforms like Vercel).

## 📄 License
ISC License

