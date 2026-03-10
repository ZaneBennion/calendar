'use client';

import { useState } from 'react';
import { TimeBlockType } from '@/types';
import { useCalendar } from '@/context/CalendarContext';
import styles from './GoalItem.module.css';

interface GoalItemProps {
  type: TimeBlockType;
  year: number;
  periodIndex: number;
  label?: string;
  className?: string;
}

export default function GoalItem({ type, year, periodIndex, label, className }: GoalItemProps) {
  const { goals, addGoal, loading } = useCalendar();
  const [isEditing, setIsEditing] = useState(false);

  // Find the goal in context
  const goal = goals.find(g => 
    g.type === type && g.year === year && g.periodIndex === periodIndex
  );
  
  const [tempContent, setTempContent] = useState(goal?.content || '');

  // Update temp content when goal changes in context (if not editing)
  const currentContent = isEditing ? tempContent : (goal?.content || '');

  const handleSave = async () => {
    await addGoal({
      type,
      year,
      periodIndex,
      content: tempContent
    });
    setIsEditing(false);
  };

  const handleStartEditing = () => {
    setTempContent(goal?.content || '');
    setIsEditing(true);
  };

  if (loading && !goal) return <div className={styles.loading}>...</div>;

  return (
    <div className={`${styles.goalItem} ${className || ''}`}>
      {label && <h3 className={styles.label}>{label}</h3>}
      
      {isEditing ? (
        <div className={styles.editMode}>
          <textarea
            className={styles.textarea}
            value={tempContent}
            onChange={(e) => setTempContent(e.target.value)}
            onBlur={handleSave}
            autoFocus
            placeholder="Set a goal..."
          />
        </div>
      ) : (
        <div 
          className={currentContent ? styles.content : styles.placeholder}
          onClick={handleStartEditing}
        >
          {currentContent || `+ Set ${type} goal`}
        </div>
      )}
    </div>
  );
}
