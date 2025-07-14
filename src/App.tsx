import React, { useEffect, useState } from 'react';
import { FestivalData, Stage, Performance } from './types';
import NowPlaying from './components/NowPlaying';
import LikedArtists from './components/LikedArtists';
import FullSchedule from './components/FullSchedule';

const DATA_URL = '/festival_schedule.json';

export default function App() {
  const [data, setData] = useState<FestivalData | null>(null);
  const [liked, setLiked] = useState<string[]>(() => {
    const saved = localStorage.getItem('likedArtists');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetch(DATA_URL)
      .then((res) => res.json())
      .then((data) => {
        console.log('Fetched data:', data); // 👈 Add this
        setData(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    localStorage.setItem('likedArtists', JSON.stringify(liked));
  }, [liked]);

  function toggleLike(artistId: string) {
    setLiked((prev) =>
      prev.includes(artistId)
        ? prev.filter((a) => a !== artistId)
        : [...prev, artistId],
    );
  }

  if (!data) return <div>Loading...</div>;

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
      <NowPlaying
        stages={data.stages}
        liked={liked}
        onToggleLike={toggleLike}
      />
      <hr style={{ margin: '2rem 0' }} />
      <LikedArtists
        liked={liked}
        stages={data.stages}
        onToggleLike={toggleLike}
      />
      <hr style={{ margin: '2rem 0' }} />
      <FullSchedule stages={data.stages} />
    </div>
  );
}
