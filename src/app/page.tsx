'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { AppConfig, SeasonalStructure } from '@/types';
import { getAppConfig } from '@/lib/api';
import { DEFAULT_SEASONAL_STRUCTURE, getSeasonForMonth, getMonthsInSeason } from '@/lib/seasons';
import { getWeeksInMonth, getStartOfWeek, getDaysInWeek } from '@/lib/date-utils';

type Horizon = 'YEAR' | 'SEASON' | 'MONTH' | 'WEEK' | 'DAY';

export default function Home() {
  const [currentHorizon, setCurrentHorizon] = useState<Horizon>('DAY');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    async function loadConfig() {
      const data = await getAppConfig();
      setConfig(data);
    }
    loadConfig();
  }, []);

  const navigateTime = (direction: 'PREV' | 'NEXT') => {
    const newDate = new Date(currentDate);
    const multiplier = direction === 'PREV' ? -1 : 1;

    switch (currentHorizon) {
      case 'YEAR':
        newDate.setFullYear(currentDate.getFullYear() + multiplier);
        break;
      case 'SEASON': {
        const structure = config?.seasonalStructure || DEFAULT_SEASONAL_STRUCTURE;
        const currentSeason = getSeasonForMonth(currentDate.getMonth(), structure);
        if (currentSeason) {
          // Find next season start
          if (direction === 'NEXT') {
            newDate.setMonth(currentSeason.endMonth + 1);
          } else {
            newDate.setMonth(currentSeason.startMonth - 1);
          }
        } else {
          newDate.setMonth(currentDate.getMonth() + multiplier * 3);
        }
        break;
      }
      case 'MONTH':
        newDate.setMonth(currentDate.getMonth() + multiplier);
        break;
      case 'WEEK':
        newDate.setDate(currentDate.getDate() + multiplier * 7);
        break;
      case 'DAY':
        newDate.setDate(currentDate.getDate() + multiplier);
        break;
    }
    setCurrentDate(newDate);
  };

  const getHeaderTitle = () => {
    switch (currentHorizon) {
      case 'YEAR':
        return currentDate.getFullYear().toString();
      case 'SEASON': {
        const structure = config?.seasonalStructure || DEFAULT_SEASONAL_STRUCTURE;
        const season = getSeasonForMonth(currentDate.getMonth(), structure);
        return `${season?.name || 'Season'} ${currentDate.getFullYear()}`;
      }
      case 'MONTH':
        return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
      case 'WEEK': {
        // Just show month and year for now, maybe add week number
        return `Week of ${currentDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })}`;
      }
      case 'DAY':
        return currentDate.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const horizons: Horizon[] = ['YEAR', 'SEASON', 'MONTH', 'WEEK', 'DAY'];

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        {horizons.map((h) => (
          <button
            key={h}
            className={`${styles.navButton} ${currentHorizon === h ? styles.navButtonActive : ''}`}
            onClick={() => setCurrentHorizon(h)}
          >
            {h}
          </button>
        ))}
      </nav>

      <header className={styles.header}>
        <button className={styles.actionButton} onClick={() => navigateTime('PREV')}>
          &lt;
        </button>
        <h1 className={styles.headerTitle}>{getHeaderTitle()}</h1>
        <button className={styles.actionButton} onClick={() => navigateTime('NEXT')}>
          &gt;
        </button>
      </header>

      <main className={styles.content}>
        {currentHorizon === 'YEAR' && <YearView currentDate={currentDate} config={config} />}
        {currentHorizon === 'SEASON' && <SeasonView currentDate={currentDate} config={config} />}
        {currentHorizon === 'MONTH' && <MonthView currentDate={currentDate} config={config} />}
        {currentHorizon === 'WEEK' && <WeekView currentDate={currentDate} config={config} />}
        {currentHorizon === 'DAY' && <DayView currentDate={currentDate} config={config} />}
      </main>
    </div>
  );
}

