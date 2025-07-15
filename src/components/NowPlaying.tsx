import React from 'react';
import type { Stage } from '../types';

type Props = {
  stages: Stage[];
  liked: string[];
  onToggleLike: (artist: string) => void;
};

function getCurrentDayAndTime() {
  // For now, hardcode or get current day/time as string 'THURSDAY', '18:00', etc.
  // Replace this with your logic later
  return { day: 'THURSDAY', time: '19:00' };
}

export default function NowPlaying({ stages, liked, onToggleLike }: Props) {
  const { day, time } = getCurrentDayAndTime();

  // Find currently playing artists by checking slots with time <= now < next slot
  // For simplicity, just find slots on day and show all artists in those slots (you can improve later)

  return (
    <div>
      <h2>Who's playing now? ({day})</h2>
      {stages.map((stage) => {
        const slots = stage.schedule[day] || [];
        return (
          <div key={stage.name}>
            <h3>{stage.name}</h3>
            {slots.length === 0 && <div>No events today.</div>}
            {slots.map(({ time: slotTime, artist }, idx) => (
              <div
                key={idx}
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <span>
                  {slotTime} — {artist}
                </span>
                <button
                  onClick={() => onToggleLike(artist)}
                  style={{
                    backgroundColor: liked.includes(artist) ? 'green' : 'gray',
                    color: 'white',
                    border: 'none',
                    padding: '2px 6px',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  {liked.includes(artist) ? 'Liked' : 'Like'}
                </button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
