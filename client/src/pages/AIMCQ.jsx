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
  const [questionType, setQuestionType] = useState('mcq');
  
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
      formData.append('questionType', questionType); 

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

  const handleSaveAndDownload = async () => {
    if (generatedQuestions.length === 0) return;
    setIsSaving(true);

    try {
      await api.post('/ai/save', {
        subject: subject || "General",
        source: inputType,
        questions: generatedQuestions
      });
      
      toast.success(t("Saved to Question Bank!", "প্রশ্ন ব্যাংকে সেভ হয়েছে!"));
      
      setGeneratedQuestions([]);
      setText('');
      setFile(null);
      
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t("AI Question Generator", "এআই প্রশ্ন তৈরি")}</h1>
      </div>

      <div className="ai-container">
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
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>{t("Question Type", "প্রশ্নের ধরন")}</label>
              <select value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                <option value="mcq">{t("Multiple Choice (MCQ)", "বহুনির্বাচনি (MCQ)")}</option>
                <option value="short">{t("Short Question", "অতি সংক্ষিপ্ত প্রশ্ন")}</option>
                <option value="creative">{t("Creative Question", "সৃজনশীল প্রশ্ন")}</option>
              </select>
            </div>

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
              {isGenerating ? t("Generating...", "তৈরি হচ্ছে...") : t("Generate Questions", "প্রশ্ন তৈরি করুন")}
            </button>
          </form>
        </div>

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
                    {questionType === 'mcq' && (
                      <>
                        <div className="q-title">{index + 1}. {q.question}</div>
                        <div className="q-options">
                          {q.options?.map((opt, i) => (
                            <div key={i} className={`q-option ${opt === q.correctAnswer ? 'correct' : ''}`}>
                              {opt === q.correctAnswer ? '✅' : '⚪'} {opt}
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {questionType === 'short' && (
                      <>
                        <div className="q-title">{index + 1}. {q.question}</div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--secondary)', marginTop: '5px' }}>Ans: {q.correctAnswer}</p>
                      </>
                    )}

                    {questionType === 'creative' && (
                      <div style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: '8px' }}>
                        <div style={{ marginBottom: '10px', fontWeight: 'bold', color: 'var(--primary)' }}>উদ্দীপক: {q.stem}</div>
                        <div style={{ marginBottom: '5px' }}><strong>{q.questionA}</strong> <br/> <span style={{ color: 'var(--secondary)' }}>Ans: {q.answerA}</span></div>
                        <div style={{ marginBottom: '5px' }}><strong>{q.questionB}</strong> <br/> <span style={{ color: 'var(--secondary)' }}>Ans: {q.answerB}</span></div>
                        <div style={{ marginBottom: '5px' }}><strong>{q.questionC}</strong> <br/> <span style={{ color: 'var(--secondary)' }}>Ans: {q.answerC}</span></div>
                        <div><strong>{q.questionD}</strong> <br/> <span style={{ color: 'var(--secondary)' }}>Ans: {q.answerD}</span></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <button 
                className="auth-btn" 
                onClick={handleSaveAndDownload} 
                disabled={isSaving}
                style={{ width: '100%', marginTop: '1rem', backgroundColor: 'var(--secondary)' }}
              >
                {isSaving ? t("Saving...", "সেভ হচ্ছে...") : t("Save to Question Bank", "প্রশ্ন ব্যাংকে সেভ করুন")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIMCQ;