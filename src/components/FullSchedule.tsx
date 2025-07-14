import React from 'react';
import type { Stage, ScheduleSlot } from '../types';

type Props = {
  stages: Stage[];
};

const FullSchedule: React.FC<Props> = ({ stages }) => {
  return (
    <div className='mt-8'>
      <h2 className='text-2xl font-bold mb-4'>Full Schedule</h2>
      {stages.map((stage) => (
        <div key={stage.name} className='mb-6'>
          <h3 className='text-xl font-semibold mb-2'>{stage.name}</h3>
          <p className='text-sm mb-2 text-gray-400'>{stage.description}</p>
          {Object.entries(stage.schedule).map(([day, slots]) => {
            const scheduleSlots = slots as ScheduleSlot[];
            return (
              <div key={day} className='mb-2'>
                <h4 className='font-bold'>{day}</h4>
                <ul className='ml-4 list-disc'>
                  {scheduleSlots.map((slot, idx) => (
                    <li key={idx}>
                      {slot.time} – {slot.artist}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default FullSchedule;
