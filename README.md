# QuizzQuest - Interactive Learning Platform

ABSTRACT

This project presents the development of a gamified quiz application designed to enhance learning through interactive games. Built using Next.js, the app leverages its powerful server-side rendering and built-in API routing capabilities to create a smooth and scalable user experience. The application supports two user roles: students, who answer questions by playing educational games, and teachers, who can create and manage quiz content. 
Authentication is managed using NextAuth, ensuring secure and role-based access. The application’s data, including user profiles, quiz questions, and scores, is stored in a cloud-based MongoDB Atlas database, allowing for efficient data management and scalability. 
A key innovation of the project lies in integrating Canvas to design interactive games, transforming the quiz solving process. In one such game, users must select the correct answer from options that dynamically appear and move across the screen, creating an engaging, time-based challenge. A real-time dashboard tracks users' performance and scores, providing insights into student progress. 
The use of Tailwind CSS ensures responsive, modern UI design, making the app visually appealing and user friendly. The project's ultimate goal is to enhance the educational experience by combining quizzes with game mechanics to improve retention, engagement, and user satisfaction. 

1.  2: Purpose of Project

The primary goal of this project is to create an interactive and engaging learning platform that enhances traditional quiz-based assessments through the use of game mechanics. The platform aims to address several key challenges in education, including learner engagement, retention of information, and the need for dynamic teaching tools that adapt to different learning styles. 

Engagement Through Gamification:
One of the major issues in modern education is the difficulty of maintaining student attention, especially in self-paced, online learning environments. Standard quiz applications often fail to provide the kind of dynamic interaction that motivates learners to actively participate. By integrating games into the quizsolving process, our project provides a more stimulating and enjoyable experience for students, thereby increasing their motivation to engage with the material. Games offer immediate feedback, challenges, and rewards, all of which contribute to a more immersive learning experience that goes beyond simple multiplechoice questions. 

Learning by Doing:
The use of games in the quiz application transforms the typically passive activity of answering questions into an active process. Students are not merely choosing answers from a list, but are interacting with the game mechanics to solve questions. This 'learning by doing' approach encourages critical thinking, problemsolving, and quicker recall of information. Moreover, by presenting quiz questions in a game-like format, students are more likely to retain the information they are learning because it is associated with a more memorable, active experience. 

Adaptability for Teachers and Students:
The project is designed to cater to two distinct user roles—teachers and students. Teachers are provided with tools to create customized quizzes, allowing them to tailor the difficulty, content, and learning objectives to their students' needs. This flexibility enables teachers to align the quizzes with specific curricula or focus areas, enhancing the learning outcomes for students. Meanwhile, students can choose quizzes based on their skill level or areas of interest, and engage in an interactive learning process that adapts to their progress through real-time feedback and game-based challenges. 

Data-Driven Insights:
Another important purpose of this project is to provide both teachers and students with meaningful insights into their performance. The dashboard feature tracks user scores and progress over time, offering valuable feedback for both parties. Teachers can use this data to adjust their teaching strategies, identify students who may need additional help, and measure the effectiveness of the quizzes they create. Students, on the other hand, can see their progress in real time, track improvements, and gain confidence in their learning journey. 

Encouraging a Collaborative Learning Environment:
In addition to the individual benefits for both students and teachers, the project also aims to foster a collaborative learning environment. By allowing teachers to create quizzes and share them with students, the platform encourages interaction and dialogue between both groups. Teachers can design quizzes that focus on problem-solving and critical thinking, while students can provide feedback on quiz difficulty, game design, and learning outcomes. This collaborative approach can ultimately create a more adaptive and personalized learning experience for all users. 
In summary, the purpose of this project is to innovate the traditional quiz format by incorporating gamified learning experiences that are fun, interactive, and more conducive to deeper learning. The platform is designed to increase engagement, improve retention, and offer a flexible system for both teachers and students, while leveraging real-time data to enhance the overall educational experience. 

QuizzQuest is an innovative educational platform that combines traditional quizzes with interactive games to make learning more engaging and enjoyable. Built with Next.js, MongoDB, and Together.ai, it offers both students and teachers a unique way to approach learning.

