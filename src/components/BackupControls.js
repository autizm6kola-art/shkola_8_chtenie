import React from 'react';
import { exportProgress, importProgress } from '../utils/storage';

function BackupControls() {
  const handleExport = () => {
    const data = exportProgress();

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: 'application/json' }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shkola_8_chtenie_backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        importProgress(data);
        window.location.reload();
      } catch (err) {
        alert('Ошибка загрузки файла');
        console.error(err);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div style={{ marginTop: '1px' }}>
      <button className="reset-button" onClick={handleExport}>
        Сохранить
      </button>

      <label className="reset-button" style={{ marginLeft: '10px' }}>
        Загрузить
        <input
          type="file"
          accept="application/json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
}

export default BackupControls;
