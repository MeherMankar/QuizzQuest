'use client'
import Landingpage from './components/landingapge'
import { SessionProvider } from 'next-auth/react'

import React from 'react';
function HomePage() {
  return(<>
  
  <SessionProvider>
    <Landingpage/>
  </SessionProvider>
  </>)
}
HomePage.displayName = 'HomePage';
export default HomePage;
