'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, TaskType } from '@/types';
import { getTasks, createTask } from '@/lib/api';
import TaskItem from './TaskItem';
import styles from './TaskList.module.css';

interface TaskListProps {
  type: TaskType;
  date: string; // ISO date string
  title?: string;
  className?: string;
}

export default function TaskList({ type, date, title, className }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    const data = await getTasks(type, date, date);
    setTasks(data);
    setIsLoading(false);
  }, [type, date]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = async () => {
    if (!newContent.trim()) {
      setIsAdding(false);
      return;
    }
    
    await createTask({
      type,
      date,
      content: newContent,
      isCompleted: false
    });
    
    setNewContent('');
    setIsAdding(false);
    fetchTasks();
  };

  return (
    <div className={`${styles.taskList} ${className || ''}`}>
      {title && <h3 className={styles.listTitle}>{title}</h3>}
      
      <div className={styles.items}>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onUpdate={fetchTasks}
            onDelete={fetchTasks}
          />
        ))}
        
        {isAdding ? (
          <div className={styles.addItemBox}>
            <input
              type="text"
              className={styles.addInput}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              onBlur={handleAddTask}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              autoFocus
              placeholder="Enter task..."
            />
          </div>
        ) : (
          <div className={styles.dashedBox} onClick={() => setIsAdding(true)}>
            + Add {type === 'day' ? 'Task' : 'Weekly Task'}
          </div>
        )}
      </div>
      
      {!isLoading && tasks.length === 0 && !isAdding && (
        <p className={styles.emptyText}>No tasks for this {type === 'day' ? 'day' : 'week'}.</p>
      )}
    </div>
  );
}
