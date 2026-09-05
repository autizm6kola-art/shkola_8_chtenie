
import React, { useState, useEffect } from 'react';
import MenuPage from './components/MenuPage';
import TasksPageWrapper from './components/TasksPageWrapper';

function App() {
  const [allTasks, setAllTasks] = useState([]);
  const [selectedRange, setSelectedRange] = useState(null);

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/tasks_chtenie_panda.json')
      .then(res => res.json())
      .then(data => setAllTasks(data))
      .catch(console.error);
  }, []);

  const handleSelectRange = (range) => {
    setSelectedRange(range);
  };

  const handleGoBack = () => {
    setSelectedRange(null);
  };

  if (allTasks.length === 0) {
    return <div>Загрузка заданий...</div>;
  }

  return (
    <div>
      {selectedRange === null ? (
        <MenuPage
          allTasks={allTasks}
          onSelectRange={handleSelectRange}
        />
      ) : (
        <TasksPageWrapper
          allTasks={allTasks}
          selectedRange={selectedRange}
          setSelectedRange={setSelectedRange}
          goBack={handleGoBack}
        />
      )}
    </div>
  );
}

export default App;
