'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-4 font-sans">
      <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
        未来VPN
      </h1>
      <p className="text-gray-400 text-xl mt-2">miraivpn.com</p>
      <p className="text-gray-500 text-lg mt-6 tracking-widest animate-pulse">
        WE ARE COMING SOON...
      </p>
      <div id="clock" className="text-4xl mt-6 font-mono text-cyan-400 drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">
        {time}
      </div>
      <div className="mt-10 border border-gray-700 rounded-2xl p-6 w-80 text-left shadow-lg bg-black/30 backdrop-blur-sm">
        <h2 className="text-xl text-cyan-400 mb-3 font-semibold drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">Connection Stats</h2>
        <p className="text-gray-300"><span className="text-cyan-400">✔</span> SSL: Active</p>
        <p className="text-gray-300">Ping: 23 ms</p>
        <p className="text-gray-300">Down: 56.8 Mbps / Up: 13.2 Mbps</p>
      </div>
      <a href="/docs/Vpn_Project_Plan.pdf" target="_blank"
         className="mt-10 inline-block border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black rounded-xl px-6 py-3 font-semibold transition-all drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">
         LEARN MORE
      </a>
    </div>
  );
}
