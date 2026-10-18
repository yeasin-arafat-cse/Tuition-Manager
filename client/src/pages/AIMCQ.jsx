import { useState } from 'react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './AIMCQ.css';

const AIMCQ = () => {
  const [inputType, setInputType] = useState('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null); 
  
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [subject, setSubject] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const { t } = useApp();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        return toast.error("File is too large. Max 5MB allowed.");
      }
      setFile(selectedFile);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (inputType === 'text' && !text.trim()) {
      return toast.error(t("Please enter some text", "অনুগ্রহ করে কিছু টেক্সট দিন"));
    }
    if ((inputType === 'pdf' || inputType === 'image') && !file) {
      return toast.error(t("Please upload a file", "অনুগ্রহ করে একটি ফাইল আপলোড করুন"));
    }

    setIsGenerating(true);
    setGeneratedQuestions([]);

    try {
      const formData = new FormData();
      if (inputType === 'text') {
        formData.append('text', text);
      } else {
        formData.append('file', file);
      }
      formData.append('numQuestions', numQuestions);
      formData.append('difficulty', difficulty);
      formData.append('subject', subject || "General");
      formData.append('sourceType', inputType);

      const res = await api.post('/ai/generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setGeneratedQuestions(res.data.questions);
      toast.success(t("Questions Generated!", "প্রশ্ন তৈরি হয়েছে!"));
    } catch (error) {
      toast.error(error.response?.data?.message || 'AI Generation Failed');
    } finally {
      setIsGenerating(false);
    }
  };

  // 👈 একসাথে সেভ এবং PDF ডাউনলোড
  const handleSaveAndDownload = async () => {
    if (generatedQuestions.length === 0) return;
    setIsSaving(true);

    try {
      // ১. ডেটাবেসে সেভ করা (শুধু টেক্সট)
      await api.post('/ai/save', {
        subject: subject || "General",
        source: inputType,
        questions: generatedQuestions
      });
      
      toast.success(t("Saved to Question Bank!", "প্রশ্ন ব্যাংকে সেভ হয়েছে!"));
      
      // ২. PDF জেনারেট করার জন্য নতুন উইন্ডো (কোনো ফাইল সার্ভারে যাচ্ছে না)
      const printWindow = window.open('', '_blank');
      let htmlContent = `
        <html>
        <head>
          <title>MCQ - ${subject || 'Questions'}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; line-height: 1.6; color: #333; }
            h1 { text-align: center; color: #4f46e5; margin-bottom: 5px; }
            .header-info { text-align: center; color: #666; margin-bottom: 30px; font-size: 14px; border-bottom: 2px solid #eee; padding-bottom: 20px;}
            .q-box { margin-bottom: 25px; page-break-inside: avoid; }
            .q-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; }
            .q-option { margin-left: 20px; margin-bottom: 5px; font-size: 15px; }
            .answer { margin-top: 10px; font-size: 14px; color: #10b981; font-weight: bold; margin-left: 20px;}
            @media print {
              body { padding: 0; }
              .q-box { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h1>${subject || "General"} - MCQ Test</h1>
          <div class="header-info">
            <strong>Total Questions:</strong> ${generatedQuestions.length} | <strong>Difficulty:</strong> ${difficulty}
          </div>
      `;

      generatedQuestions.forEach((q, index) => {
        htmlContent += `
          <div class="q-box">
            <div class="q-title">${index + 1}. ${q.question}</div>
            ${q.options.map((opt, i) => `<div class="q-option">${String.fromCharCode(65 + i)}) ${opt}</div>`).join('')}
            <div class="answer">Answer: ${q.correctAnswer}</div>
          </div>
        `;
      });

      htmlContent += `</body></html>`;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // পেজ লোড হওয়ার পর অটোমেটিক প্রিন্ট (Save as PDF) ডায়ালগ ওপেন হবে
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };

      // ফর্ম ক্লিয়ার করা
      setGeneratedQuestions([]);
      setText('');
      setFile(null);
      
    } catch (error) {
      toast.error('Failed to save and download');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t("AI MCQ Generator", "এআই প্রশ্ন তৈরি")}</h1>
      </div>

      <div className="ai-container">
        {/* Left Side: Input */}
        <div className="ai-panel">
          <h2>1. {t("Input Source", "ইনপুট দিন")}</h2>
          
          <div className="payment-tabs" style={{ marginBottom: '1rem' }}>
            <button type="button" className={`tab-btn ${inputType === 'text' ? 'active' : ''}`} onClick={() => setInputType('text')}>
              📝 {t("Text", "টেক্সট")}
            </button>
            <button type="button" className={`tab-btn ${inputType === 'pdf' ? 'active' : ''}`} onClick={() => setInputType('pdf')}>
              📄 PDF
            </button>
            <button type="button" className={`tab-btn ${inputType === 'image' ? 'active' : ''}`} onClick={() => setInputType('image')}>
              🖼️ {t("Image", "ছবি")}
            </button>
          </div>

          <form onSubmit={handleGenerate}>
            {inputType === 'text' ? (
              <textarea
                className="ai-textarea"
                placeholder={t("Paste your text here...", "এখানে আপনার টেক্সট পেস্ট করুন...")}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            ) : (
              <div style={{ marginBottom: '1rem', padding: '1.5rem', border: '2px dashed var(--border)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                <input 
                  type="file" 
                  accept={inputType === 'pdf' ? '.pdf' : 'image/*'} 
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <label htmlFor="file-upload" style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600' }}>
                  {file ? `Selected: ${file.name}` : `Click to Upload ${inputType.toUpperCase()}`}
                </label>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Max size: 5MB</p>
              </div>
            )}
            
            <div className="form-row">
              <div className="form-group">
                <label>{t("Questions", "প্রশ্ন সংখ্যা")}</label>
                <input type="number" min="1" max="20" value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)} />
              </div>
              <div className="form-group">
                <label>{t("Difficulty", "কঠিনতা")}</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="easy">{t("Easy", "সহজ")}</option>
                  <option value="medium">{t("Medium", "মাঝারি")}</option>
                  <option value="hard">{t("Hard", "কঠিন")}</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>{t("Subject", "বিষয়")}</label>
              <input type="text" placeholder="e.g. Science" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>

            <button type="submit" className="auth-btn" disabled={isGenerating} style={{ width: '100%' }}>
              {isGenerating && <span className="ai-loader"></span>}
              {isGenerating ? t("Generating...", "তৈরি হচ্ছে...") : t("Generate MCQs", "প্রশ্ন তৈরি করুন")}
            </button>
          </form>
        </div>

        {/* Right Side: Output */}
        <div className="ai-panel">
          <h2>2. {t("Generated Questions", "তৈরি হওয়া প্রশ্ন")}</h2>
          
          {generatedQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
              {isGenerating ? t("AI is thinking...", "এআই চিন্তা করছে...") : t("No questions yet", "এখনো কোনো প্রশ্ন নেই")}
            </div>
          ) : (
            <>
              <div className="q-list">
                {generatedQuestions.map((q, index) => (
                  <div key={index} className="q-card">
                    <div className="q-title">{index + 1}. {q.question}</div>
                    <div className="q-options">
                      {q.options.map((opt, i) => (
                        <div key={i} className={`q-option ${opt === q.correctAnswer ? 'correct' : ''}`}>
                          {opt === q.correctAnswer ? '✅' : '⚪'} {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 👈 সেভ এবং PDF ডাউনলোড বাটন */}
              <button 
                className="auth-btn" 
                onClick={handleSaveAndDownload} 
                disabled={isSaving}
                style={{ width: '100%', marginTop: '1rem', backgroundColor: 'var(--secondary)' }}
              >
                {isSaving ? t("Saving...", "সেভ হচ্ছে...") : t("Save & Download PDF", "সেভ ও পিডিএফ ডাউনলোড")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIMCQ;