import { useState } from 'react';

export default function PollCard({ poll, onVote, onDelete }) {
  const [voting, setVoting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState('');

  const handleVote = async (optionId) => {
    if (voted || voting) return;
    setVoting(true);
    setError('');
    try {
      await onVote(poll.id, optionId);
      setVoted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this poll and all its votes?')) return;
    setDeleting(true);
    try {
      await onDelete(poll.id);
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  const totalVotes = poll.total_votes || 0;

  return (
    <div className={`poll-card ${deleting ? 'deleting' : ''}`}>
      <div className="poll-header">
        <span className="category-badge">{poll.category}</span>
        <button className="delete-btn" onClick={handleDelete} disabled={deleting} title="Delete poll">
          {deleting ? '...' : '🗑️'}
        </button>
      </div>

      <h3 className="poll-question">{poll.question}</h3>
      <p className="vote-count">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</p>

      <div className="options-list">
        {poll.options.map((option) => (
          <div key={option.id} className="option-item">
            <button
              className={`option-btn ${voted ? 'voted' : ''}`}
              onClick={() => handleVote(option.id)}
              disabled={voted || voting}
            >
              <div className="option-content">
                <span className="option-text">{option.option_text}</span>
                <span className="option-percent">{option.percentage}%</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${option.percentage}%` }}
                />
              </div>
            </button>
          </div>
        ))}
      </div>

      {error && <p className="error">{error}</p>}
      {voted && <p className="voted-msg">✅ Vote recorded!</p>}

      <p className="created-at">
        Created {new Date(poll.created_at).toLocaleDateString()}
      </p>
    </div>
  );
}
