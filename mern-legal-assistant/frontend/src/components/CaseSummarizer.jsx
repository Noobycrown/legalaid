// Updated CaseSummarizer.jsx to match ChatGPT input bar style
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const CaseSummarizer = () => {
  const [caseText, setCaseText] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFileInfo, setUploadedFileInfo] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSummarize = async () => {
    if (!caseText.trim()) {
      setError('Please enter case text');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/ai/summarize', { caseText });

      setChatHistory((prev) => [
        ...prev,
        { type: 'user', text: caseText },
        { type: 'ai', text: response.data.summary },
      ]);
      setCaseText('');
      setUploadedFileInfo('');
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError('Failed to summarize case: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEnter = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSummarize();
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
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const extracted = response.data.extractedText;
      setUploadedFileInfo(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      setCaseText(extracted);
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError(`Upload failed. This file may be a scanned image. Please upload a text-based PDF or DOCX. (${msg})`);
    } finally {
      setLoading(false);
    }
  };

  // const handleDropFile = async (e) => {
  //   e.preventDefault();
  //   const file = e.dataTransfer.files[0];
  //   if (file) await handleFileUpload({ target: { files: [file] } });
  // };

  const copyToClipboard = () => {
    const text = chatHistory.map((msg) => `${msg.type === 'user' ? 'You' : 'AI'}: ${msg.text}`).join('\n\n');
    navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
  };

  const downloadText = (filename = 'case_summary_chat.txt') => {
    const text = chatHistory.map((msg) => `${msg.type === 'user' ? 'You' : 'AI'}: ${msg.text}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatOutput = (text) => {
    if (!text) return '';
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^\s*[\u2022-]\s*(.*$)/gm, '<li>$1</li>');

    if (!formatted.startsWith('<')) formatted = `<p>${formatted}</p>`;
    if (formatted.includes('<li>')) formatted = formatted.replace(/(<li>.*?<\/li>)+/gs, '<ul>$&</ul>');
    return formatted;
  };

  return (
    <div className="tool-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="tool-header"><h4>Case Summarizer</h4></div>

      <div className="tool-content">
       

        

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

        <div className="chat-input-bar-modern">
          <label htmlFor="file-upload" className="chat-icon-button">➕</label>
          <input
            id="file-upload"
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileUpload}
            className="file-input-hidden"
          />

          <textarea
            className="modern-chat-input"
            placeholder="Ask anything or upload a file..."
            value={caseText}
            onChange={(e) => setCaseText(e.target.value)}
            onKeyDown={handleEnter}
            rows={1}
          />

          <button
            className="chat-icon-button send-button"
            onClick={handleSummarize}
            disabled={loading || !caseText.trim()}
          >
            {loading ? <div className="spinner" /> : '➤'}
          </button>
        </div>

        {chatHistory.length > 0 && (
          <div className="action-buttons" style={{ marginTop: '1rem' }}>
            <button className="primary-btn" onClick={copyToClipboard}>Copy Chat</button>
            <button className="primary-btn" onClick={downloadText}>Download Chat</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseSummarizer;
