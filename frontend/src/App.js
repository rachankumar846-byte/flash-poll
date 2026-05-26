import { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import CreatePoll from './components/CreatePoll';
import PollCard from './components/PollCard';
import './App.css';

export default function App() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const fetchPolls = useCallback(async () => {
    setError('');
    try {
      const res = await api.getPolls();
      setPolls(res.data);
    } catch (err) {
      setError('Failed to load polls. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  const handleCreate = async (payload) => {
    const res = await api.createPoll(payload);
    setPolls((prev) => [res.data, ...prev]);
    setShowCreate(false);
  };

  const handleVote = async (pollId, optionId) => {
    const res = await api.vote(pollId, optionId);
    // Update only the voted poll's options in state (no page reload)
    setPolls((prev) =>
      prev.map((p) =>
        p.id === pollId
          ? { ...p, options: res.data.options, total_votes: res.data.total_votes }
          : p
      )
    );
  };

  const handleDelete = async (pollId) => {
    await api.deletePoll(pollId);
    setPolls((prev) => prev.filter((p) => p.id !== pollId));
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>⚡ Flash-Poll</h1>
            <p>Real-time team decision engine</p>
          </div>
          <button
            className="new-poll-btn"
            onClick={() => setShowCreate((v) => !v)}
          >
            {showCreate ? '✕ Cancel' : '+ New Poll'}
          </button>
        </div>
      </header>

      <main className="main-content">
        {showCreate && (
          <CreatePoll onCreated={handleCreate} />
        )}

        {loading ? (
          <div className="state-box">
            <div className="spinner" />
            <p>Loading polls...</p>
          </div>
        ) : error ? (
          <div className="state-box error-state">
            <p>⚠️ {error}</p>
            <button onClick={fetchPolls} className="retry-btn">Retry</button>
          </div>
        ) : polls.length === 0 ? (
          <div className="state-box empty-state">
            <p>🗳️ No polls yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="polls-grid">
            {polls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                onVote={handleVote}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
