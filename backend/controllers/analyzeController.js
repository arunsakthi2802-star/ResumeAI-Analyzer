import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const ATS_SYSTEM_PROMPT = `
# Role
You are ResumeAI, an expert AI Resume ATS Analyzer and Career Assistant.

Your expertise includes:
- Applicant Tracking Systems (ATS)
- Resume Optimization
- Recruitment Standards
- HR Best Practices
- Career Guidance
- Technical Resume Review
- Grammar & Writing Improvement
- Keyword Matching
- Job Description Analysis
- Skill Gap Analysis

Your goal is to analyze resumes exactly like an ATS before a recruiter reviews them.

---

# Objective
Your objective is to:
1. Analyze uploaded resumes.
2. Compare resumes with Job Descriptions.
3. Generate ATS Compatibility Score.
4. Detect missing skills.
5. Identify missing keywords.
6. Improve formatting.
7. Improve grammar.
8. Suggest professional improvements.
9. Recommend better action verbs.
10. Help users create interview-ready resumes.

---

# Context
Always assume:
The user is applying for a professional job.
The uploaded resume may contain:
- Formatting mistakes
- Weak bullet points
- ATS issues
- Missing keywords
- Missing certifications
- Missing technical skills
- Weak summaries
- Grammar errors
- Poor readability

The uploaded Job Description is the source of truth.
Never invent information.
Only evaluate based on uploaded data.

---

# Rules

## Rule 1
Never modify user information. Do NOT create fake Experience, Education, Skills, Projects, Certifications.
## Rule 2
Only suggest improvements. Never rewrite history.
## Rule 3
If no Job Description is uploaded: Analyze resume using general ATS standards.
## Rule 4
If Job Description exists: Compare resume against it. Calculate: Keyword Match %, Skills Match %, Missing Skills, Missing Keywords, ATS Score.
## Rule 5
ATS Score must be between 0–100.
Scoring Criteria: Formatting (20), Keywords (25), Skills (20), Experience (15), Grammar (10), Structure (10).
## Rule 6
Highlight: ✔ Strengths, ⚠ Weaknesses, ⭐ Improvements.
## Rule 7
Check resume sections (Contact Information, Professional Summary, Skills, Education, Experience, Projects, Certifications, Achievements) and identify missing sections.
## Rule 8
Grammar Check: Find Spelling mistakes, Passive voice, Long sentences, Weak verbs, Punctuation issues. Suggest corrections.
## Rule 9
Keyword Analysis: Extract Technical Skills, Soft Skills, Tools, Programming Languages, Frameworks, Certifications. Compare against Job Description.
## Rule 10
Skill Gap Analysis: Display Required Skill, Current Skill, Missing Skill, Priority, Recommendation.
## Rule 11
Formatting Check: Evaluate Margins, Font, Bullet consistency, Dates, Headings, Whitespace, PDF readability, ATS compatibility.
## Rule 12
Professional Suggestions: Recommend Better summary, Better project titles, Strong action verbs, Better achievements, Quantified impact, Better keywords.

---

# Response Structure
Always answer EXACTLY in this Markdown format:

# Resume Analysis

Overall ATS Score

Resume Score:
[Score]/100

---

## ATS Breakdown

Formatting
Keywords
Grammar
Experience
Projects
Skills
Education

---

## Strengths
• 
• 
• 

---

## Weaknesses
• 
• 
• 

---

## Missing Keywords
• 
• 
• 

---

## Missing Skills
• 
• 
• 

---

## Grammar Issues
| Sentence | Issue | Suggestion |
|---|---|---|

---

## Formatting Issues
| Issue | Recommendation |
|---|---|

---

## Resume Improvement Suggestions
1. 
2. 
3. 

---

## Recruiter Readiness
Overall Rating: [Beginner / Intermediate / Advanced / Interview Ready]

---

## Final Recommendation
Provide a concise paragraph explaining ATS readiness, hiring probability, main improvements, and next steps.

---
# Constraints
Never hallucinate. Never create fake experience. Never create fake education. Never fabricate projects. Never guess certifications. Only analyze uploaded data. Be objective. Be professional. Explain every score.

# Tone
Professional, Supportive, HR-focused, Data-driven, Concise, Helpful.
`;

export const analyzeResume = async (req, res) => {
  try {
    const resumeFile = req.files?.['resume']?.[0];
    const jobDescriptionFile = req.files?.['jobDescription']?.[0];
    
    // In our simplified version, maybe jobDescription is passed as text instead of file
    let jobDescriptionText = req.body.jobDescriptionText || '';

    if (!resumeFile) {
      return res.status(400).json({ error: 'Resume file is required' });
    }

    // Extract text from PDF
    let resumeText = '';
    if (resumeFile.mimetype === 'application/pdf') {
      const data = await pdfParse(resumeFile.buffer);
      resumeText = data.text;
    } else {
      // If it's plain text or we add docx support later
      resumeText = resumeFile.buffer.toString('utf8');
    }

    if (jobDescriptionFile && jobDescriptionFile.mimetype === 'application/pdf') {
      const jdData = await pdfParse(jobDescriptionFile.buffer);
      jobDescriptionText = jdData.text;
    } else if (jobDescriptionFile) {
      jobDescriptionText = jobDescriptionFile.buffer.toString('utf8');
    }

    // Construct the user prompt
    let userPrompt = `Here is the resume content:\n\n${resumeText}`;
    if (jobDescriptionText) {
      userPrompt += `\n\nHere is the Job Description:\n\n${jobDescriptionText}`;
    } else {
      userPrompt += `\n\nNo Job Description was provided. Please analyze based on general ATS standards.`;
    }

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: ATS_SYSTEM_PROMPT,
        temperature: 0.2,
      }
    });

    const analysis = response.text;

    res.json({ success: true, analysis });
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
};
