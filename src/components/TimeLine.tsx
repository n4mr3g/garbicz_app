import React, { useState, useRef } from 'react';
import { TimelineProps } from '../types';
import './Timeline.css';

const HOUR_WIDTH = 100;
const TIMELINE_START_DAY = 'WEDNESDAY';
const TIMELINE_START_HOUR = 15;
const TIMELINE_END = 96; // 4 days

const pixelsPerMinute = 2;

function timeToMinutes(dateTime: string): number {
  // dateTime is expected to be an ISO string like '2025-08-03T21:30:00'
  const d = new Date(dateTime);
  return d.getHours() * 60 + d.getMinutes();
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

// Calculate timelineStart in minutes from week start
const timelineStart =
  getDayOffset(TIMELINE_START_DAY) * 60 + TIMELINE_START_HOUR * 60;

export default function Timeline({
  stages,
  liked,
  onToggleLike,
}: TimelineProps) {
  // Days to show, starting from WEDNESDAY
  const days = [
    'WEDNESDAY 30/7',
    'THURSDAY 31/7',
    'FRIDAY 1/8',
    'SATURDAY 2/8',
    'SUNDAY 3/8',
    'MONDAY 4/8',
  ];

  // Hours and half-hours to show, starting from 15:00
  const hoursInFirstDay = 24 - TIMELINE_START_HOUR;
  const totalHours = hoursInFirstDay + (days.length - 1) * 24;
  const totalHalfHours = totalHours * 2;


  const [zoom, setZoom] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);
  const pinchState = useRef<{ initialDist: number; initialZoom: number } | null>(null);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5));
  const handleZoomReset = () => setZoom(1);

  // Pinch-to-zoom handlers
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      pinchState.current = { initialDist: dist, initialZoom: zoom };
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchState.current) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const { initialDist, initialZoom } = pinchState.current;
      if (initialDist > 0) {
        let newZoom = initialZoom * (dist / initialDist);
        newZoom = Math.max(0.5, Math.min(2, newZoom));
        setZoom(newZoom);
      }
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      pinchState.current = null;
    }
  };

  return (
    <div className='timeline-container'>
      <div style={{ marginBottom: 8 }}>
        <button onClick={handleZoomOut} style={{ marginRight: 4 }}>
          -
        </button>
        <button onClick={handleZoomReset} style={{ marginRight: 4 }}>
          Reset
        </button>
        <button onClick={handleZoomIn}>+</button>
        <span style={{ marginLeft: 12, fontSize: 12 }}>
          Zoom: {(zoom * 100).toFixed(0)}%
        </span>
      </div>
      <div className='timeline-scroll-wrapper'>
        <div
          ref={gridRef}
          className='timeline-grid-container'
          style={{
            display: 'grid',
            gridTemplateColumns: `150px repeat(${totalHalfHours}, 50px)`,
            transform: `scaleX(${zoom})`,
            transformOrigin: 'left top',
            ['--timeline-zoom' as any]: zoom,
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Header Row: Half-hour columns */}
          <div className='timeline-grid-stage-name timeline-no-zoom' />
          {Array.from({ length: totalHalfHours }, (_, idx) => {
            // Calculate which day and hour/half this column belongs to
            let hourIdx = Math.floor(idx / 2);
            let dayIdx = 0;
            let hourInDay = hourIdx + TIMELINE_START_HOUR;
            if (hourInDay >= 24) {
              dayIdx = Math.floor((hourIdx - hoursInFirstDay) / 24) + 1;
              hourInDay = (hourIdx - hoursInFirstDay) % 24;
            }
            const isFirstHourOfDay =
              hourIdx === 0 || (hourIdx === hoursInFirstDay && dayIdx > 0);
            const isFirstHalfOfHour = idx % 2 === 0;
            // Day label only at the first half-hour of each day
            const showDayLabel = isFirstHourOfDay && isFirstHalfOfHour;
            return (
              <div
                key={idx}
                className={`timeline-grid-hour-col${
                  isFirstHourOfDay && isFirstHalfOfHour
                    ? ' first-hour-of-day'
                    : ''
                }`}
                style={{
                  gridRow: 1,
                  gridColumn: idx + 2,
                  position: 'relative',
                }}
              >
                {showDayLabel && (
                  <div className='timeline-grid-day-label timeline-no-zoom'>
                    {days[dayIdx]}
                  </div>
                )}
                <div className='timeline-grid-hour timeline-no-zoom'>
                  {hourInDay.toString().padStart(2, '0')}
                  {isFirstHalfOfHour ? ':00' : ':30'}
                </div>
              </div>
            );
          })}

          {/* Timeline Rows */}
          {stages.map((stage, rowIdx) => (
            <React.Fragment key={stage.name}>
              <div
                className='timeline-grid-stage-name timeline-no-zoom'
                style={{ gridRow: rowIdx + 2, gridColumn: 1 }}
              >
                {stage.name}
              </div>
              {Array.from({ length: totalHalfHours }, (_, colIdx) => {
                // For each half-hour cell, check if a performance block should start here
                let cellStartMinutes = colIdx * 30;
                let cellAbsoluteMinutes = timelineStart + cellStartMinutes;
                // Find a performance that starts in this cell
                let found: any = null;
                Object.entries(stage.schedule).forEach(
                  ([day, performances]) => {
                    performances.forEach((perf, i) => {
                      // Use start-time from JSON schema
                      if (!perf['start-time']) return;
                      const perfStart =
                        getDayOffset(day) * 60 +
                        timeToMinutes(perf['start-time']);
                      if (perfStart === cellAbsoluteMinutes) {
                        found = perf;
                        found.day = day;
                        found.index = i;
                        found.performances = performances;
                      }
                    });
                  },
                );
                if (!found) {
                  // Empty cell
                  return (
                    <div
                      key={colIdx}
                      className='timeline-grid-cell'
                      style={{ gridRow: rowIdx + 2, gridColumn: colIdx + 2 }}
                    />
                  );
                }
                // Calculate duration from JSON schema if available
                let duration = 90;
                if (
                  found &&
                  typeof found.duration === 'number' &&
                  found.duration > 0
                ) {
                  duration = found.duration;
                } else if (found && found['end-time'] && found['start-time']) {
                  // fallback: calculate from end-time and start-time
                  const start = new Date(found['start-time']);
                  const end = new Date(found['end-time']);
                  duration = (end.getTime() - start.getTime()) / 60000;
                } else if (
                  found &&
                  found.performances &&
                  typeof found.index === 'number'
                ) {
                  // fallback: next act's start time
                  const i = found.index;
                  const performances = found.performances;
                  if (i < performances.length - 1) {
                    const nextPerf = performances[i + 1];
                    if (nextPerf['start-time'] && found['start-time']) {
                      const start = new Date(found['start-time']);
                      const nextStart = new Date(nextPerf['start-time']);
                      duration =
                        (nextStart.getTime() - start.getTime()) / 60000;
                    }
                  }
                }
                const halfHours = Math.ceil(duration / 30);
                return (
                  <div
                    key={colIdx}
                    className={`performance-block${
                      found && liked.includes(found.artist) ? ' liked' : ''
                    }`}
                    style={{
                      gridRow: rowIdx + 2,
                      gridColumn: colIdx + 2,
                      gridColumnEnd: `span ${halfHours}`,
                      position: 'relative',
                      zIndex: 2,
                    }}
                    onClick={() => found && onToggleLike(found.artist)}
                  >
                    <span className='timeline-no-zoom'>
                      {found && found.artist}
                    </span>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
