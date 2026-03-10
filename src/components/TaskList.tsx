'use client';

import { useState } from 'react';
import { TaskType } from '@/types';
import { useCalendar } from '@/context/CalendarContext';
import TaskItem from './TaskItem';
import styles from './TaskList.module.css';

interface TaskListProps {
  type: TaskType;
  date: string; // ISO date string
  title?: string;
  className?: string;
}

export default function TaskList({ type, date, title, className }: TaskListProps) {
  const { tasks, addTask, loading } = useCalendar();
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');

  // Filter tasks for this specific list
  const listTasks = tasks.filter(t => t.type === type && t.date === date);

  const handleAddTask = async () => {
    if (!newContent.trim()) {
      setIsAdding(false);
      return;
    }
    
    await addTask({
      type,
      date,
      content: newContent,
      isCompleted: false
    });
    
    setNewContent('');
    setIsAdding(false);
  };

  return (
    <div className={`${styles.taskList} ${className || ''}`}>
      {title && <h3 className={styles.listTitle}>{title}</h3>}
      
      <div className={styles.items}>
        {listTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
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
      
      {!loading && listTasks.length === 0 && !isAdding && (
        <p className={styles.emptyText}>No tasks for this {type === 'day' ? 'day' : 'week'}.</p>
      )}
    </div>
  );
}
