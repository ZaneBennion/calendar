'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Task, TaskType } from '@/types';
import { useCalendar } from '@/context/CalendarContext';
import { getStartOfWeek, formatDateISO } from '@/lib/date-utils';
import styles from './TaskModal.module.css';

interface TaskModalProps {
  task?: Task; // Optional: If provided, we are editing
  initialData?: {
    type: TaskType;
    date: string;
  };
  onClose: () => void;
}

export default function TaskModal({ task, initialData, onClose }: TaskModalProps) {
  const { updateTask, addTask, deleteTask } = useCalendar();
  const [content, setContent] = useState(task?.content || '');
  const [date, setDate] = useState(task?.date || initialData?.date || formatDateISO(new Date()));
  const [type, setType] = useState<TaskType>(task?.type || initialData?.type || 'day');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleSave = async () => {
    if (!content.trim()) return;

    let finalDate = date;
    if (type === 'week') {
      const d = new Date(date);
      const startOfWeek = getStartOfWeek(d);
      finalDate = formatDateISO(startOfWeek);
    }

    if (task) {
      // Edit mode
      await updateTask(task.id, {
        content,
        date: finalDate,
        type
      });
    } else {
      // Create mode
      await addTask({
        content,
        date: finalDate,
        type,
        isCompleted: false
      });
    }
    onClose();
  };

  const handleDelete = async () => {
    if (task && confirm('Delete this task?')) {
      await deleteTask(task.id);
      onClose();
    }
  };

  const modalContent = (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>{task ? 'Edit Task' : 'New Task'}</h2>
        
        <div className={styles.formGroup}>
          <label>Content</label>
          <input 
            type="text" 
            value={content} 
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
            placeholder="What needs to be done?"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as TaskType)}>
            <option value="day">Day Task</option>
            <option value="week">Week Task</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>{type === 'day' ? 'Date' : 'Week Start'}</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className={styles.actions}>
          {task && (
            <button className={`${styles.btn} ${styles.deleteBtn}`} onClick={handleDelete}>Delete</button>
          )}
          <button className={`${styles.btn} ${styles.cancelBtn}`} onClick={onClose}>Cancel</button>
          <button className={`${styles.btn} ${styles.saveBtn}`} onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(
    modalContent,
    document.getElementById('modal-root') || document.body
  );
}
