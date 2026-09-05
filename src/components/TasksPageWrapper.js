import React, { useMemo } from 'react';

import TasksPage from './TasksPage';


function TasksPageWrapper({
  allTasks,
  selectedRange,
  setSelectedRange,
  goBack
}) {

  // =====================================================
  // Теперь каждый task = отдельный пункт
  //
  // Никаких диапазонов 1-3, 4-6 и т.д.
  // =====================================================

  const currentTask = useMemo(() => {

    return allTasks.find(
      task =>
        task.id.toString() === selectedRange.toString()
    );

  }, [allTasks, selectedRange]);


  // =====================================================
  // Если пункт не найден
  // =====================================================

  if (!currentTask) {

    return (
      <div>
        Пункт не найден
      </div>
    );

  }


  // =====================================================
  // Индекс текущего пункта
  // =====================================================

  const currentIndex = allTasks.findIndex(
    task => task.id === currentTask.id
  );


  // =====================================================
  // Предыдущий пункт
  // =====================================================

  const goToPrev = () => {

    if (currentIndex > 0) {

      const previousTask =
        allTasks[currentIndex - 1];

      setSelectedRange(
        previousTask.id.toString()
      );

    }

  };


  // =====================================================
  // Следующий пункт
  // =====================================================

  const goToNext = () => {

    if (
      currentIndex <
      allTasks.length - 1
    ) {

      const nextTask =
        allTasks[currentIndex + 1];

      setSelectedRange(
        nextTask.id.toString()
      );

    }

  };


  return (

    <TasksPage

      // 👇 ВАЖНО
      // Передаём только один пункт
      tasks={[currentTask]}

      goBack={goBack}

      rangeIndex={currentIndex}

      totalRanges={allTasks.length}

      goToPrev={goToPrev}

      goToNext={goToNext}

    />

  );

}


export default TasksPageWrapper;