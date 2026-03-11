export type SeasonalStructure = {
  seasons: SeasonDefinition[];
};

export type SeasonDefinition = {
  name: string;
  startMonth: number; // 0-indexed, 0 = Jan
  endMonth: number;   // 0-indexed
};

export type TimeBlockType = 'yearly' | 'seasonal' | 'monthly';

export type TimeBlock = {
  id: string;
  type: TimeBlockType;
  year: number;
  periodIndex: number; // month (0-11) or season index
  content: string;
  updatedAt: string;
  userId: string;
};

export type TaskType = 'day' | 'week';

export type Task = {
  id: string;
  type: TaskType;
  date: string; // ISO date string
  content: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export type AppConfig = {
  id: string;
  seasonalStructure: SeasonalStructure;
  createdAt: string;
  userId: string;
};
