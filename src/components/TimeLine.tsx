import React from 'react';
import { TimelineProps } from '../types';
import './Timeline.css';

const HOUR_WIDTH = 100;
const TIMELINE_START = 0;
const TIMELINE_END = 96; // 4 days

const pixelsPerMinute = 2;
const timelineStart = 0;

function timeToMinutes(time: string): number {
  const [hourStr, minuteStr] = time.split(':');
  return parseInt(hourStr) * 60 + parseInt(minuteStr || '0');
}

function getDayOffset(day: string): number {
  const days = [
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
    'MONDAY',
  ];

  return days.indexOf(day.toUpperCase()) * 24;
}

export default function Timeline({
  stages,
  liked,
  onToggleLike,
}: TimelineProps) {
  return (
    <div className='timeline-scroll-wrapper'>
      <div className='timeline-grid-container'>
        {/* Header Row */}
        <div className='timeline-grid-header'>
          <div className='timeline-grid-stage-name' />
          {Array.from({ length: TIMELINE_END - TIMELINE_START }, (_, i) => (
            <div className='timeline-grid-hour' key={i}>
              {(TIMELINE_START + i).toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Timeline Rows */}
        {stages.map((stage) => (
          <div className='timeline-grid-row' key={stage.name}>
            <div className='timeline-grid-stage-name'>{stage.name}</div>
            <div className='timeline-grid-row-content'>
              {Object.entries(stage.schedule).flatMap(([day, performances]) =>
                performances.map((perf, i) => {
                  const start = timeToMinutes(perf.time);
                  const duration = 90;
                  const left =
                    (getDayOffset(day) * 60 + start - timelineStart) *
                    pixelsPerMinute;
                  const width = duration * pixelsPerMinute;

                  return (
                    <div
                      key={i}
                      className={`performance-block ${
                        liked.includes(perf.artist) ? 'liked' : ''
                      }`}
                      style={{ left, width }}
                      onClick={() => onToggleLike(perf.artist)}
                    >
                      {perf.artist}
                    </div>
                  );
                }),
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
