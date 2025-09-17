import React, { useEffect, useState } from 'react';
import axios from 'axios';

const History = () => {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/ai/history');
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/ai/history/${id}`);
      setHistory(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      console.error('Failed to delete interaction:', err);
      alert('Deletion failed. Please try again.');
    }
  };

  const filteredHistory = history.filter((item) =>
    filter === 'all' ? true : item.type === filter
  );

  return (
    <div className="tool-container" style={{ padding: '2rem' }}>
      <div className="tool-header"><h3>Chat History</h3></div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Filter:</label>{' '}
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="summary">Case Summaries</option>
          <option value="contract">Contract Analyses</option>
          <option value="sections">Section Recommendations</option>
        </select>
      </div>

      <div className="chat-container">
        {filteredHistory.length === 0 ? (
          <p>No saved chats yet.</p>
        ) : (
          filteredHistory.map((item, i) => (
            <div key={i} className="chat-message ai" style={{ flexDirection: 'column' }}>
              <div className="message-content" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>🗂 {item.type.toUpperCase()}</strong><br />
                    <span style={{ fontSize: '0.85rem', color: '#ccc' }}>
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
                <div style={{ marginTop: '1rem' }}><strong>📝 Input:</strong> {item.inputText}</div>
                <div style={{ marginTop: '0.5rem' }}><strong>💬 AI:</strong> {item.aiResponse}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
