export interface Performance {
  time: string;
  artist: string;
}

export interface Schedule {
  [day: string]: Performance[];
}

export type ScheduleSlot = {
  time: string;
  artist: string;
};

export interface Stage {
  name: string;
  description: string;
  schedule: Schedule;
}

export interface FestivalData {
  festival_name: string;
  stages: Stage[];
}
