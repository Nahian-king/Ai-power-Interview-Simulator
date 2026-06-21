# AI Power Interview Simulator

**AI-powered mock technical interview platform** built with Node.js, Express, MongoDB, and Google Gemini AI.

---

## Features

- User authentication (Signup / Login with JWT)
- Start mock interviews on any topic
- AI generates dynamic, context-aware questions
- Interactive interview flow with follow-up questions
- Final AI evaluation with score (out of 100) + detailed feedback
- Interview history saved in MongoDB
- Rate limiting for security

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **AI**: Google Gemini (`gemini-2.5-flash`)
- **Auth**: JWT + bcryptjs
- **Others**: CORS, dotenv, express-rate-limit

## Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (Atlas or local)
- Google Gemini API Key

### Installation

```bash
git clone https://github.com/Nahian-king/Ai-power-Interview-Simulator.git
cd Ai-power-Interview-Simulator/backend-project

npm install
```

Create `.env` file in `backend-project/`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key_here
GEMINI_API_KEY=your_google_gemini_api_key
PORT=3000
```

Run the server:

```bash
# Development
npm run dev

# Production
npm start
```

Server runs at `http://localhost:3000`

---

## Main API Endpoints

| Method | Endpoint                        | Description                                      | Auth Required |
|--------|---------------------------------|--------------------------------------------------|---------------|
| POST   | `/api/auth/signup`              | Register new user                                | No            |
| POST   | `/api/auth/login`               | User login (returns JWT)                         | No            |
| GET    | `/api/auth/profile`             | Get user profile                                 | Yes           |
| POST   | `/api/interview/start`          | Start new interview session                      | Yes           |
| POST   | `/api/interview/submit-answer`  | Submit answer & get next question or final result| Yes           |
| GET    | `/api/interview/history`        | Get user's interview history                     | Yes           |

## Example Requests

### 1. Start Interview
```json
POST /api/interview/start
{
  "topic": "React.js Frontend Developer"
}
```

### 2. Submit Answer (Continue)
```json
POST /api/interview/submit-answer
{
  "sessionId": "your_session_id_here",
  "answer": "Your detailed answer here...",
  "action": "continue"
}
```

### 3. Finish Interview
```json
POST /api/interview/submit-answer
{
  "sessionId": "your_session_id_here",
  "answer": "Final answer...",
  "action": "finish"
}
```

## Project Structure

```
backend-project/
├── src/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── interviewController.js
│   ├── middleware/authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Interview.js
│   └── routes/
│       ├── authRoutes.js
│       └── interviewRoutes.js
├── index.js
├── package.json
└── .env
```

## Future Improvements
- React frontend
- Voice input support
- Resume-based questions
- Detailed analytics dashboard

---

**Built for better interview preparation** 🚀
