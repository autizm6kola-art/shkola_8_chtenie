

import React, { useEffect, useState, useCallback } from 'react';
import Task from './Task';
import {
  clearAnswersByIds,
  getUserInputs
} from '../utils/storage';
import '../styles/tasksPage.css';
import DailyProgress from "./DailyProgress";

function TasksPage({
  tasks,
  goBack,
  rangeIndex,
  totalRanges,
  goToPrev,
  goToNext
}) {
  const [correctWordCount, setCorrectWordCount] = useState(0);
  const [totalWordCount, setTotalWordCount] = useState(0);

  const recalcProgress = useCallback(() => {
    let total = 0;
    let correct = 0;

    tasks.forEach(task => {
      const words = task.content.filter(item => item.type === 'word');
      total += words.length;

      const saved = getUserInputs(task.id);
      if (saved && Array.isArray(saved[0])) {
        correct += saved[0].length;
      }
    });

    setCorrectWordCount(correct);
    setTotalWordCount(total);
  }, [tasks]);

  useEffect(() => {
    recalcProgress();

    const handleProgressUpdate = () => {
      recalcProgress();
    };

    window.addEventListener('progressUpdated', handleProgressUpdate);
    return () => {
      window.removeEventListener('progressUpdated', handleProgressUpdate);
    };
  }, [recalcProgress]);

  const handleReset = () => {
    const taskIds = tasks.map(t => t.id);
    clearAnswersByIds(taskIds);
    window.location.reload();
  };

  const percentRead =
    totalWordCount > 0
      ? Math.round((correctWordCount / totalWordCount) * 100)
      : 0;

  return (
    <div className="task-container">
      

      {/* Верхняя панель: навигация + назад */}
      <div className="task-top-controls">
        {/* ◀ ▶ навигация слева */}
      {/* Назад к выбору справа */}
        <button
          onClick={goBack}
          className="back-to-menu"
        >
          ← Назад к выбору
        </button>


        <div className="page-navigation">
          <button
            className="nav-button"
            onClick={goToPrev}
            disabled={rangeIndex === 0}
          >
            ◀
          </button>

          <span className="page-indicator">
            {rangeIndex + 1} / {totalRanges}
          </span>

          <button
            className="nav-button"
            onClick={goToNext}
            disabled={rangeIndex === totalRanges - 1}
          >
            ▶
          </button>
        </div>

        
      </div>

      <div className="percent-bar-wrapper">
        <p>
          <strong className="task-strong">
            ЦЕЛЬ:  ЦЕЛЬ: 50%  📅 Прочитано: {correctWordCount} из {totalWordCount} ({percentRead}%) 
          </strong>
          <DailyProgress />
        </p>

        <div className="percent-bar">
          <div
            className="percent-bar-fill"
            style={{ width: `${percentRead}%` }}
          />
        </div>
      </div>

      <hr />

      <div className="task-grid">
        {tasks.map(task => (
          <div className="task-item" key={task.id}>
            <Task task={task} />
          </div>
        ))}
      </div>

        <div className="task-top-controls">
        {/* ◀ ▶ навигация слева */}
      {/* Назад к выбору справа */}
        <button
          onClick={goBack}
          className="back-to-menu"
        >
          ← Назад к выбору
        </button>


        <div className="page-navigation">
          <button
            className="nav-button"
            onClick={goToPrev}
            disabled={rangeIndex === 0}
          >
            ◀
          </button>

          <span className="page-indicator">
            {rangeIndex + 1} / {totalRanges}
          </span>

          <button
            className="nav-button"
            onClick={goToNext}
            disabled={rangeIndex === totalRanges - 1}
          >
            ▶
          </button>
        </div>

        
      </div>


      <div className="reset-button-contaner">
        <button onClick={handleReset} className="reset-button">
          Сбросить прочитанное
        </button>
      </div>
    </div>
  );
}

export default TasksPage;
