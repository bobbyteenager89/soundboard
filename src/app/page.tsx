'use client';

import { useState, useRef } from 'react';

// Sound management
let currentAudio: HTMLAudioElement | null = null;

// Team configurations
const TEAMS = {
  default: {
    name: "Default (No Team)",
    primaryColor: "from-blue-700 to-blue-900",
  },
  packers: {
    name: "Green Bay Packers",
    primaryColor: "from-green-700 to-yellow-600",
  },
  bears: {
    name: "Chicago Bears",
    primaryColor: "from-blue-800 to-orange-600",
  },
  bills: {
    name: "Buffalo Bills",
    primaryColor: "from-blue-700 to-red-600",
  },
  chiefs: {
    name: "Kansas City Chiefs",
    primaryColor: "from-red-700 to-yellow-600",
  }
};

// All sounds
const ALL_SOUNDS = [
  { file: "fox-full-song.wav", label: "FOX NFL THEME" },
  { file: "fox-single-phrase.wav", label: "FOX STING" },
  { file: "fox-injury-music.wav", label: "INJURY MUSIC" },
  { file: "heres-a-guy.wav", label: "HERE'S A GUY" },
  { file: "whoop.wav", label: "WHOOP!" },
  { file: "jacked-up.wav", label: "JACKED UP!" },
  { file: "go-all-the-way.wav", label: "GO ALL THE WAY!" },
  { file: "touchdown-Green Bay Packers (Bang on the Drum).mp3", label: "PACKERS TD", team: "packers" },
  { file: "touchdown-Chicago Bears.mp3", label: "BEARS TD", team: "bears" },
  { file: "touchdown-Buffalo Bills.mp3", label: "BILLS TD", team: "bills" },
  { file: "touchdown-Kansas City Chiefs.mp3", label: "CHIEFS TD", team: "chiefs" }
];

export default function Home() {
  const [selectedTeam, setSelectedTeam] = useState<keyof typeof TEAMS>('default');
  const currentTeam = TEAMS[selectedTeam];

  // Filter sounds based on team selection
  const teamSounds = ALL_SOUNDS.filter(sound => sound.team === selectedTeam);
  const otherSounds = ALL_SOUNDS.filter(sound => !sound.team);
  const sounds = [...teamSounds, ...otherSounds];

  return (
    <div className="min-h-screen bg-[#000033] p-4">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 p-4">
          FOOTBALL GUY SOUNDBOARD
        </h1>
        
        {/* Team Selector */}
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value as keyof typeof TEAMS)}
          className="
            mt-4
            px-4 
            py-2 
            rounded-lg 
            bg-gray-800 
            text-white 
            border-2 
            border-gray-600
            focus:outline-none 
            focus:border-yellow-400
          "
        >
          {Object.entries(TEAMS).map(([key, team]) => (
            <option key={key} value={key}>
              {team.name}
            </option>
          ))}
        </select>
      </header>

      {/* Soundboard Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {sounds.map((sound) => (
          <SoundButton 
            key={sound.file} 
            file={sound.file}
            label={sound.label}
            className={sound.team ? `bg-gradient-to-b ${currentTeam.primaryColor}` : undefined}
          />
        ))}
      </div>

      {/* Footer */}
      <footer className="text-center text-yellow-400 mt-8 text-sm">
        <p>© 1996-style Football Soundboard - Best viewed in Netscape Navigator</p>
      </footer>
    </div>
  );
}

// Sound Button Component
function SoundButton({ 
  file, 
  label,
  className = "bg-gradient-to-b from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800 active:from-blue-800 active:to-blue-950"
}: { 
  file: string; 
  label: string;
  className?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(`/sounds/${file}`);
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
      });
    }

    if (isPlaying) {
      // If this sound is playing, stop it and reset
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      // Stop any currently playing sound
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      // Play this sound
      audioRef.current.play().catch(console.error);
      currentAudio = audioRef.current;
      setIsPlaying(true);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        aspect-square
        p-4 
        text-white 
        font-bold 
        border-4 
        border-gray-600 
        ${className}
        ${isPlaying ? 'border-yellow-400 scale-95' : ''}
        rounded-lg 
        shadow-lg
        transition-all
        hover:scale-105
        active:scale-95
        text-center
        flex
        items-center
        justify-center
      `}
    >
      <span className="text-center">{label}</span>
    </button>
  );
}
