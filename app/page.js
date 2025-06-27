'use client';

import { useState } from 'react';
import Image from "next/image";
import dynamic from 'next/dynamic';

// Dynamically import the QR code components to avoid SSR issues
const QrCodeScanner = dynamic(() => import('./components/QrCodeScanner'), {
  ssr: false,
});
const QrResult = dynamic(() => import('./components/QrResult'), {
  ssr: false,
});

export default function Home() {
  const [scanResult, setScanResult] = useState(null);

  const handleScanResult = (result) => {
    setScanResult(result);
  };

  const clearResult = () => {
    setScanResult(null);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-8 pb-20 gap-8 sm:p-12 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full max-w-3xl flex flex-col items-center mb-4">
        <h1 className="text-3xl font-bold mb-2">QR Code Scanner</h1>
        <p className="text-gray-600 dark:text-gray-300 text-center">
          Scan any QR code using your device's camera
        </p>
      </header>

      <main className="flex flex-col items-center w-full max-w-3xl">
        {/* QR Code Scanner Component */}
        <QrCodeScanner onResult={handleScanResult} />
        
        {/* QR Code Result Component */}
        <QrResult result={scanResult} onClear={clearResult} />
        
        {/* Instructions */}
        {!scanResult && (
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">How to use:</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Click "Start Scanning" to activate your camera</li>
              <li>Point your camera at a QR code</li>
              <li>The result will appear automatically</li>
              <li>If it's a URL, you can click to open it</li>
            </ol>
          </div>
        )}
      </main>

      <footer className="mt-auto pt-8 flex gap-[24px] flex-wrap items-center justify-center text-sm text-gray-600 dark:text-gray-400">
        <p>Built with Next.js and html5-qrcode</p>
      </footer>
    </div>
  );
}
