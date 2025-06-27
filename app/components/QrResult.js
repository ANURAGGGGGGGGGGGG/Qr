'use client';

import { useState, useEffect } from 'react';
import { FaCopy, FaExternalLinkAlt, FaTimes, FaCheck, FaShare } from 'react-icons/fa';

const QrResult = ({ result, onClear }) => {
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  if (!result) return null;

  // Check if the result is a URL
  const isUrl = (text) => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  // Copy to clipboard function
  const copyToClipboard = () => {
    navigator.clipboard.writeText(result)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy: ', err));
  };

  // Share functionality
  const shareContent = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'QR Scan Result',
          text: 'Check out this QR code result:',
          url: isUrl(result) ? result : undefined
        });
      } else {
        copyToClipboard();
      }
    } catch (err) {
      console.error('Sharing failed:', err);
    }
  };

  return (
    <div className="qr-result animate-fadeIn bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md mx-auto mt-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-8 h-8 rounded-full flex items-center justify-center">
            ✓
          </span>
          Scan Successful!
        </h3>
        <button 
          onClick={onClear} 
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <FaTimes />
        </button>
      </div>
      
      <div className="result-content p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 mb-4 break-words relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-500 rounded-l"></div>
        
        {isUrl(result) ? (
          <a 
            href={result} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
          >
            <FaExternalLinkAlt className="flex-shrink-0" />
            <span className="truncate">{result}</span>
          </a>
        ) : (
          <div className="flex">
            <div className="bg-gray-200 dark:bg-gray-700 w-0.5 mr-3 rounded-full"></div>
            <p className="text-gray-700 dark:text-gray-300">{result}</p>
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3">
        <button 
          onClick={copyToClipboard}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all ${
            copied 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
          }`}
        >
          {copied ? (
            <>
              <FaCheck /> Copied!
            </>
          ) : (
            <>
              <FaCopy /> Copy
            </>
          )}
        </button>
        
        {isUrl(result) && (
          <a 
            href={result} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <FaExternalLinkAlt /> Open
          </a>
        )}
        
        <button 
          onClick={shareContent}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          <FaShare /> Share
        </button>
      </div>

      {/* Additional options */}
      <div className="mt-4">
        <button 
          onClick={() => setShowOptions(!showOptions)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
        >
          {showOptions ? 'Hide options' : 'More actions...'}
        </button>
        
        {showOptions && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 animate-fadeIn">
            <div className="grid grid-cols-2 gap-2">
              <button className="text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                Save to contacts
              </button>
              <button className="text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                Add to calendar
              </button>
              <button className="text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                Create reminder
              </button>
              <button className="text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                Send as message
              </button>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default QrResult;