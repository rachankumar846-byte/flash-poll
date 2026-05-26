const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /api/polls — Retrieve all active polls with options
router.get('/', async (req, res) => {
  try {
    const pollsResult = await pool.query(
      'SELECT * FROM polls ORDER BY created_at DESC'
    );

    const polls = await Promise.all(
      pollsResult.rows.map(async (poll) => {
        const optionsResult = await pool.query(
          'SELECT * FROM options WHERE poll_id = $1 ORDER BY id',
          [poll.id]
        );

        const options = optionsResult.rows;
        const totalVotes = options.reduce((sum, o) => sum + o.vote_count, 0);

        return {
          ...poll,
          options: options.map((o) => ({
            ...o,
            percentage:
              totalVotes > 0
                ? Math.round((o.vote_count / totalVotes) * 100)
                : 0,
          })),
          total_votes: totalVotes,
        };
      })
    );

    res.json({ success: true, data: polls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch polls' });
  }
});

// POST /api/polls — Create a new poll
router.post('/', async (req, res) => {
  const { question, category, options } = req.body;

  // Validation
  if (!question || !question.trim()) {
    return res.status(400).json({ success: false, message: 'Question is required' });
  }
  if (!category || !category.trim()) {
    return res.status(400).json({ success: false, message: 'Category is required' });
  }
  if (!options || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ success: false, message: 'At least 2 options are required' });
  }

  const uniqueOptions = [...new Set(options.map((o) => o.trim()).filter(Boolean))];
  if (uniqueOptions.length < 2) {
    return res.status(400).json({ success: false, message: 'Options must be distinct and non-empty' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const pollResult = await client.query(
      'INSERT INTO polls (question, category) VALUES ($1, $2) RETURNING *',
      [question.trim(), category.trim()]
    );
    const poll = pollResult.rows[0];

    const insertedOptions = await Promise.all(
      uniqueOptions.map((opt) =>
        client.query(
          'INSERT INTO options (poll_id, option_text) VALUES ($1, $2) RETURNING *',
          [poll.id, opt]
        )
      )
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: {
        ...poll,
        options: insertedOptions.map((r) => r.rows[0]),
        total_votes: 0,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create poll' });
  } finally {
    client.release();
  }
});

// PATCH /api/polls/:id/vote — Vote on an option (atomic update)
router.patch('/:id/vote', async (req, res) => {
  const { id } = req.params;
  const { option_id } = req.body;

  if (!option_id) {
    return res.status(400).json({ success: false, message: 'option_id is required' });
  }

  const client = await pool.connect();
  try {
    // Verify poll exists
    const pollCheck = await client.query('SELECT id FROM polls WHERE id = $1', [id]);
    if (pollCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    // Atomic increment
    const optionResult = await client.query(
      'UPDATE options SET vote_count = vote_count + 1 WHERE id = $1 AND poll_id = $2 RETURNING *',
      [option_id, id]
    );

    if (optionResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Option not found for this poll' });
    }

    // Return updated poll
    const optionsResult = await client.query(
      'SELECT * FROM options WHERE poll_id = $1',
      [id]
    );
    const options = optionsResult.rows;
    const totalVotes = options.reduce((sum, o) => sum + o.vote_count, 0);

    res.json({
      success: true,
      data: {
        options: options.map((o) => ({
          ...o,
          percentage: Math.round((o.vote_count / totalVotes) * 100),
        })),
        total_votes: totalVotes,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to record vote' });
  } finally {
    client.release();
  }
});

// DELETE /api/polls/:id — Delete poll and all associated options
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM polls WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    // Options are auto-deleted via ON DELETE CASCADE
    res.json({ success: true, message: 'Poll deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete poll' });
  }
});

module.exports = router;
