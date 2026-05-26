import { useState } from 'react';

const CATEGORIES = ['General', 'Engineering', 'Design', 'Product', 'Marketing', 'HR', 'Finance'];

export default function CreatePoll({ onCreated }) {
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('General');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addOption = () => {
    if (options.length < 6) setOptions([...options, '']);
  };

  const removeOption = (i) => {
    if (options.length > 2) setOptions(options.filter((_, idx) => idx !== i));
  };

  const updateOption = (i, val) => {
    const updated = [...options];
    updated[i] = val;
    setOptions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const filled = options.map((o) => o.trim()).filter(Boolean);
    if (filled.length < 2) {
      setError('Please fill in at least 2 options.');
      return;
    }
    setLoading(true);
    try {
      await onCreated({ question, category, options: filled });
      setQuestion('');
      setCategory('General');
      setOptions(['', '']);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-poll-card">
      <h2>✨ Create New Poll</h2>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Question</label>
          <input
            type="text"
            placeholder="What do you want to ask?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            maxLength={500}
          />
        </div>

        <div className="field">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Options</label>
          {options.map((opt, i) => (
            <div key={i} className="option-row">
              <input
                type="text"
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                maxLength={300}
              />
              {options.length > 2 && (
                <button type="button" className="remove-btn" onClick={() => removeOption(i)}>✕</button>
              )}
            </div>
          ))}
          {options.length < 6 && (
            <button type="button" className="add-option-btn" onClick={addOption}>
              + Add Option
            </button>
          )}
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Creating...' : 'Create Poll'}
        </button>
      </form>
    </div>
  );
}