function YearView({ currentDate, config }: { currentDate: Date; config: AppConfig | null }) {
  const structure = config?.seasonalStructure || DEFAULT_SEASONAL_STRUCTURE;

  return (
    <div className={styles.content}>
      {/* Yearly Goal */}
      <div className={styles.horizonBox}>
        <h2 className={styles.horizonTitle}>North Star Goal</h2>
        <div className={styles.dashedBox}>+ Set North Star Goal</div>
      </div>

      {/* Seasons Overview */}
      <div className={styles.seasonsGrid}>
        {structure.seasons.map((season, idx) => (
          <div key={idx} className={styles.seasonCard}>
            <h4 className={styles.seasonTitle}>{season.name}</h4>
            <p className={styles.seasonMonths}>
              {new Date(0, season.startMonth).toLocaleString('default', { month: 'short' })} -{' '}
              {new Date(0, season.endMonth).toLocaleString('default', { month: 'short' })}
            </p>
            <div className={styles.dashedBox}>+ Goal</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeasonView({ currentDate, config }: { currentDate: Date; config: AppConfig | null }) {
  const structure = config?.seasonalStructure || DEFAULT_SEASONAL_STRUCTURE;
  const season = getSeasonForMonth(currentDate.getMonth(), structure);
  const months = season ? getMonthsInSeason(season) : [];

  return (
    <div className={styles.content}>
      {/* Yearly Context */}
      <div className={styles.subBox}>
        <h3 className={styles.subTitle}>Yearly Goal</h3>
        <p className={styles.goalText}>No yearly goal set.</p>
      </div>

      {/* Seasonal Goal */}
      <div className={styles.horizonBox}>
        <h2 className={styles.horizonTitle}>{season?.name} Goals</h2>
        <div className={styles.dashedBox}>+ Add Seasonal Goal</div>
      </div>

      {/* Months in Season */}
      <div className={styles.monthsGrid}>
        {months.map((month) => (
          <div key={month} className={styles.monthCard}>
            <h4 className={styles.monthTitle}>
              {new Date(0, month).toLocaleString('default', { month: 'long' })}
            </h4>
            <div className={styles.dashedBox}>+ Goal</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthView({ currentDate, config }: { currentDate: Date; config: AppConfig | null }) {
  const structure = config?.seasonalStructure || DEFAULT_SEASONAL_STRUCTURE;
  const season = getSeasonForMonth(currentDate.getMonth(), structure);
  
  return (
    <div className={styles.content}>
      {/* Seasonal Context */}
      <div className={styles.subBox}>
        <h3 className={styles.subTitle}>Seasonal Goal ({season?.name})</h3>
        <p className={styles.goalText}>No goal set for this season.</p>
      </div>

      {/* Monthly Goal */}
      <div className={styles.horizonBox}>
        <h2 className={styles.horizonTitle}>Monthly Goals</h2>
        <div className={styles.dashedBox}>+ Add Monthly Goal</div>
      </div>

      {/* Weekly Overviews */}
      <div className={styles.weeksGrid}>
        {getWeeksInMonth(currentDate.getFullYear(), currentDate.getMonth()).map((weekStart, idx) => (
          <div key={weekStart.toISOString()} className={styles.weekCard}>
            <h4 className={styles.weekTitle}>Week {idx + 1}</h4>
            <div className={styles.dashedBox}>+ Add Weekly Goal</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeekView({ currentDate, config }: { currentDate: Date; config: AppConfig | null }) {
  const startOfWeek = getStartOfWeek(currentDate);
  const days = getDaysInWeek(startOfWeek);

  return (
    <div className={styles.content}>
      {/* Weekly Goal */}
      <div className={styles.horizonBox}>
        <h2 className={styles.horizonTitle}>Weekly Goal</h2>
        <div className={styles.dashedBox}>+ Add Weekly Goal</div>
      </div>

      {/* Weekly Tasks */}
      <div className={styles.subBox}>
        <h3 className={styles.subTitle}>Weekly Tasks</h3>
        <div className={styles.dashedBox}>+ Add Task to Week</div>
      </div>

      {/* Daily Tasks for the week */}
      <div className={styles.daysGrid}>
        {days.map((day) => (
          <div key={day.toISOString()} className={styles.dayCard}>
            <h4 className={styles.dayTitle}>
              {day.toLocaleDateString('default', { weekday: 'short', day: 'numeric' })}
            </h4>
            <div className={styles.dashedBox}>+ Task</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DayView({ currentDate, config }: { currentDate: Date; config: AppConfig | null }) {
  return (
    <div className={styles.content}>
      {/* Weekly Context */}
      <div className={styles.subBox}>
        <h3 className={styles.subTitle}>Weekly Goal</h3>
        <p className={styles.goalText}>No weekly goal set.</p>
      </div>

      {/* Daily Tasks */}
      <div className={styles.horizonBox}>
        <h2 className={styles.horizonTitle}>Tasks for Today</h2>
        <div className={styles.dashedBox}>+ Add Daily Task</div>
      </div>
    </div>
  );
}
