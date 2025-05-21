import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    return;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|auth/signin|auth/login|autoquiz|play-autoquiz-game|$).*)",
  ],
};
