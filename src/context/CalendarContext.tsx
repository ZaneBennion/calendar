'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Task, TimeBlock, TaskType, TimeBlockType } from '@/types';
import { getTimeBlocksForYear, getTasks, upsertTimeBlock, createTask, updateTask, deleteTask as apiDeleteTask } from '@/lib/api';

interface CalendarContextType {
  tasks: Task[];
  goals: TimeBlock[];
  loading: boolean;
  refreshData: (year: number, startDate: string, endDate: string) => Promise<void>;
  addGoal: (goal: Omit<TimeBlock, 'id' | 'updatedAt' | 'userId'>) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshData = useCallback(async (year: number, startDate: string, endDate: string) => {
    setLoading(true);
    try {
      const [fetchedGoals, dayTasks, weekTasks] = await Promise.all([
        getTimeBlocksForYear(year),
        getTasks('day', startDate, endDate),
        getTasks('week', startDate, endDate)
      ]);
      setGoals(fetchedGoals);
      setTasks([...dayTasks, ...weekTasks]);
    } catch (error) {
      console.error('Error refreshing calendar data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addGoal = async (goalData: Omit<TimeBlock, 'id' | 'updatedAt' | 'userId'>) => {
    const newGoal = await upsertTimeBlock(goalData);
    if (newGoal) {
      setGoals(prev => {
        const filtered = prev.filter(g => 
          !(g.type === goalData.type && g.year === goalData.year && g.periodIndex === goalData.periodIndex)
        );
        return [...filtered, newGoal];
      });
    }
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    const newTask = await createTask(taskData);
    if (newTask) {
      setTasks(prev => [...prev, newTask]);
    }
  };

  const updateTaskStatus = async (id: string, isCompleted: boolean) => {
    const success = await updateTask(id, { isCompleted });
    if (success) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted } : t));
    }
  };

  const updateTaskContent = async (id: string, content: string) => {
    const success = await updateTask(id, { content });
    if (success) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, content } : t));
    }
  };

  const updateTaskGeneral = async (id: string, updates: Partial<Task>) => {
    const success = await updateTask(id, updates);
    if (success) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }
  };

  const deleteTask = async (id: string) => {
    const success = await apiDeleteTask(id);
    if (success) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <CalendarContext.Provider value={{
      tasks,
      goals,
      loading,
      refreshData,
      addGoal,
      addTask,
      updateTaskStatus,
      updateTaskContent,
      updateTask: updateTaskGeneral,
      deleteTask
    }}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
}
