import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescriptionFile, setJobDescriptionFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!resumeFile) {
      setError('Please upload a resume (PDF).');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('resume', resumeFile);
    
    if (jobDescriptionFile) {
      formData.append('jobDescription', jobDescriptionFile);
    } else if (jdText) {
      formData.append('jobDescriptionText', jdText);
    }

    try {
      const response = await axios.post('/api/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data.analysis);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze resume.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="text-center" style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }} className="text-primary animate-fade-in">ResumeAI Analyzer</h1>
        <p className="text-secondary animate-fade-in" style={{ animationDelay: '0.1s', fontSize: '1.2rem' }}>
          AI-powered ATS compatibility check and career guidance.
        </p>
      </header>

      <div className="grid-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="glass-card">
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText className="text-accent" /> Upload Documents
          </h2>
          
          <div className="form-group">
            <label className="form-label">1. Upload Resume (Required)</label>
            <div className="file-input-wrapper">
              <div className="file-input-btn">
                <Upload size={32} />
                <span>{resumeFile ? resumeFile.name : 'Click to select Resume PDF'}</span>
              </div>
              <input 
                type="file" 
                className="file-input" 
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files[0])}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">2. Job Description (Optional)</label>
            <textarea 
              className="glass-card"
              style={{ width: '100%', minHeight: '120px', padding: '1rem', color: 'inherit', border: '1px solid var(--glass-border)' }}
              placeholder="Paste job description here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
          </div>

          {error && (
            <div className="form-group text-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? <div className="spinner"></div> : 'Analyze Resume'}
          </button>
        </div>

        <div className="glass-card" style={{ overflowY: 'auto', maxHeight: '800px' }}>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle className="text-success" /> Analysis Report
          </h2>
          
          {loading && (
            <div className="flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '1rem' }}>
              <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '4px', borderColor: 'var(--primary-color)', borderTopColor: 'transparent' }}></div>
              <p className="text-secondary">Analyzing resume against ATS standards...</p>
            </div>
          )}

          {!loading && !result && (
            <div className="flex-center text-secondary" style={{ minHeight: '300px', textAlign: 'center' }}>
              Upload your resume and click analyze to see your ATS score and personalized feedback.
            </div>
          )}

          {!loading && result && (
            <div className="markdown-content">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
