'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { FaCamera, FaCameraRetro, FaLightbulb, FaRedo, FaStop, FaTimes } from 'react-icons/fa';

const QrCodeScanner = ({ onResult }) => {
  const [scanning, setScanning] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [lastResult, setLastResult] = useState('');
  const scannerRef = useRef(null);
  const containerRef = useRef(null);
  const audioRef = useRef(null);
  const containerId = useRef(`scanner-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    // Load available cameras
    loadCameras();
    
    return () => {
      if (scannerRef.current && scanning) {
        scannerRef.current.stop().catch(console.warn);
      }
    };
  }, []);

  const loadCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices.length > 0) {
        setCameras(devices);
        setSelectedCamera(devices[0].id);
      }
    } catch (err) {
      console.warn('Could not load cameras:', err);
    }
  };

  const startScanner = async () => {
    if (!selectedCamera) return;
    
    setError(null);
    try {
      // Create new scanner instance
      scannerRef.current = new Html5Qrcode(containerId.current, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.UPC_A
        ]
      });

      setScanning(true);
      setPermissionGranted(true);

      await scannerRef.current.start(
        { deviceId: { exact: selectedCamera } },
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false
        },
        (decodedText, decodedResult) => {
          handleScanSuccess(decodedText, decodedResult);
        },
        (errorMessage) => {
          // Ignore per-frame errors
        }
      );
    } catch (err) {
      handleScanError(err);
    }
  };

  const handleScanSuccess = (decodedText, decodedResult) => {
    if (onResult) onResult(decodedText, decodedResult);
    
    // Visual and audio feedback
    setLastResult(decodedText);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.warn);
    }
  };

  const handleScanError = (err) => {
    let errorMessage = err.message || 'Camera access denied';
    
    if (err.name === 'NotAllowedError') {
      errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
    } else if (err.name === 'NotFoundError') {
      errorMessage = 'No camera devices found.';
    }
    
    setError(errorMessage);
    setScanning(false);
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current && scanning) {
        await scannerRef.current.stop();
        setScanning(false);
        setTorchOn(false);
      }
    } catch (err) {
      console.error('Error stopping scanner:', err);
    }
  };

  const toggleTorch = async () => {
    if (!scanning) return;
    
    try {
      await scannerRef.current.applyVideoConstraints(selectedCamera, {
        advanced: [{ torch: !torchOn }]
      });
      setTorchOn(!torchOn);
    } catch {
      setError('Flashlight not supported on this device');
    }
  };

  const switchCamera = async () => {
    if (!scanning || cameras.length < 2) return;
    
    try {
      await stopScanner();
      
      // Find next camera in list
      const currentIndex = cameras.findIndex(cam => cam.id === selectedCamera);
      const nextIndex = (currentIndex + 1) % cameras.length;
      setSelectedCamera(cameras[nextIndex].id);
      
      // Restart with new camera
      setTimeout(startScanner, 300);
    } catch (err) {
      setError(`Failed to switch camera: ${err.message}`);
    }
  };

  const retryScan = () => {
    setError(null);
    setLastResult('');
    startScanner();
  };

  return (
    <div className="qr-scanner-container relative">
      {/* Camera preview area */}
      <div 
        ref={containerRef}
        className="qr-reader-container relative rounded-xl overflow-hidden border-2 border-gray-300 shadow-lg"
      >
        {/* Scanner container with unique ID */}
        <div id={containerId.current} className="w-full h-full" />
        
        {/* Viewfinder overlay */}
        {scanning && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Top border */}
            <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-black/50 to-transparent"></div>
            {/* Bottom border */}
            <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/50 to-transparent"></div>
            
            {/* Center viewfinder box */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64">
              {/* Corner indicators */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Result display */}
      {lastResult && (
        <div className="result-display mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-green-800">Scanned Successfully!</h3>
              <p className="text-green-700 truncate max-w-[300px]">{lastResult}</p>
            </div>
            <button 
              onClick={() => setLastResult('')}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}
      
      {/* Error display */}
      {error && (
        <div className="error-message mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-red-800">Scan Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
            <button 
              onClick={retryScan}
              className="flex items-center gap-1 text-red-700 hover:text-red-900"
            >
              <FaRedo className="mr-1" /> Retry
            </button>
          </div>
        </div>
      )}
      
      {/* Camera controls */}
      <div className="controls mt-6 flex flex-wrap justify-center gap-3">
        {!scanning ? (
          <button
            onClick={startScanner}
            disabled={!selectedCamera}
            className="flex items-center justify-center gap-2 text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 transition-all duration-500 ease-in-out transform hover:scale-[1.02] relative overflow-hidden group"
          >
            {/* Gradient animation overlay */}
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-transparent to-transparent animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-700"></span>
            
            {/* Button content */}
            <span className="relative z-10 flex items-center gap-2">
              <FaCamera className="text-lg transition-transform group-hover:scale-110" />
              Start Scanning
            </span>
          </button>
        ) : (
          <>
            <button
              onClick={stopScanner}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm transition-all duration-300 hover:scale-[1.03]"
            >
              <FaStop className="text-lg transition-transform hover:scale-110" />
              Stop
            </button>
            
            {cameras.length > 1 && (
              <button
                onClick={switchCamera}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-medium text-sm transition-all duration-300 hover:scale-[1.03]"
              >
                <FaCameraRetro className="text-lg transition-transform hover:scale-110" />
                Switch Camera
              </button>
            )}
            
            <button
              onClick={toggleTorch}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 hover:scale-[1.03] ${
                torchOn 
                  ? 'bg-yellow-500 text-black hover:bg-yellow-600' 
                  : 'bg-gray-800 text-white hover:bg-gray-900'
              }`}
            >
              <FaLightbulb className="text-lg transition-transform hover:scale-110" />
              {torchOn ? 'Flash On' : 'Flash Off'}
            </button>
          </>
        )}
      </div>
      
      {/* Camera selection dropdown */}
      {cameras.length > 0 && !scanning && (
        <div className="camera-selector mt-4 w-full max-w-xs mx-auto">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Select Camera
          </label>
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="w-full p-2 border border-gray-300 text-black rounded-lg bg-white transition-all duration-300 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Status indicators */}
      <div className="status-indicators mt-4 flex justify-center gap-4 text-sm text-gray-600">
        {scanning && (
          <div className="flex items-center gap-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Scanning...
          </div>
        )}
        {permissionGranted && <div>Camera: Ready</div>}
      </div>
      
      {/* Hidden audio element for scan sound */}
      <audio ref={audioRef}>
        <source src="/success-beep.mp3" type="audio/mpeg" />
      </audio>
      
      <style jsx>{`
        .qr-scanner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
          padding: 1rem;
        }
        .qr-reader-container {
          position: relative;
          width: 100%;
          aspect-ratio: 1/1;
          max-width: 500px;
          background: #000;
        }
        
        /* Shimmer animation */
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default QrCodeScanner;