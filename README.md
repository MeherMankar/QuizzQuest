# QuizzQuest - Interactive Learning Platform

An innovative educational platform that combines traditional quizzes with interactive games to make learning more engaging and enjoyable.

## Features

- **Multi-AI Quiz Generation**: Support for Gemini, HuggingFace, OpenAI, OpenRouter, and Routeway API
- **Interactive Quiz Games**: Memory, Shooting, Flappy Bird, and Catch games
- **Chess Game**: Play against AI with 6 difficulty levels or online multiplayer
- **User Authentication**: Secure login with Google OAuth
- **Role-Based Access**: Separate interfaces for students and teachers
- **Admin Panel**: Manage user roles (promote students to teachers)
- **Progress Tracking**: Track scores and performance
- **Rankings System**: Competitive leaderboard

## Technologies Used

- **Frontend**: Next.js, React, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Node.js, Socket.IO
- **Database**: MongoDB Atlas
- **Authentication**: NextAuth.js (Google OAuth)
- **AI Providers**: Gemini, HuggingFace, OpenAI, OpenRouter, Routeway
- **Chess Engine**: Stockfish.js
- **Game Logic**: Kaboom.js, chess.js, react-chessboard

## Quick Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment (.env.local):**
   ```bash
   MONGODB_URL=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_generated_secret
   GOOGLE_ID=your_google_oauth_client_id
   GOOGLE_SECRET=your_google_oauth_client_secret
   GEMINI_API_KEY=your_gemini_api_key
   HUGGINGFACE_API_KEY=your_huggingface_api_key
   OPENAI_API_KEY=your_openai_api_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   ROUTEWAY_API_KEY=your_routeway_api_key
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_secure_password
   ```

3. **Get API Keys:**
   - **Gemini**: [Google AI Studio](https://makersuite.google.com/app/apikey) - Free
   - **HuggingFace**: [HuggingFace Tokens](https://huggingface.co/settings/tokens) - Free
   - **OpenAI**: [OpenAI Platform](https://platform.openai.com/api-keys) - Paid
   - **OpenRouter**: [OpenRouter](https://openrouter.ai/) - Free tier available
   - **MongoDB**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Free tier
   - **Google OAuth**: [Google Cloud Console](https://console.cloud.google.com/apis/credentials) - Free

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## Admin Access

- **Admin Panel**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Default Credentials**: Set in `.env.local` (ADMIN_USERNAME and ADMIN_PASSWORD)
- **Admin Functions**: Promote students to teachers, demote teachers to students

## User Roles

- **Student**: Default role for new users, cannot self-promote
- **Teacher**: Can switch between teacher and student views, assigned by admin
- **Admin**: Full control over user role management

## Project Structure

```
QuizzQuest/
├── app/
│   ├── api/auth/          # Authentication & API routes
│   ├── components/        # React components
│   ├── autoquiz/         # AI quiz generation
│   └── chess/            # Chess game
├── lib/                  # Utilities & database
├── public/              # Static assets
└── server.js           # Custom Node.js server
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run lint` - Run ESLint

## License

MIT License - see LICENSE file for details