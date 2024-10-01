import Header from '@/components/Header';
import React from 'react'

const page = () => {
  return (
    <div>
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            {/* <Login /> */}
          </div>
        </main>
      </div>
    </div>
  );
}

export default page
