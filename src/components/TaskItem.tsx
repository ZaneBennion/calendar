'use client';

import { useState } from 'react';
import { Task } from '@/types';
import { updateTask, deleteTask } from '@/lib/api';
import styles from './TaskItem.module.css';

interface TaskItemProps {
  task: Task;
  onUpdate: () => void;
  onDelete: () => void;
}

export default function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(task.content);

  const handleToggle = async () => {
    await updateTask(task.id, { isCompleted: !task.isCompleted });
    onUpdate();
  };

  const handleSave = async () => {
    if (content.trim() !== task.content) {
      await updateTask(task.id, { content });
    }
    setIsEditing(false);
    onUpdate();
  };

  const handleDelete = async () => {
    if (confirm('Delete this task?')) {
      await deleteTask(task.id);
      onDelete();
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
          value={content}
          onChange={(e) => setContent(e.target.value)}
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
