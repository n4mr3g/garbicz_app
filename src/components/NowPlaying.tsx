import React from 'react';
import { Stage, Performance } from '../types';

interface Props {
  stages: Stage[];
  liked: string[];
  onToggleLike: (artistId: string) => void;
}

// Utility: get current day string like "THURSDAY"
function getCurrentDay(): string {
  const days = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ];
  const now = new Date();
  return days[now.getDay()] || '';
}

// Utility: convert "HH:mm" to minutes since midnight
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// Find the artist playing right now on a stage
function getNowPlaying(schedule: {
  [day: string]: Performance[];
}): Performance | null {
  const day = getCurrentDay();
  const performances = schedule[day];
  if (!performances || performances.length === 0) return null;

  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  for (let i = 0; i < performances.length; i++) {
    const start = timeToMinutes(performances[i].time);
    const end =
      i + 1 < performances.length
        ? timeToMinutes(performances[i + 1].time)
        : start + 120;
    if (nowMins >= start && nowMins < end) {
      return performances[i];
    }
  }
  return null;
}

export default function NowPlaying({ stages, liked, onToggleLike }: Props) {
  const day = getCurrentDay();

  return (
    <div>
      <h2>Who's playing now? ({day})</h2>
      {stages.map((stage) => {
        const performance = getNowPlaying(stage.schedule);
        if (!performance) return null;
        const artistId = `${stage.name}-${performance.time}-${performance.artist}`;
        const isLiked = liked.includes(artistId);

        return (
          <div key={stage.name} style={{ marginBottom: 12 }}>
            <strong>{stage.name}:</strong> {performance.artist} (
            {performance.time})
            <button
              onClick={() => onToggleLike(artistId)}
              style={{
                marginLeft: 10,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isLiked ? 'red' : 'grey',
                fontSize: 18,
              }}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              {isLiked ? '❤️' : '🤍'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
