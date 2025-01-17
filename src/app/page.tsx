'use client';

import { useState, useRef, useEffect } from 'react';

// Sound management
let currentAudio: HTMLAudioElement | null = null;

// Function to get album art URL from audio element
const getAlbumArt = (audio: HTMLAudioElement): string | null => {
  const mediaElement = audio as any;
  if (mediaElement.metadata && mediaElement.metadata.picture && mediaElement.metadata.picture.length > 0) {
    const picture = mediaElement.metadata.picture[0];
    const blob = new Blob([picture.data], { type: picture.format });
    return URL.createObjectURL(blob);
  }
  return null;
};

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
  { file: "fox-single-phrase.wav", label: "FOX NFL THEME (SHORT)" },
  { file: "CBS-NFL-THEME.mp3", label: "CBS THEME" },
  { file: "fox-injury-music.wav", label: "INJURY MUSIC" },
  { file: "heres-a-guy.wav", label: "HERE'S A GUY" },
  { file: "whoop.wav", label: "WHOOP!" },
  { file: "jacked-up.wav", label: "JACKED UP!" },
  { file: "go-all-the-way.wav", label: "GO ALL THE WAY!" },
  { file: "touchdown-Green Bay Packers (Bang on the Drum).mp3", label: "PACKERS TD", team: "packers" },
  { file: "touchdown-Chicago Bears.mp3", label: "BEARS TD", team: "bears" },
  { file: "touchdown-Buffalo Bills.mp3", label: "BILLS TD", team: "bills" },
  { file: "touchdown-Kansas City Chiefs.mp3", label: "CHIEFS TD", team: "chiefs" },
  { file: "chiefs-fight-for-your-right.mp3", label: "CHIEFS FIGHT FOR YOUR RIGHT", team: "chiefs", hasAlbumArt: true },
  { file: "chiefs-red-kingdom.mp3", label: "CHIEFS RED KINGDOM", team: "chiefs", hasAlbumArt: true },
  { file: "chiefs-rock-and-roll.mp4", label: "CHIEFS ROCK AND ROLL", team: "chiefs", hasAlbumArt: true },
  { file: "chiefs-swag-surfin.mp3", label: "CHIEFS SWAG SURFIN", team: "chiefs", hasAlbumArt: true }
];

export default function Home() {
  // Get initial team from URL hash or default
  const getInitialTeam = () => {
    if (typeof window === 'undefined') return 'default';
    const hash = window.location.hash.slice(1);
    return (hash in TEAMS) ? hash as keyof typeof TEAMS : 'default';
  };

  const [selectedTeam, setSelectedTeam] = useState<keyof typeof TEAMS>(getInitialTeam);
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const currentTeam = TEAMS[selectedTeam];

  // Update URL hash when team changes
  useEffect(() => {
    if (selectedTeam === 'default') {
      window.location.hash = '';
    } else {
      window.location.hash = selectedTeam;
    }
  }, [selectedTeam]);

  // Handle hash change from browser navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash in TEAMS) {
        setSelectedTeam(hash as keyof typeof TEAMS);
        // Stop any playing sound
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
          setPlayingSound(null);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle team selection
  const handleTeamChange = (team: keyof typeof TEAMS) => {
    setSelectedTeam(team);
    // Stop any playing sound
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setPlayingSound(null);
    }
  };

  // Filter sounds based on team selection
  const teamSounds = ALL_SOUNDS.filter(sound => sound.team === selectedTeam);
  const otherSounds = ALL_SOUNDS.filter(sound => !sound.team);
  const sounds = [...teamSounds, ...otherSounds];

  return (
    <div 
      className="min-h-screen bg-[#000033] p-2 relative"
      style={{
        backgroundImage: 'url(/images/AmFBfield.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="mb-4 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 p-2">
            FOOTBALL GUY SOUNDBOARD
          </h1>
          
          {/* Team Selector */}
          <select
            value={selectedTeam}
            onChange={(e) => handleTeamChange(e.target.value as keyof typeof TEAMS)}
            className="
              mt-2
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-w-4xl mx-auto">
          {sounds.map((sound) => (
            <SoundButton 
              key={sound.file} 
              file={sound.file}
              label={sound.label}
              isCurrentlyPlaying={playingSound === sound.file}
              onPlayStateChange={(isPlaying) => {
                setPlayingSound(isPlaying ? sound.file : null);
              }}
              className={sound.team ? `bg-gradient-to-b ${currentTeam.primaryColor}` : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Sound Button Component
function SoundButton({ 
  file, 
  label,
  isCurrentlyPlaying,
  onPlayStateChange,
  className = "bg-gradient-to-b from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800 active:from-blue-800 active:to-blue-950"
}: { 
  file: string; 
  label: string;
  isCurrentlyPlaying: boolean;
  onPlayStateChange: (isPlaying: boolean) => void;
  className?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [albumArtUrl, setAlbumArtUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio(`/sounds/${file}`);
      audioRef.current = audio;

      // Try to get album art once audio metadata is loaded
      audio.addEventListener('loadedmetadata', () => {
        const artUrl = getAlbumArt(audio);
        if (artUrl) {
          setAlbumArtUrl(artUrl);
        }
      });
    }
  }, [file]);

  // Split label into words for potential line breaks
  const words = label.split(' ');
  let displayText = label;
  let textSize = 'text-base';

  // Determine text layout based on content
  if (words.length > 2) {
    // For more than 2 words, split into lines
    const firstHalf = words.slice(0, Math.ceil(words.length / 2)).join(' ');
    const secondHalf = words.slice(Math.ceil(words.length / 2)).join(' ');
    displayText = `${firstHalf}\n${secondHalf}`;
    textSize = 'text-sm';
  }

  // Further reduce text size if needed
  if (label.length > 15) textSize = 'text-sm';
  if (label.length > 20) textSize = 'text-xs';
  if (label.length > 30) textSize = 'text-[10px]';

  const handleClick = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(`/sounds/${file}`);
      audioRef.current.addEventListener('ended', () => {
        onPlayStateChange(false);
      });
    }

    if (isCurrentlyPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      onPlayStateChange(false);
    } else {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      audioRef.current.play().catch(console.error);
      currentAudio = audioRef.current;
      onPlayStateChange(true);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        aspect-square
        p-1.5
        text-white 
        font-bold 
        border-4 
        border-gray-600 
        ${albumArtUrl ? '' : className}
        ${isCurrentlyPlaying ? 'border-yellow-400 scale-95' : ''}
        rounded-lg 
        shadow-lg
        transition-all
        hover:scale-105
        active:scale-95
        flex
        items-center
        justify-center
        relative
        overflow-hidden
      `}
      style={albumArtUrl ? {
        backgroundImage: `url(${albumArtUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : undefined}
    >
      {albumArtUrl && <div className="absolute inset-0 bg-black/40" />}
      <span className={`
        text-center 
        ${textSize}
        leading-tight
        whitespace-pre-line
        relative
        z-10
      `}>
        {displayText}
      </span>
    </button>
  );
}
