# QR Code Reader Application

A simple QR code reader application built with Next.js and the html5-qrcode library. This application allows users to scan QR codes using their device's camera and displays the results. If the scanned QR code contains a URL, users can click to open it directly.

## Features

- Real-time QR code scanning using the device camera
- Support for both front and back cameras
- Automatic detection and display of QR code content
- URL detection and direct link opening
- Responsive design that works on mobile and desktop

## Prerequisites

- Node.js 18.17 or later
- npm or yarn

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Install the html5-qrcode library if not already installed:

```bash
npm install html5-qrcode --save
# or
yarn add html5-qrcode
```

## Running the Application

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. Click the "Start Scanning" button to activate your camera
2. Allow camera permissions when prompted by your browser
3. Point your camera at a QR code
4. The content of the QR code will be displayed automatically
5. If the QR code contains a URL, you can click on it to open in a new tab
6. Click "Clear" to reset and scan another QR code

## Browser Compatibility

This application works on modern browsers that support the MediaDevices API:

- Chrome (desktop and mobile)
- Firefox (desktop and mobile)
- Safari (iOS 11+)
- Edge (desktop)

## Notes

- Camera access requires a secure context (HTTPS) when deployed to production
- For local development, http://localhost is considered secure
- Some browsers may require permission to be granted for camera access

## License

MIT
