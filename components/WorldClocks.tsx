'use client';

import { useEffect, useState } from 'react';

interface ClockProps {
  timezone: string;
  label: string;
  offset: number; // UTC offset in hours
}

function AnalogueClock({ timezone, label, offset }: ClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate angles for hands
  const now = new Date(time.getTime() + offset * 60 * 60 * 1000);
  const hours = now.getUTCHours();
  const minutes = now.getUTCMinutes();
  const seconds = now.getUTCSeconds();

  const secondAngle = (seconds / 60) * 360;
  const minuteAngle = (minutes / 60) * 360 + (seconds / 60) * 6;
  const hourAngle = ((hours % 12) / 12) * 360 + (minutes / 60) * 30;

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Clock Face */}
      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 shadow-inner border border-gray-200">
        {/* Hour markers */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30) * (Math.PI / 180);
          const x = 50 + 38 * Math.sin(angle);
          const y = 50 - 38 * Math.cos(angle);
          return (
            <div
              key={i}
              className="absolute w-0.5 h-1.5 bg-gray-400"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
              }}
            />
          );
        })}

        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-gray-700 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-20" />

        {/* Hour hand */}
        <div
          className="absolute bottom-1/2 left-1/2 w-1 bg-gray-700 rounded-full origin-bottom transition-transform duration-1000"
          style={{
            height: '22%',
            transform: `translateX(-50%) rotate(${hourAngle}deg)`,
          }}
        />

        {/* Minute hand */}
        <div
          className="absolute bottom-1/2 left-1/2 w-0.5 bg-gray-600 rounded-full origin-bottom transition-transform duration-1000"
          style={{
            height: '30%',
            transform: `translateX(-50%) rotate(${minuteAngle}deg)`,
          }}
        />

        {/* Second hand */}
        <div
          className="absolute bottom-1/2 left-1/2 w-px bg-red-500 rounded-full origin-bottom transition-transform duration-1000"
          style={{
            height: '32%',
            transform: `translateX(-50%) rotate(${secondAngle}deg)`,
          }}
        />
      </div>

      {/* Label */}
      <span className="text-[9px] font-medium text-gray-600 text-center leading-tight">{label}</span>
    </div>
  );
}

export function WorldClocks() {
  const clocks = [
    { timezone: 'America/New_York', label: 'NYC', offset: -5 },
    { timezone: 'America/Los_Angeles', label: 'LA', offset: -8 },
    { timezone: 'Europe/London', label: 'LON', offset: 0 },
    { timezone: 'Europe/Brussels', label: 'BRU', offset: 1 },
    { timezone: 'Asia/Tokyo', label: 'TYO', offset: 9 },
    { timezone: 'Australia/Sydney', label: 'SYD', offset: 11 },
  ];

  return (
    <div className="flex flex-col gap-4 py-2">
      {clocks.map((clock) => (
        <AnalogueClock
          key={clock.timezone}
          timezone={clock.timezone}
          label={clock.label}
          offset={clock.offset}
        />
      ))}
    </div>
  );
}
