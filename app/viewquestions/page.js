
'use client';
import Viewquestions from '../components/Viewquestions';
import { SessionProvider, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

function ViewQuestionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (status === 'unauthenticated') {
      router.push('/auth/login'); // Redirect to login if not authenticated
    }
  }, [session, status, router]);

  if (status === 'authenticated') {
    return (
      <>
        <SessionProvider>
          <Viewquestions />
        </SessionProvider>
      </>
    );
  }

  // Render nothing while checking authentication
  return null;
}

ViewQuestionsPage.displayName = 'ViewQuestionsPage';
export default ViewQuestionsPage;
