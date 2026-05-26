const BASE_URL = '/api';

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

export const api = {
  // Fetch all polls
  getPolls: () =>
    fetch(`${BASE_URL}/polls`).then(handleResponse),

  // Create a new poll
  createPoll: (payload) =>
    fetch(`${BASE_URL}/polls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handleResponse),

  // Vote on an option
  vote: (pollId, optionId) =>
    fetch(`${BASE_URL}/polls/${pollId}/vote`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ option_id: optionId }),
    }).then(handleResponse),

  // Delete a poll
  deletePoll: (pollId) =>
    fetch(`${BASE_URL}/polls/${pollId}`, { method: 'DELETE' }).then(handleResponse),
};
