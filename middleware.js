import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to home page without auth
        if (req.nextUrl.pathname === '/') {
          return true;
        }
        return !!token;
      }
    },
  }
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|auth|autoquiz|play-autoquiz-game|aboutus|$).*)",
  ],
};
