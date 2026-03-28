# QuizzQuest - Interactive Learning Platform

An innovative educational platform that combines traditional quizzes with interactive games to make learning more engaging and enjoyable.

## Features

- **Teacher Quiz Creation**: Teachers can create custom quizzes that are saved to MongoDB and accessible to all students
- **Quiz Validation**: All questions must have correct answers that exist in the provided options
- **Multi-AI Quiz Generation**: Support for Gemini, HuggingFace, OpenAI, OpenRouter, and Routeway API
- **Shared Quiz Library**: Students can browse and take all quizzes created by teachers
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

- **Student**: Default role for new users, can take quizzes created by teachers, cannot self-promote
- **Teacher**: Can create quizzes accessible to all students, can switch between teacher and student views, assigned by admin
- **Admin**: Full control over user role management

### Role Switching:
- Only users promoted to teacher by admin can switch roles
- Teachers can freely switch between teacher and student views
- Regular students cannot switch to teacher role
- Once promoted to teacher, users retain switching ability even when in student mode
- Admin can revoke teacher status (removes switching ability)

## Quiz System

### For Teachers:
1. Navigate to Teacher Dashboard → Questions
2. Enter a quiz title (required)
3. Create questions manually or use AI auto-generation
4. Each question must have:
   - Question text
   - Exactly 4 options
   - A correct answer that exists in the options
5. Click "Submit This Set" to save quiz to MongoDB
6. Quiz becomes immediately available to all students

### For Students:
1. Navigate to "Quizzes" from the menu
2. Browse all available quizzes
3. Click on any quiz to start
4. Submit answers to see results and correct answers
5. Attempts are tracked in your statistics

### Default Quiz:
- Teachers can import a pre-made quiz with 50 general knowledge questions
- All questions are validated to ensure correct answers exist in options
- Saved to shared quiz library for all students

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