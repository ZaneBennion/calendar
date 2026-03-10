import { supabase } from './supabase';
import { AppConfig, TimeBlock, TimeBlockType, SeasonalStructure, TaskType, Task } from '../types';
import { DEFAULT_SEASONAL_STRUCTURE } from './seasons';

/**
 * App Configuration
 */
export async function getAppConfig(): Promise<AppConfig | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('app_config')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No config found, create a default one
      return createDefaultAppConfig(user.id);
    }
    console.error('Error fetching app config:', error);
    return null;
  }

  return {
    id: data.id,
    seasonalStructure: data.seasonal_structure as SeasonalStructure,
    createdAt: data.created_at,
    userId: data.user_id,
  };
}

async function createDefaultAppConfig(userId: string): Promise<AppConfig | null> {
  const { data, error } = await supabase
    .from('app_config')
    .insert({
      seasonal_structure: DEFAULT_SEASONAL_STRUCTURE,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating default app config:', error);
    return null;
  }

  return {
    id: data.id,
    seasonalStructure: data.seasonal_structure as SeasonalStructure,
    createdAt: data.created_at,
    userId: data.user_id,
  };
}

export async function updateAppConfig(structure: SeasonalStructure): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('app_config')
    .update({
      seasonal_structure: structure,
    })
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating app config:', error);
    return false;
  }
  return true;
}

/**
 * Time Blocks (Goals/Themes)
 */
export async function getTimeBlock(
  type: TimeBlockType,
  year: number,
  periodIndex: number
): Promise<TimeBlock | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('time_blocks')
    .select('*')
    .match({ type, year, period_index: periodIndex, user_id: user.id })
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching time block:', error);
    return null;
  }

  return {
    id: data.id,
    type: data.type,
    year: data.year,
    periodIndex: data.period_index,
    content: data.content,
    updatedAt: data.updated_at,
    userId: data.user_id,
  };
}

export async function upsertTimeBlock(
  block: Omit<TimeBlock, 'id' | 'updatedAt' | 'userId'>
): Promise<TimeBlock | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('time_blocks')
    .upsert(
      {
        type: block.type,
        year: block.year,
        period_index: block.periodIndex,
        content: block.content,
        user_id: user.id,
      },
      { onConflict: 'type, year, period_index, user_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error upserting time block:', error);
    return null;
  }

  return {
    id: data.id,
    type: data.type,
    year: data.year,
    periodIndex: data.period_index,
    content: data.content,
    updatedAt: data.updated_at,
    userId: data.user_id,
  };
}

/**
 * Tasks
 */
export async function getTasks(type: TaskType, startDate: string, endDate: string): Promise<Task[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('type', type)
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  return data.map((d) => ({
    id: d.id,
    type: d.type,
    date: d.date,
    content: d.content,
    isCompleted: d.is_completed,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
    userId: d.user_id,
  }));
}

export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Task | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      type: task.type,
      date: task.date,
      content: task.content,
      is_completed: task.isCompleted,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    return null;
  }

  return {
    id: data.id,
    type: data.type,
    date: data.date,
    content: data.content,
    isCompleted: data.is_completed,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    userId: data.user_id,
  };
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('tasks')
    .update({
      content: updates.content,
      is_completed: updates.isCompleted,
      date: updates.date,
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating task:', error);
    return false;
  }
  return true;
}

export async function deleteTask(id: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', user.id);
  if (error) {
    console.error('Error deleting task:', error);
    return false;
  }
  return true;
}