## Features

- **Interactive Quiz Games**: Multiple game modes to make learning fun
- **AI-Powered Quiz Generation**: Automatically generate quizzes on any topic
- **User Authentication**: Secure login with Google OAuth
- **Role-Based Access**: Separate interfaces for students and teachers
- **Progress Tracking**: Track scores and performance
- **Rankings System**: Competitive leaderboard to encourage participation
- **AI Assistant**: Get help and explanations using Together.ai
- **Chess Game**: Play chess against AI (multiple difficulty levels) or online against other players.

## Technologies Used

- **Frontend**: Next.js (React), Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Node.js (custom server for Socket.IO)
- **Database**: MongoDB (via MongoDB Atlas)
- **Authentication**: NextAuth.js (Google OAuth)
- **AI (Quiz Generation & Assistant)**: Together.ai API
- **AI (Chess Engine)**: Stockfish.js (via Web Worker)
- **Real-time Communication (Chess Online)**: Socket.IO
- **Game Logic (Quiz Games)**: Kaboom.js, React state management
- **Chess Logic**: chess.js, react-chessboard

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account
- Google Cloud Console account (for OAuth)
- Together.ai API key

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd QuizzQuest
```

2. Install dependencies:
```bash
npm install
```

3. Environment Setup:
   - Copy `example.env.local` to `.env.local`
   - Configure the following environment variables:
     - `MONGODB_URL`: Your MongoDB connection string
     - `NEXTAUTH_SECRET`: Generate using provided commands in example.env.local
     - `GOOGLE_ID` and `GOOGLE_SECRET`: From Google Cloud Console
     - `TOGETHER_API_KEY`: From Together.ai dashboard

4. Chess AI Setup (Stockfish):
   - The chess game uses Stockfish.js for its AI opponent. The necessary engine files need to be available in the `public/stockfish/` directory.
   - After `npm install`, locate the Stockfish worker files in `node_modules/stockfish/src/`. Typically, these are `stockfish-nnue-16.js` (or similar) and `stockfish-nnue-16.wasm`. Also, find the neural network file (e.g., `nn-xxxxxxxxxxxx.nnue`).
   - Create a directory `public/stockfish`.
   - Copy `stockfish-nnue-16.js` to `public/stockfish/stockfish.js`.
   - Copy `stockfish-nnue-16.wasm` to `public/stockfish/stockfish.wasm`.
   - Copy the `.nnue` file (e.g., `nn-5af11540bbfe.nnue`) to `public/stockfish/`.
   *(The exact filenames might vary slightly based on the installed Stockfish version. The application expects `stockfish.js` and `stockfish.wasm` in `public/stockfish/` and will load the `.nnue` file from there as well.)*

5. Run the development server:
   - The project now uses a custom server for Socket.IO integration.
```bash
npm run dev
```
   (This script now runs `node server.js`)

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `/app`: Next.js 14 app directory containing all routes and pages
  - `/api`: Backend API routes for authentication and data handling
  - `/components`: Reusable React components
  - `/autoquiz`: AI-powered quiz generation interface
  - `/chess`: Chess game page
  - `/api/socket`: API route for Socket.IO (used by custom server)
- `/lib`: Utility functions and database configuration
- `/public`: Static assets and images
  - `/stockfish`: Contains Stockfish engine files (must be manually copied, see "Chess AI Setup")
- `server.js`: Custom Node.js server for Next.js and Socket.IO integration.

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Run production server
- `npm run lint`: Run ESLint

## Setting Up OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Configure the OAuth consent screen
5. Create OAuth 2.0 credentials
6. Add authorized redirect URIs:
   - http://localhost:3000/api/auth/callback/google (for development)
   - https://your-domain.com/api/auth/callback/google (for production)

## Setting Up MongoDB

1. Create a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
2. Create a new cluster
3. Configure network access and database user
4. Get your connection string and add it to .env.local

## Setting Up Together.ai

1. Sign up at [Together.ai](https://together.ai/)
2. Generate an API key from your dashboard
3. Add the API key to .env.local

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
