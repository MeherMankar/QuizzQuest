import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const options = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: '/auth/login',  // Custom sign-in page route
  },
};

export default NextAuth(options);
