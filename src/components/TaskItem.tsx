'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { useCalendar } from '@/context/CalendarContext';
import styles from './TaskItem.module.css';

interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  const { updateTaskStatus, updateTaskContent, deleteTask } = useCalendar();
  const [isEditing, setIsEditing] = useState(false);
  const [tempContent, setTempContent] = useState(task.content);

  // Sync temp content if task changes externally
  useEffect(() => {
    if (!isEditing) {
      setTempContent(task.content);
    }
  }, [task.content, isEditing]);

  const handleToggle = async () => {
    await updateTaskStatus(task.id, !task.isCompleted);
  };

  const handleSave = async () => {
    if (tempContent.trim() !== task.content) {
      await updateTaskContent(task.id, tempContent);
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm('Delete this task?')) {
      await deleteTask(task.id);
    }
  };

  return (
    <div className={`${styles.taskItem} ${task.isCompleted ? styles.completed : ''}`}>
      <button 
        className={`${styles.checkbox} ${task.isCompleted ? styles.checked : ''}`} 
        onClick={handleToggle}
      />
      
      {isEditing ? (
        <input
          type="text"
          className={styles.editInput}
          value={tempContent}
          onChange={(e) => setTempContent(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          autoFocus
        />
      ) : (
        <span className={styles.content} onClick={() => setIsEditing(true)}>
          {task.content}
        </span>
      )}

      <button className={styles.deleteBtn} onClick={handleDelete}>×</button>
    </div>
  );
}
