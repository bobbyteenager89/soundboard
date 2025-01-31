'use client';

import { useState, useRef, useEffect } from 'react';

// Sound management
let currentAudio: HTMLAudioElement | null = null;

// Function to get album art URL from audio element
const getAlbumArt = (audio: HTMLAudioElement): string | null => {
  // We need to access non-standard properties, so we type it as unknown first
  const mediaElement = audio as unknown as {
    metadata?: {
      picture?: Array<{
        data: Uint8Array;
        format: string;
      }>;
    };
  };
  
  if (mediaElement.metadata?.picture?.length) {
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
    primaryColor: { start: "#1e40af", end: "#1e3a8a" },
  },
  packers: {
    name: "Green Bay Packers",
    primaryColor: { start: "#15803d", end: "#ca8a04" },
  },
  bears: {
    name: "Chicago Bears",
    primaryColor: { start: "#1e40af", end: "#ea580c" },
  },
  bills: {
    name: "Buffalo Bills",
    primaryColor: { start: "#1e40af", end: "#dc2626" },
  },
  chiefs: {
    name: "Kansas City Chiefs",
    primaryColor: { start: "#dc2626", end: "#ca8a04" },
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
    <div style={{
      minHeight: '100vh',
      padding: '8px',
      position: 'relative',
      backgroundImage: 'url(/images/AmFBfield.svg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
      {/* Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <header style={{ marginBottom: '16px', textAlign: 'center' }}>
          <h1 className="title">
            FOOTBALL GUY SOUNDBOARD
          </h1>
          
          {/* Team Selector */}
          <select
            value={selectedTeam}
            onChange={(e) => handleTeamChange(e.target.value as keyof typeof TEAMS)}
            className="team-selector"
          >
            {Object.entries(TEAMS).map(([key, team]) => (
              <option key={key} value={key}>
                {team.name}
              </option>
            ))}
          </select>
        </header>

        {/* Soundboard Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          maxWidth: '896px',
          margin: '0 auto',
        }}>
          {sounds.map((sound) => (
            <SoundButton 
              key={sound.file} 
              file={sound.file}
              label={sound.label}
              isCurrentlyPlaying={playingSound === sound.file}
              onPlayStateChange={(isPlaying) => {
                setPlayingSound(isPlaying ? sound.file : null);
              }}
              style={sound.team ? {
                background: `linear-gradient(to bottom, ${currentTeam.primaryColor.start}, ${currentTeam.primaryColor.end})`
              } : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Update SoundButton component
function SoundButton({ 
  file, 
  label,
  isCurrentlyPlaying,
  onPlayStateChange,
  style
}: { 
  file: string; 
  label: string;
  isCurrentlyPlaying: boolean;
  onPlayStateChange: (isPlaying: boolean) => void;
  style?: React.CSSProperties;
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
      className={`sound-button ${isCurrentlyPlaying ? 'playing' : ''}`}
      style={{
        ...style,
        ...(albumArtUrl ? {
          backgroundImage: `url(${albumArtUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {})
      }}
    >
      {albumArtUrl && <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)'
      }} />}
      <span style={{
        textAlign: 'center',
        fontSize: label.length > 30 ? '10px' : 
                 label.length > 20 ? '12px' : 
                 label.length > 15 ? '14px' : '16px',
        lineHeight: '1.2',
        whiteSpace: 'pre-line',
        position: 'relative',
        zIndex: 1
      }}>
        {displayText}
      </span>
    </button>
  );
}
