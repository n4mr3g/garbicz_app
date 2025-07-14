import React, { useEffect, useState } from 'react';
import { FestivalData } from './types';
import NowPlaying from './components/NowPlaying';
import LikedArtists from './components/LikedArtists';
import FullSchedule from './components/FullSchedule';
import Timeline from './components/TimeLine';

const DATA_URL = '/festival_schedule.json';

export default function App() {
  const [data, setData] = useState<FestivalData | null>(null);
  const [liked, setLiked] = useState<string[]>(() => {
    const saved = localStorage.getItem('likedArtists');
    return saved ? JSON.parse(saved) : [];
  });
  const [view, setView] = useState<'now' | 'liked' | 'full' | 'timeline'>(
    'now',
  );

  useEffect(() => {
    fetch(DATA_URL)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    localStorage.setItem('likedArtists', JSON.stringify(liked));
  }, [liked]);

  function toggleLike(artist: string) {
    setLiked((prev) =>
      prev.includes(artist)
        ? prev.filter((a) => a !== artist)
        : [...prev, artist],
    );
  }

  if (!data) return <div>Loading festival data...</div>;

  return (
    <div
      style={{
        maxWidth: 700,
        margin: 'auto',
        padding: 20,
        fontFamily: 'sans-serif',
      }}
    >
      <h1>{data.festival_name}</h1>

      <nav style={{ marginBottom: 20 }}>
        <button onClick={() => setView('now')} disabled={view === 'now'}>
          Now Playing
        </button>{' '}
        <button onClick={() => setView('liked')} disabled={view === 'liked'}>
          Liked Artists
        </button>{' '}
        <button onClick={() => setView('full')} disabled={view === 'full'}>
          Full Schedule
        </button>{' '}
        <button
          onClick={() => setView('timeline')}
          disabled={view === 'timeline'}
        >
          Timeline
        </button>
      </nav>

      {view === 'now' && (
        <NowPlaying
          stages={data.stages}
          liked={liked}
          onToggleLike={toggleLike}
        />
      )}

      {view === 'liked' && (
        <LikedArtists
          liked={liked}
          stages={data.stages}
          onToggleLike={toggleLike}
        />
      )}

      {view === 'full' && <FullSchedule stages={data.stages} />}

      {view === 'timeline' && (
        <Timeline stages={data.stages} currentTime={new Date()} />
      )}
    </div>
  );
}
