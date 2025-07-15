import React, { useRef, useEffect, useState } from 'react';
import { Stage, TimelineProps } from '../types';
import './Timeline.css'; // You'll need to create this file

const HOUR_WIDTH = 100; // px per hour (adjustable for zooming)
const TIMELINE_START = 0; // midnight
const TIMELINE_END = 30; // hours (up to 06:00 Monday)

function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h + m / 60;
}

function getDayOffset(day: string): number {
  const days = ['THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY', 'MONDAY'];
  return days.indexOf(day.toUpperCase()) * 24;
}

const Timeline: React.FC<TimelineProps> = ({ stages, liked, onToggleLike }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Optional auto-scroll to current time
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;
    containerRef.current?.scrollTo({
      left: (hour + getDayOffset('FRIDAY')) * HOUR_WIDTH - 100,
      behavior: 'smooth',
    });
  }, []);

  return (
    <div className='timeline-container' ref={containerRef}>
      <div
        className='timeline-grid'
        style={{
          width: (TIMELINE_END - TIMELINE_START) * HOUR_WIDTH,
          gridTemplateRows: `repeat(${stages.length}, auto)`,
        }}
      >
        {/* Time markers */}
        {Array.from({ length: TIMELINE_END - TIMELINE_START + 1 }, (_, i) => (
          <div
            key={`hour-${i}`}
            className='timeline-hour'
            style={{ left: i * HOUR_WIDTH }}
          >
            {String(i % 24).padStart(2, '0')}:00
          </div>
        ))}

        {/* Stage labels and blocks */}
        {stages.map((stage, stageIndex) => (
          <div
            key={stage.name}
            className='timeline-stage-row'
            style={{ top: stageIndex * 80 }}
          >
            <div className='stage-label'>{stage.name}</div>
            {Object.entries(stage.schedule).flatMap(([day, performances]) =>
              performances.map((perf) => {
                const start = parseTime(perf.time) + getDayOffset(day);
                const width = 1.5 * HOUR_WIDTH; // TEMP: fake duration for now (1.5h)
                return (
                  <div
                    key={`${stage.name}-${day}-${perf.time}-${perf.artist}`}
                    className={`performance-block ${
                      liked.includes(perf.artist) ? 'liked' : ''
                    }`}
                    style={{
                      left: start * HOUR_WIDTH,
                      width,
                      top: 0,
                    }}
                    onClick={() => onToggleLike(perf.artist)}
                  >
                    {perf.artist}
                  </div>
                );
              }),
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
