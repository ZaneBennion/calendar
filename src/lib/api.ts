import { supabase } from './supabase';
import { AppConfig, TimeBlock, TimeBlockType, SeasonalStructure } from '../types';
import { DEFAULT_SEASONAL_STRUCTURE } from './seasons';

/**
 * App Configuration
 */
export async function getAppConfig(): Promise<AppConfig | null> {
  const { data, error } = await supabase
    .from('app_config')
    .select('*')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No config found, create a default one
      return createDefaultAppConfig();
    }
    console.error('Error fetching app config:', error);
    return null;
  }

  return {
    id: data.id,
    seasonalStructure: data.seasonal_structure as SeasonalStructure,
    createdAt: data.created_at,
  };
}

async function createDefaultAppConfig(): Promise<AppConfig | null> {
  const { data, error } = await supabase
    .from('app_config')
    .insert({
      seasonal_structure: DEFAULT_SEASONAL_STRUCTURE,
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
  };
}

export async function updateAppConfig(structure: SeasonalStructure): Promise<boolean> {
  const { error } = await supabase
    .from('app_config')
    .update({
      seasonal_structure: structure,
    })
    .eq('id', (await getAppConfig())?.id);

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
  const { data, error } = await supabase
    .from('time_blocks')
    .select('*')
    .match({ type, year, period_index: periodIndex })
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
  };
}

export async function upsertTimeBlock(
  block: Omit<TimeBlock, 'id' | 'updatedAt'>
): Promise<TimeBlock | null> {
  const { data, error } = await supabase
    .from('time_blocks')
    .upsert(
      {
        type: block.type,
        year: block.year,
        period_index: block.periodIndex,
        content: block.content,
      },
      { onConflict: 'type, year, period_index' }
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
  };
}
