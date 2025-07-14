import React from 'react';
import { Stage } from '../types';

interface Props {
  liked: string[];
  stages: Stage[];
  onToggleLike: (artistId: string) => void;
}

// Find artist info by ID string `${stageName}-${time}-${artist}`
function findArtistById(id: string, stages: Stage[]) {
  for (const stage of stages) {
    for (const day of Object.keys(stage.schedule)) {
      for (const perf of stage.schedule[day]) {
        const candidateId = `${stage.name}-${perf.time}-${perf.artist}`;
        if (candidateId === id) {
          return { stageName: stage.name, day, performance: perf };
        }
      }
    }
  }
  return null;
}

export default function LikedArtists({ liked, stages, onToggleLike }: Props) {
  if (liked.length === 0)
    return (
      <div>
        <h2>Liked Artists</h2>
        <p>No liked artists yet.</p>
      </div>
    );

  return (
    <div>
      <h2>Liked Artists</h2>
      <ul>
        {liked.map((id) => {
          const info = findArtistById(id, stages);
          if (!info) return null;
          const { stageName, day, performance } = info;
          return (
            <li key={id} style={{ marginBottom: 6 }}>
              {performance.artist} - <strong>{stageName}</strong> ({day}{' '}
              {performance.time})
              <button
                onClick={() => onToggleLike(id)}
                style={{
                  marginLeft: 10,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'red',
                  fontSize: 16,
                }}
                title='Remove from liked'
              >
                ×
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
