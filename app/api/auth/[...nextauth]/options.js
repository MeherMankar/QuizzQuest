import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from 'bcrypt';
import clientPromise from '../../../../lib/mongodb';

export const options = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      async profile(profile) {
        try {
          const client = await clientPromise;
          if (!client) {
            console.error('MongoDB client not available');
            return {
              id: profile.sub,
              name: profile.name,
              email: profile.email,
              image: profile.picture,
              role: null,
            };
          }
          
          const db = client.db('QuizApp_users');
          
          // Check user's role
          const user = await db.collection('users').findOne({ email: profile.email });
          let role = user?.role;

          if (!role) {
            const teacher = await db.collection('teachers').findOne({ email: profile.email });
            const student = await db.collection('students').findOne({ email: profile.email });
            role = teacher ? 'teacher' : (student ? 'student' : null);
          }

          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            role: role,
          };
        } catch (error) {
          console.error('Error in profile callback:', error);
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            role: null,
          };
        }
      }
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const client = await clientPromise;
        const db = client.db('QuizApp_users');
        const user = await db.collection('users').findOne({ email: credentials.email });

        if (!user || !user.password) return null;

        const passwordMatch = await compare(credentials.password, user.password);
        if (!passwordMatch) return null;

        // Get role from users collection first
        let role = user.role;

        // Fallback to checking individual collections
        if (!role) {
          const teacher = await db.collection('teachers').findOne({ email: user.email });
          const student = await db.collection('students').findOne({ email: user.email });
          role = teacher ? 'teacher' : (student ? 'student' : null);
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name || user.email.split('@')[0],
          role: role,
        };
      }
    }),
  ],
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      
      try {
        const client = await clientPromise;
        if (!client) return token;
        
        const db = client.db('QuizApp_users');
        
        const teacher = await db.collection('teachers').findOne({ email: token.email });
        const student = await db.collection('students').findOne({ email: token.email });
        
        if (teacher) {
          token.role = 'teacher';
        } else if (student) {
          token.role = 'student';
        }
      } catch (error) {
        console.error('Error fetching role in jwt callback:', error);
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  
  events: {
    async signIn({ user, account, profile }) {
      try {
        const client = await clientPromise;
        if (!client) return;
        
        const db = client.db('QuizApp_users');
        
        const teacher = await db.collection('teachers').findOne({ email: user.email });
        const student = await db.collection('students').findOne({ email: user.email });
        
        if (teacher) {
          user.role = 'teacher';
        } else if (student) {
          user.role = 'student';
        }
      } catch (error) {
        console.error('Error in signIn event:', error);
      }
    }
  },
  debug: process.env.NODE_ENV === 'development'
};

export default NextAuth(options);
