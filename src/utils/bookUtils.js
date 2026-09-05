

// Загружаем JSON с книгой
export const loadBook = async () => {
  const response = await fetch("/data/book.json");
  if (!response.ok) {
    throw new Error("Не удалось загрузить книгу");
  }
  const data = await response.json();
  return data.pages || [];
};

// Получаем следующую страницу по номеру
export const getNextPage = (book, lastTitle = null) => {
  if (lastTitle == null) {
    return book[0];
  }
  const index = book.findIndex(item => item.title === lastTitle.toString());
  return book[index + 1] || null;
};

// Сохраняем прогресс
export const saveProgress = (title) => {
  localStorage.setItem("readingProgress", title.toString());
};

// Загружаем прогресс
export const loadProgress = () => {
  const saved = localStorage.getItem("readingProgress");
  return saved ? saved.toString() : null;
};

// 🎤 Создание распознавания речи
export function createSpeechRecognizer({ onResult, onEnd }) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Ваш браузер не поддерживает распознавание речи.");
    return null;
  }

  const recognizer = new SpeechRecognition();
  recognizer.lang = "ru-RU";
  recognizer.continuous = true;
  recognizer.interimResults = true;

  recognizer.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map(result => result[0].transcript)
      .join(' ')
      .trim();

    if (transcript && onResult) {
      onResult(transcript);
    }
  };

  recognizer.onend = () => {
    if (onEnd) onEnd();
  };

  return recognizer;
}
