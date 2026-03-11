'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';
import { AppConfig, SeasonalStructure } from '@/types';
import { getAppConfig } from '@/lib/api';
import { DEFAULT_SEASONAL_STRUCTURE, getSeasonForMonth, getMonthsInSeason } from '@/lib/seasons';
import { getWeeksInMonth, getStartOfWeek, getDaysInWeek, formatDateISO, getWeekNumber } from '@/lib/date-utils';
import TaskList from '@/components/TaskList';
import GoalItem from '@/components/GoalItem';
import { getSeasonIndexForMonth } from '@/lib/seasons';
import { useCalendar } from '@/context/CalendarContext';

type Horizon = 'YEAR' | 'SEASON' | 'MONTH' | 'WEEK' | 'DAY';

export default function Home() {
  const [currentHorizon, setCurrentHorizon] = useState<Horizon>('DAY');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const { refreshData } = useCalendar();
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        const data = await getAppConfig();
        setConfig(data);
        setLoadingConfig(false);
      }
    }
    checkUser();
  }, [router]);

  useEffect(() => {
    if (loadingConfig) return;

    const year = currentDate.getFullYear();
    let start: Date;
    let end: Date;

    // Fetch a slightly wider range to cover view transitions
    switch (currentHorizon) {
      case 'YEAR':
        start = new Date(year, 0, 1);
        end = new Date(year, 11, 31);
        break;
      case 'SEASON': {
        const structure = config?.seasonalStructure || DEFAULT_SEASONAL_STRUCTURE;
        const season = getSeasonForMonth(currentDate.getMonth(), structure);
        if (season) {
          start = new Date(year, season.startMonth, 1);
          end = new Date(year, season.endMonth + 1, 0);
        } else {
          start = new Date(year, 0, 1);
          end = new Date(year, 11, 31);
        }
        break;
      }
      case 'MONTH':
        start = new Date(year, currentDate.getMonth(), 1);
        end = new Date(year, currentDate.getMonth() + 1, 0);
        // Expand to include partial weeks
        start.setDate(start.getDate() - 7);
        end.setDate(end.getDate() + 7);
        break;
      case 'WEEK':
      case 'DAY':
        start = getStartOfWeek(currentDate);
        end = new Date(start);
        end.setDate(end.getDate() + 7);
        break;
      default:
        start = new Date(year, 0, 1);
        end = new Date(year, 11, 31);
    }

    refreshData(year, formatDateISO(start), formatDateISO(end));
  }, [currentDate, currentHorizon, loadingConfig, config, refreshData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loadingConfig) {
    return <div className={styles.container}>Loading...</div>;
  }

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
        <div className={styles.navLinks}>
          {horizons.map((h) => (
            <button
              key={h}
              className={`${styles.navButton} ${currentHorizon === h ? styles.navButtonActive : ''}`}
              onClick={() => setCurrentHorizon(h)}
            >
              {h}
            </button>
          ))}
        </div>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
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
  const year = currentDate.getFullYear();

  return (
    <div className={styles.twoColumnLayout}>
      <div className={styles.leftColumn}>
        <GoalItem 
          type="yearly" 
          year={year} 
          periodIndex={0} 
          label="North Star Goal" 
          className={styles.horizonBox}
        />
      </div>

      <div className={styles.rightColumn}>
        <div className={styles.seasonsGrid}>
          {structure.seasons.map((season, idx) => (
            <div key={idx} className={styles.seasonCard}>
              <GoalItem
                type="seasonal"
                year={year}
                periodIndex={idx}
                label={season.name}
              />
              <p className={styles.seasonMonths}>
                {new Date(0, season.startMonth).toLocaleString('default', { month: 'short' })} -{' '}
                {new Date(0, season.endMonth).toLocaleString('default', { month: 'short' })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SeasonView({ currentDate, config }: { currentDate: Date; config: AppConfig | null }) {
  const structure = config?.seasonalStructure || DEFAULT_SEASONAL_STRUCTURE;
  const year = currentDate.getFullYear();
  const season = getSeasonForMonth(currentDate.getMonth(), structure);
  const seasonIndex = season ? structure.seasons.indexOf(season) : 0;
  const months = season ? getMonthsInSeason(season) : [];

  return (
    <div className={styles.twoColumnLayout}>
      <div className={styles.leftColumn}>
        <GoalItem 
          type="yearly" 
          year={year} 
          periodIndex={0} 
          label="Yearly Goal" 
          className={styles.subBox}
        />

        <GoalItem
          type="seasonal"
          year={year}
          periodIndex={seasonIndex}
          label={`${season?.name} Goals`}
          className={styles.horizonBox}
        />
      </div>

      <div className={styles.rightColumn}>
        <div className={styles.monthsGrid}>
          {months.map((month) => (
            <div key={month} className={styles.monthCard}>
              <GoalItem
                type="monthly"
                year={year}
                periodIndex={month}
                label={new Date(0, month).toLocaleString('default', { month: 'long' })}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MonthView({ currentDate, config }: { currentDate: Date; config: AppConfig | null }) {
  const structure = config?.seasonalStructure || DEFAULT_SEASONAL_STRUCTURE;
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const season = getSeasonForMonth(month, structure);
  const seasonIndex = season ? structure.seasons.indexOf(season) : 0;
  
  return (
    <div className={styles.twoColumnLayout}>
      <div className={styles.leftColumn}>
        <GoalItem
          type="seasonal"
          year={year}
          periodIndex={seasonIndex}
          label={`Seasonal Goal (${season?.name})`}
          className={styles.subBox}
        />

        <GoalItem
          type="monthly"
          year={year}
          periodIndex={month}
          label="Monthly Goals"
          className={styles.horizonBox}
        />
      </div>

      <div className={styles.rightColumn}>
        <div className={styles.weeksGrid}>
          {getWeeksInMonth(year, month).map((weekStart, idx) => (
            <div key={weekStart.toISOString()} className={styles.weekCard}>
              <GoalItem
                type="weekly"
                year={weekStart.getFullYear()}
                periodIndex={getWeekNumber(weekStart)}
                label={`Week ${idx + 1} Goal`}
              />
              <TaskList
                type="week"
                date={formatDateISO(weekStart)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WeekView({ currentDate, config }: { currentDate: Date; config: AppConfig | null }) {
  const startOfWeek = getStartOfWeek(currentDate);
  const days = getDaysInWeek(startOfWeek);
  const startOfWeekISO = formatDateISO(startOfWeek);
  const weekNum = getWeekNumber(startOfWeek);
  const year = startOfWeek.getFullYear();

  return (
    <div className={styles.twoColumnLayout}>
      <div className={styles.leftColumn}>
        <GoalItem
          type="weekly"
          year={year}
          periodIndex={weekNum}
          label="Weekly Goal"
          className={styles.horizonBox}
        />

        <TaskList
          type="week"
          date={startOfWeekISO}
          title="Weekly Tasks"
          className={styles.subBox}
        />
      </div>

      <div className={styles.rightColumn}>
        <div className={styles.daysGrid}>
          {days.map((day) => (
            <div key={day.toISOString()} className={styles.dayCard}>
              <TaskList
                type="day"
                date={formatDateISO(day)}
                title={day.toLocaleDateString('default', { weekday: 'short', day: 'numeric' })}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DayView({ currentDate, config }: { currentDate: Date; config: AppConfig | null }) {
  const dateISO = formatDateISO(currentDate);
  const startOfWeek = getStartOfWeek(currentDate);
  const startOfWeekISO = formatDateISO(startOfWeek);
  const weekNum = getWeekNumber(startOfWeek);

  return (
    <div className={styles.twoColumnLayout}>
      <div className={styles.leftColumn}>
        <GoalItem
          type="weekly"
          year={startOfWeek.getFullYear()}
          periodIndex={weekNum}
          label="Weekly Goal"
          className={styles.subBox}
        />

        <TaskList
          type="week"
          date={startOfWeekISO}
          title="Weekly Tasks"
          className={styles.subBox}
        />
      </div>

      <div className={styles.rightColumn}>
        <div className={styles.horizonBox}>
          <TaskList
            type="day"
            date={dateISO}
            title="Tasks for Today"
          />
        </div>
      </div>
    </div>
  );
}
