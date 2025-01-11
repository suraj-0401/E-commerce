import React from 'react';
import logo from '../Assests/logo.png'; // Adjust the path according to your project structure
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className=" bg-gray-800 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between mb-8">
          {/* Logo and Company Info */}
          <div className="mb-6 md:mb-0 flex flex-col items-center md:items-start">
            <img src={logo} alt="Company Logo" className="w-32 h-auto mb-2" /> {/* Logo Image */}
          </div>
          {/* Links */}
          <div className="flex flex-col md:flex-row md:space-x-12">
            <div className="mb-6 md:mb-0 flex flex-col items-center md:items-start">
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="hover:text-blue-400 transition">Home</Link></li>
                <li><Link to="#" className="hover:text-blue-400 transition">About</Link></li>
                <li><Link to="#" className="hover:text-blue-400 transition">Services</Link></li>
                <li><Link to="#" className="hover:text-blue-400 transition">Contact</Link></li>
              </ul>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <Link to="#" className="hover:text-blue-400 transition">Facebook</Link>
                <Link to="#" className="hover:text-blue-400 transition">Twitter</Link>
                <Link to="#" className="hover:text-blue-400 transition">Instagram</Link>
                <Link to="#" className="hover:text-blue-400 transition">LinkedIn</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} YourCompany. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

