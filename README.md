# DOC SHAAB 🩺

DOC SHAAB is a comprehensive healthcare platform featuring an AI-driven Pre-Consultation Diagnostic Intake system. This application streamlines patient medical record management, provides clinical history insights, and integrates advanced Large Language Models (Groq) for rapid symptom analysis.

## 🚀 Features

- **AI Diagnostic Intake**: Leverages Groq's Llama 3 models for robust conversational triage and clinical summaries.
- **Medical Record OCR**: Intelligent text extraction from uploaded medical documents and reports.
- **Patient Context Management**: Track medical histories, allergies, chronic conditions, and previous diagnoses.
- **Security & Privacy**: PHI is encrypted in storage, ensuring patient data confidentiality.
- **Role-based Authentication**: Secure JWT-based auth for clinical staff and patients.

## 🛠 Tech Stack

- **Frontend**: React (Vite), TypeScript, TailwindCSS
- **Backend**: Node.js, Express, TypeScript
- **AI/LLM**: Groq API (Llama 3)
- **Database**: In-Memory Store / PostgreSQL (configurable)
- **OCR Engine**: Tesseract.js

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Groq API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bhoomikadhirde/DOC-SHAAB.git
   cd DOC-SHAAB
   ```

2. Install dependencies:
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root or `backend` directory (check `.env.example` if available).
   ```env
   PORT=5000
   GROQ_API_KEY=your_groq_api_key_here
   JWT_SECRET=your_secret_key
   ```

4. Run the application locally:
   ```bash
   # Start backend
   cd backend
   npm run dev

   # Start frontend
   cd ../frontend
   npm run dev
   ```

## 🚀 Deployment (Vercel)

The project includes a `vercel.json` configuration for easy deployment on Vercel. 
Ensure you add your Environment Variables (like `GROQ_API_KEY`) to the Vercel project settings before deploying.

## 📄 License

This project is licensed under the MIT License.
