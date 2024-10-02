'use client'
import React from 'react'
import Button from '../Button';
import Image from 'next/image';

const Success = () => {
 

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Handle login logic here
//   };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <Image src="/done.png" alt="success" width={50} height={50} />
      <h2 className="text-xl md:text-3xl font-bold mb-4 mt-3">
        Password reset successful
      </h2>
      <p className="text-gray-600 text-base font-bold md:text-xl max-w-[350px] mb-4 md:mb-6">
        Your password has been changed successfully
      </p>
      <div className="flex items-center justify-between mb-6">
        <Button title="Proceed to login" onClick={() => {}} />
      </div>
    </div>
  );
};

export default Success
