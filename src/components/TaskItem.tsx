'use client';

import { useState } from 'react';
import { Task } from '@/types';
import { useCalendar } from '@/context/CalendarContext';
import TaskModal from './TaskModal';
import styles from './TaskItem.module.css';

interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  const { updateTaskStatus } = useCalendar();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await updateTaskStatus(task.id, !task.isCompleted);
  };

  return (
    <>
      <div 
        className={`${styles.taskItem} ${task.isCompleted ? styles.completed : ''}`}
        onClick={() => setIsModalOpen(true)}
      >
        <button 
          className={`${styles.checkbox} ${task.isCompleted ? styles.checked : ''}`} 
          onClick={handleToggle}
        />
        
        <span className={styles.content}>
          {task.content}
        </span>
      </div>

      {isModalOpen && (
        <TaskModal 
          task={task} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
}
