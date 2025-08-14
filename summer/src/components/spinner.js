import React from 'react';

// Spinner can render as a full-page component (default)
// or as a non-intrusive overlay when overlay={true}
const Spinner = ({ overlay = false, background = 'rgba(255,255,255,0.8)' }) => {
  return (
    <>
      <style>
        {`
          /* Base styles */
          .absolute { position: absolute; }
          .inline-block { display: inline-block; }
          .loader { display: flex; margin: 0.25em 0; flex-wrap: wrap; justify-content: center; }
          .w-2 { width: 0.75em; }

          /* Animation styles */
          .dash { animation: dashArray 2s ease-in-out infinite, dashOffset 2s linear infinite; }
          @keyframes dashArray { 0% { stroke-dasharray: 0 1 359 0; } 50% { stroke-dasharray: 0 359 1 0; } 100% { stroke-dasharray: 359 1 0 0; } }
          @keyframes dashOffset { 0% { stroke-dashoffset: 365; } 100% { stroke-dashoffset: 5; } }
          .gold-gradient { stroke: url(#gold-black); }

          /* Overlay wrapper (does not affect global body layout) */
          .spinner-overlay-wrapper {
            position: fixed;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            background: ${overlay ? background : 'transparent'};
          }

          /* Fullscreen fallback wrapper for when Spinner is rendered alone */
          .spinner-fullscreen-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f8e8c3;
          }
        `}
      </style>

      <div className={overlay ? 'spinner-overlay-wrapper' : 'spinner-fullscreen-wrapper'}>
        <div className="loader">
          <svg height="0" width="0" viewBox="0 0 64 64" className="absolute">
            <defs>
              <linearGradient id="gold-black" gradientUnits="userSpaceOnUse" y2="2" x2="0" y1="62" x1="0">
                <stop stopColor="#FFD700"></stop>
                <stop stopColor="#000" offset="1"></stop>
              </linearGradient>
            </defs>
          </svg>

          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="96" width="96" className="inline-block">
            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="8" className="dash gold-gradient" d="M 16 56 V 8 h 18 a 14 14 0 0 1 0 28 H 16 L 48 56" pathLength="360"></path>
          </svg>
          <div className="w-2"></div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="96" width="96" className="inline-block">
            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="8" className="dash gold-gradient" d="M 32 8 V 56 M 16 56 H 48 M 16 8 H 48" pathLength="360"></path>
          </svg>
          <div className="w-2"></div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="96" width="96" className="inline-block">
            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="8" className="dash gold-gradient" d="M 12 8 L 32 56 L 52 8" pathLength="360"></path>
          </svg>
          <div className="w-2"></div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="96" width="96" className="inline-block">
            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="8" className="dash gold-gradient" d="M 12 56 L 32 8 L 52 56 M 19 38 H 45" pathLength="360"></path>
          </svg>
          <div className="w-2"></div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="96" width="96" className="inline-block">
            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="8" className="dash gold-gradient" d="M 12 56 L 32 8 L 52 56 M 19 38 H 45" pathLength="360"></path>
          </svg>
          <div className="w-2"></div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="96" width="96" className="inline-block">
            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="8" className="dash gold-gradient" d="M 12 8 L 32 32 L 52 8 M 32 32 V 56" pathLength="360"></path>
          </svg>
          <div className="w-2"></div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="96" width="96" className="inline-block">
            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="8" className="dash gold-gradient" d="M 12 56 L 32 8 L 52 56 M 19 38 H 45" pathLength="360"></path>
          </svg>
          <div className="w-2"></div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="96" width="96" className="inline-block">
            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="8" className="dash gold-gradient" d="M 12 56 L 32 8 L 52 56 M 19 38 H 45" pathLength="360"></path>
          </svg>
          <div className="w-2"></div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="96" width="96" className="inline-block">
            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="8" className="dash gold-gradient" d="M 12 8 H 52 M 32 8 V 56" pathLength="360"></path>
          </svg>
        </div>
      </div>
    </>
  );
};

export default Spinner;