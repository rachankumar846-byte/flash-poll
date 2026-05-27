# ⚡ Flash-Poll Engine

A real-time internal polling engine for high-velocity team decision-making.

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | React 18                |
| Backend  | Node.js + Express       |
| Database | PostgreSQL               |

---

## Prerequisites

- Node.js v18+
- PostgreSQL v13+

---

## Database Setup

1. Open your PostgreSQL shell:
```bash
psql -U postgres
```

2. Create the database:
```sql
CREATE DATABASE flashpoll;
\q
```

> Tables are created automatically when the server starts.

---

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flashpoll
DB_USER=postgres
DB_PASSWORD=your_password_here
CLIENT_URL=http://localhost:3000
```

Start the server:
```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:5000`

---

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

App runs at: `http://localhost:3000`

---

## API Reference

### `GET /api/polls`
Returns all polls with options, vote counts, and percentages.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "question": "Which framework?",
      "category": "Engineering",
      "created_at": "2026-05-26T10:00:00Z",
      "total_votes": 10,
      "options": [
        {
          "id": "uuid",
          "option_text": "React",
          "vote_count": 7,
          "percentage": 70
        }
      ]
    }
  ]
}
```

---

### `POST /api/polls`
Creates a new poll.

**Request body:**
```json
{
  "question": "Which framework should we use?",
  "category": "Engineering",
  "options": ["React", "Vue", "Angular"]
}
```

**Response:** `201 Created`
```json
{ "success": true, "data": { "id": "uuid", "question": "...", "options": [...] } }
```

---

### `PATCH /api/polls/:id/vote`
Records a vote atomically.

**Request body:**
```json
{ "option_id": "uuid" }
```

**Response:** `200 OK`
```json
{ "success": true, "data": { "options": [...], "total_votes": 5 } }
```

---

### `DELETE /api/polls/:id`
Deletes a poll and all associated options (cascade).

**Response:** `200 OK`
```json
{ "success": true, "message": "Poll deleted successfully" }
```

---

## Project Structure

```
flash-poll/
├── backend/
│   ├── routes/
│   │   └── polls.js       # All poll API routes
│   ├── db.js              # PostgreSQL connection + schema init
│   ├── server.js          # Express app entry point
│   ├── .env.example       # Environment template
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreatePoll.jsx   # Poll creation form
│   │   │   └── PollCard.jsx     # Poll display + voting
│   │   ├── api.js               # API service layer
│   │   ├── App.js               # Root component
│   │   ├── App.css              # Styles
│   │   └── index.js             # Entry point
│   └── package.json
└── README.md
```

---

## Design Decisions

- **Atomic votes** — PostgreSQL `UPDATE ... SET vote_count = vote_count + 1` ensures no race conditions
- **Cascade delete** — `ON DELETE CASCADE` on options table guarantees referential integrity
- **No localStorage** — all vote data persisted exclusively in PostgreSQL
- **Real-time UI** — React state updates immediately on vote without page reload
- **Error/Loading states** — all async operations handled gracefully in the UI
- **Proxy setup** — React dev server proxies `/api` to backend, no CORS issues in development