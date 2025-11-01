'use client';

export function AnimatedGlobe() {
  return (
    <div className="relative w-64 h-64 opacity-70 -ml-12">
      {/* Globe container */}
      <div className="globe-container">
        {/* Main globe sphere */}
        <div className="globe">
          {/* Latitude lines */}
          <div className="latitude-line" style={{ top: '20%' }}></div>
          <div className="latitude-line" style={{ top: '40%' }}></div>
          <div className="latitude-line equator" style={{ top: '50%' }}></div>
          <div className="latitude-line" style={{ top: '60%' }}></div>
          <div className="latitude-line" style={{ top: '80%' }}></div>

          {/* Longitude lines */}
          <div className="longitude-line" style={{ left: '20%' }}></div>
          <div className="longitude-line" style={{ left: '40%' }}></div>
          <div className="longitude-line prime-meridian" style={{ left: '50%' }}></div>
          <div className="longitude-line" style={{ left: '60%' }}></div>
          <div className="longitude-line" style={{ left: '80%' }}></div>

          {/* Connection dots */}
          <div className="connection-dot" style={{ top: '30%', left: '25%' }}></div>
          <div className="connection-dot" style={{ top: '45%', left: '70%' }}></div>
          <div className="connection-dot" style={{ top: '60%', left: '40%' }}></div>
          <div className="connection-dot" style={{ top: '35%', left: '80%' }}></div>
          <div className="connection-dot" style={{ top: '70%', left: '55%' }}></div>

          {/* Pulse rings */}
          <div className="pulse-ring" style={{ top: '30%', left: '25%' }}></div>
          <div className="pulse-ring" style={{ top: '45%', left: '70%', animationDelay: '0.5s' }}></div>
          <div className="pulse-ring" style={{ top: '60%', left: '40%', animationDelay: '1s' }}></div>
        </div>

        {/* Orbital ring */}
        <div className="orbital-ring"></div>
      </div>

      <style jsx>{`
        .globe-container {
          position: relative;
          width: 100%;
          height: 100%;
          perspective: 1000px;
        }

        .globe {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%,
            rgba(59, 130, 246, 0.35) 0%,
            rgba(37, 99, 235, 0.25) 40%,
            rgba(29, 78, 216, 0.15) 100%);
          border: 2px solid rgba(96, 165, 250, 0.5);
          box-shadow:
            inset 0 0 40px rgba(59, 130, 246, 0.4),
            0 0 60px rgba(59, 130, 246, 0.3);
          animation: rotate 20s linear infinite;
          transform-style: preserve-3d;
          overflow: hidden;
        }

        .latitude-line {
          position: absolute;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(147, 197, 253, 0.7) 50%,
            transparent 100%);
          left: 0;
          transform: rotateX(60deg);
        }

        .equator {
          height: 2px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(96, 165, 250, 0.9) 50%,
            transparent 100%);
        }

        .longitude-line {
          position: absolute;
          width: 1px;
          height: 100%;
          background: linear-gradient(180deg,
            transparent 0%,
            rgba(147, 197, 253, 0.7) 50%,
            transparent 100%);
          top: 0;
        }

        .prime-meridian {
          width: 2px;
          background: linear-gradient(180deg,
            transparent 0%,
            rgba(96, 165, 250, 0.9) 50%,
            transparent 100%);
        }

        .connection-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          background: rgba(96, 165, 250, 0.8);
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(96, 165, 250, 0.6);
          animation: pulse 2s ease-in-out infinite;
          transform: translate(-50%, -50%);
        }

        .pulse-ring {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(96, 165, 250, 0.6);
          border-radius: 50%;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          transform: translate(-50%, -50%);
        }

        .orbital-ring {
          position: absolute;
          width: 110%;
          height: 110%;
          top: -5%;
          left: -5%;
          border: 1px solid rgba(147, 197, 253, 0.2);
          border-radius: 50%;
          animation: orbit 30s linear infinite;
        }

        @keyframes rotate {
          from {
            transform: rotateY(0deg) rotateX(15deg);
          }
          to {
            transform: rotateY(360deg) rotateX(15deg);
          }
        }

        @keyframes orbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(1.2);
          }
        }

        @keyframes ping {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          75%, 100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
