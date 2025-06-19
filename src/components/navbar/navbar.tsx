import React from 'react';
import Link from 'next/link';
import SunIcon from './sun';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white font-bold text-xl">Ragify</div>
        <div className="flex space-x-4">
          <Link href="/">
            <p className="text-gray-300 hover:text-white">Home</p>
          </Link>
          <Link href="/upload">
            <p className="text-gray-300 hover:text-white">Upload</p>
          </Link>
          <Link href="/chat">
            <p className="text-gray-300 hover:text-white">Chat</p>
          </Link>
          {/* <Link href="/contact">
            <p className="text-gray-300 hover:text-white">Contact</p>
          </Link> */}
          <SunIcon />
          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

