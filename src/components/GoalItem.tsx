'use client';

import { useState, useEffect, useCallback } from 'react';
import { TimeBlockType } from '@/types';
import { getTimeBlock, upsertTimeBlock } from '@/lib/api';
import styles from './GoalItem.module.css';

interface GoalItemProps {
  type: TimeBlockType;
  year: number;
  periodIndex: number;
  label?: string;
  className?: string;
}

export default function GoalItem({ type, year, periodIndex, label, className }: GoalItemProps) {
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGoal = useCallback(async () => {
    setIsLoading(true);
    const goal = await getTimeBlock(type, year, periodIndex);
    setContent(goal?.content || '');
    setIsLoading(false);
  }, [type, year, periodIndex]);

  useEffect(() => {
    fetchGoal();
  }, [fetchGoal]);

  const handleSave = async () => {
    await upsertTimeBlock({
      type,
      year,
      periodIndex,
      content
    });
    setIsEditing(false);
  };

  if (isLoading) return <div className={styles.loading}>...</div>;

  return (
    <div className={`${styles.goalItem} ${className || ''}`}>
      {label && <h3 className={styles.label}>{label}</h3>}
      
      {isEditing ? (
        <div className={styles.editMode}>
          <textarea
            className={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            autoFocus
            placeholder="Set a goal..."
          />
        </div>
      ) : (
        <div 
          className={content ? styles.content : styles.placeholder}
          onClick={() => setIsEditing(true)}
        >
          {content || `+ Set ${type} goal`}
        </div>
      )}
    </div>
  );
}
