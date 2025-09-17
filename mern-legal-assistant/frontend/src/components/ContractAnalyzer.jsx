import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ContractAnalyzer = () => {
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      setError('Please enter contract text');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/ai/analyze-contract', {
        contractText: inputText,
      });

      setChatHistory(prev => [
        ...prev,
        { type: 'user', text: inputText },
        { type: 'ai', text: response.data.analysis }
      ]);
      setInputText('');
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError('Failed to analyze contract: ' + msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnter = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/ai/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const extracted = response.data.extractedText;
      setInputText(extracted);
      await handleAnalyze();
    } catch (err) {
      setError('Upload failed. Try a text-based PDF or DOCX file.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatOutput = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/##\s(.*)/g, '<h3>$1</h3>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^\s*[\u2022-]\s*(.*$)/gm, '<li>$1</li>')
      .replace(/(<li>.*?<\/li>)+/gs, '<ul>$&</ul>');
  };

  return (
    <div className="tool-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="tool-header"><h3>Contract Analyzer</h3></div>

      <div className="tool-content" style={{ paddingBottom: '100px' }}>
        <div className="chat-container">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.type}`}>
              <div className="message-content">
                <div className="message-text" dangerouslySetInnerHTML={{ __html: formatOutput(msg.text) }} />
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="chat-input-bar-modern">
        <label htmlFor="contract-upload" className="chat-icon-button">➕</label>
        <input
          id="contract-upload"
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileUpload}
          className="file-input-hidden"
        />
        <textarea
          className="modern-chat-input"
          placeholder="Paste or type your contract here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleEnter}
          rows={1}
        />
        <button
          className="chat-icon-button send-button"
          onClick={handleAnalyze}
          disabled={loading || !inputText.trim()}
        >
          {loading ? <div className="spinner" /> : '➤'}
        </button>
      </div>
    </div>
  );
};

export default ContractAnalyzer;
