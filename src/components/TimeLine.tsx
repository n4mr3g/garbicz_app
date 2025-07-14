import React, { useState, useRef, useEffect } from 'react';
import { Stage, Performance } from '../types';

interface TimelineProps {
  stages: Stage[];
  currentTime: Date;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const BASE_BLOCK_WIDTH = 100; // px per hour at zoom=1

// Helper to parse "HH:mm" time string into minutes since midnight
function timeToMinutes(time: string): number {
  return Number(time.split(':')[0]) * 60 + Number(time.split(':')[1]);
}

// Get minutes difference between two times (as strings)
function diffMinutes(start: string, end: string): number {
  return timeToMinutes(end) - timeToMinutes(start);
}

export default function Timeline({ stages, currentTime }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoomLevel, setZoomLevel] = useState(1);
  const lastDistanceRef = useRef<number | null>(null);

  // Handle pinch zoom
  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      const d = getDistance(
        e.touches[0] as unknown as Touch,
        e.touches[1] as unknown as Touch,
      );
      lastDistanceRef.current = d;
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2 && lastDistanceRef.current !== null) {
      const d = getDistance(
        e.touches[0] as unknown as Touch,
        e.touches[1] as unknown as Touch,
      );
      const delta = d - lastDistanceRef.current;
      // Adjust zoom level by fraction of distance change
      const zoomChange = delta / 200; // tweak sensitivity here
      setZoomLevel((z) => {
        let newZoom = z + zoomChange;
        if (newZoom < MIN_ZOOM) newZoom = MIN_ZOOM;
        if (newZoom > MAX_ZOOM) newZoom = MAX_ZOOM;
        return newZoom;
      });
      lastDistanceRef.current = d;
      e.preventDefault(); // prevent page scroll while zooming
    }
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (e.touches.length < 2) {
      lastDistanceRef.current = null;
    }
  }

  // Compute timeline start/end to define width (e.g., 15:00 to 06:00 next day)
  // For simplicity, we take min start and max end time across all stages for current day.
  // You might want to improve for multi-day or overnight schedules.
  let earliest = 24 * 60; // minutes
  let latest = 0;
  for (const stage of stages) {
    for (const [day, performances] of Object.entries(stage.schedule)) {
      for (const perf of performances) {
        const m = timeToMinutes(perf.time);
        if (m < earliest) earliest = m;
        if (m > latest) latest = m;
      }
    }
  }
  if (earliest > latest) latest += 24 * 60; // cross midnight

  const timelineWidth =
    ((latest - earliest) / 60) * BASE_BLOCK_WIDTH * zoomLevel;

  return (
    <div
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        border: '1px solid #ccc',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        position: 'relative',
      }}
    >
      {/* Time ruler */}
      <div
        style={{
          display: 'flex',
          position: 'sticky',
          top: 0,
          background: '#fff',
          zIndex: 10,
          borderBottom: '1px solid #ccc',
          width: timelineWidth,
        }}
      >
        {/* show hours */}
        {Array.from(
          { length: Math.ceil((latest - earliest) / 60) + 1 },
          (_, i) => {
            const hour = Math.floor((earliest / 60 + i) % 24);
            return (
              <div
                key={i}
                style={{
                  width: BASE_BLOCK_WIDTH * zoomLevel,
                  textAlign: 'center',
                  fontSize: 12,
                  borderRight: '1px solid #eee',
                  boxSizing: 'border-box',
                }}
              >
                {hour.toString().padStart(2, '0')}:00
              </div>
            );
          },
        )}
      </div>

      {/* Stages container */}
      <div
        style={{ display: 'flex', flexDirection: 'row', width: timelineWidth }}
      >
        {stages.map((stage) => (
          <div
            key={stage.name}
            style={{
              flexShrink: 0,
              minWidth: 150,
              borderLeft: '1px solid #ddd',
              marginRight: 10,
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                fontWeight: 'bold',
                padding: 5,
                borderBottom: '1px solid #ccc',
                position: 'sticky',
                top: 0,
                backgroundColor: '#fafafa',
                zIndex: 5,
              }}
            >
              {stage.name}
            </div>
            {/* Schedule for all days (for demo simplicity, show all days one after another) */}
            {Object.entries(stage.schedule).map(([day, performances]) => (
              <div key={day} style={{ padding: '5px 0', fontSize: 12 }}>
                <div
                  style={{
                    fontWeight: '600',
                    marginBottom: 4,
                    color: '#555',
                  }}
                >
                  {day}
                </div>
                <div style={{ position: 'relative', height: 50 }}>
                  {performances.map((perf, i) => {
                    let startM = timeToMinutes(perf.time);
                    if (startM < earliest) startM += 24 * 60; // cross midnight fix
                    // Compute width as duration — assuming fixed 1.5h slots or until next perf:
                    let endM = startM + 90; // fallback duration 90 min
                    if (i + 1 < performances.length) {
                      let nextM = timeToMinutes(performances[i + 1].time);
                      if (nextM <= startM) nextM += 24 * 60;
                      endM = nextM;
                    }
                    const left =
                      ((startM - earliest) / 60) * BASE_BLOCK_WIDTH * zoomLevel;
                    const width =
                      ((endM - startM) / 60) * BASE_BLOCK_WIDTH * zoomLevel;

                    return (
                      <div
                        key={i}
                        title={`${perf.artist} @ ${perf.time}`}
                        style={{
                          position: 'absolute',
                          left,
                          width,
                          height: 30,
                          lineHeight: '30px',
                          backgroundColor: '#007bff',
                          color: '#fff',
                          padding: '0 6px',
                          borderRadius: 4,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: 14,
                        }}
                      >
                        {perf.artist}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Calculate distance between two touches
function getDistance(t1: Touch, t2: Touch): number {
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
}
