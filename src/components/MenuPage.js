import React, { useEffect, useState } from 'react';

import { clearAllAnswers, getUserInputs } from '../utils/storage';

import BackButton from './BackButton';
import ProgressBar from './ProgressBar';
import BackupControls from './BackupControls';
import DailyProgress from "./DailyProgress";

import '../styles/menuPage.css';


function MenuPage({ allTasks, onSelectRange }) {

  const [correctWordsCount, setCorrectWordsCount] = useState(0);
  const [totalWords, setTotalWords] = useState(0);

  // Прогресс каждого отдельного пункта
  const [tasksProgress, setTasksProgress] = useState({});


  useEffect(() => {

    let total = 0;
    let correct = 0;

    const newTasksProgress = {};


    allTasks.forEach(task => {

      // Все слова этого пункта
      const words = task.content.filter(
        item => item.type === 'word'
      );

      const taskTotal = words.length;

      total += taskTotal;


      // Сохранённые прочитанные слова
      const savedInputs = getUserInputs(task.id);

      let taskCorrect = 0;

      if (
        savedInputs &&
        Array.isArray(savedInputs[0])
      ) {
        taskCorrect = savedInputs[0].length;
        correct += taskCorrect;
      }


      // Сохраняем прогресс конкретного пункта
      newTasksProgress[task.id] = {
        correct: taskCorrect,
        total: taskTotal
      };

    });


    setTotalWords(total);
    setCorrectWordsCount(correct);

    setTasksProgress(newTasksProgress);

  }, [allTasks]);


  // =====================================================
  // Цвет кнопки по прогрессу
  // =====================================================

  const getButtonColor = (correct, total) => {

    if (correct === 0) {
      return 'lightgray';
    }

    if (correct === total) {
      return '#1ae63cc3';
    }

    return '#fef60091';
  };


  // =====================================================
  // Общий процент
  // =====================================================

  const percentRead =
    totalWords > 0
      ? Math.round(
          (correctWordsCount / totalWords) * 100
        )
      : 0;


  // =====================================================
  // Процент конкретного пункта
  // =====================================================

  const getTaskProgressPercent = (correct, total) => {

    return total > 0
      ? Math.round(
          (correct / total) * 100
        )
      : 0;

  };


  return (

    <div className="menu-container">

      <BackButton />


      <h1 className="menu-title">
        ЧТЕНИЕ
      </h1>


      <DailyProgress />


      <ProgressBar
        correct={correctWordsCount}
        total={totalWords}
      />


      <p className="menu-progress-text">
        Прочитано слов: {correctWordsCount} из {totalWords} ({percentRead}%)
      </p>


      {/* =================================================
          КНОПКИ ПУНКТОВ
          ================================================= */}

      <div className="range-buttons-wrapper">

        {allTasks.map((task, index) => {

          const progress =
            tasksProgress[task.id] || {
              correct: 0,
              total: 0
            };


          const btnColor = getButtonColor(
            progress.correct,
            progress.total
          );


          const progressPercent =
            getTaskProgressPercent(
              progress.correct,
              progress.total
            );


          return (

            <button
              key={task.id}
              className="range-button"
              style={{
                backgroundColor: btnColor
              }}
              onClick={() =>
                onSelectRange(task.id.toString())
              }
            >

              <span>
                {task.title}
              </span>

              <span>
                . ({progress.total} сл.
              </span>

              <span>
                , {progressPercent}%)
              </span>

            </button>

          );

        })}

      </div>


      {/* =================================================
          СБРОС
          ================================================= */}

      <div className="reset-button-contaner">

        <BackupControls />

      </div>
      <div className="reset-button-contaner">

        <button
          className="reset-button"
          onClick={() => {

            clearAllAnswers();

            window.location.reload();

          }}
        >

          Сбросить все ответы

        </button>

      </div>



    </div>

  );

}

export default MenuPage;