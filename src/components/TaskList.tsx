'use client';

import { useState } from 'react';
import { TaskType } from '@/types';
import { useCalendar } from '@/context/CalendarContext';
import TaskItem from './TaskItem';
import TaskModal from './TaskModal';
import styles from './TaskList.module.css';

interface TaskListProps {
  type: TaskType;
  date: string; // ISO date string
  title?: string;
  className?: string;
}

export default function TaskList({ type, date, title, className }: TaskListProps) {
  const { tasks, loading } = useCalendar();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter tasks for this specific list
  const listTasks = tasks.filter(t => t.type === type && t.date === date);

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
        
        <div className={styles.dashedBox} onClick={() => setIsModalOpen(true)}>
          + Add {type === 'day' ? 'Task' : 'Weekly Task'}
        </div>
      </div>
      
      {!loading && listTasks.length === 0 && !isModalOpen && (
        <p className={styles.emptyText}>No tasks for this {type === 'day' ? 'day' : 'week'}.</p>
      )}

      {isModalOpen && (
        <TaskModal
          initialData={{ type, date }}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
