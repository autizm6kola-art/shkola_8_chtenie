

// ЧИТАЕТСЯ ПО ОДНОМУ СЛОВУ С СЕКУНДАМЕРОМ
import React, {
  useState,
  useEffect,
  useRef,
  useMemo
} from "react";

import styles from "../styles/ReadingPage.module.css";

import SentenceDisplay from "./SentenceDisplay";

import {
  saveCorrectInput,
  getUserInputs,
  saveUserInputs
} from "../utils/storage";

import { createSpeechRecognizer } from "../utils/bookUtils";

import { addTodayWords } from "../utils/dailyStats";

const APP_ID = "shkola_8_chtenie";

const LOCK_DELAY = 1300; // 2 секунды блокировки

function normalizeWord(word) {
  return word
    .toLowerCase()
    .replace(/[.,!?;:«»"()\r\n]/g, "")
    .trim();
}

function normalizeToArray(text) {
  return text
    .toLowerCase()
    .replace(/[.,!?;:«»"()\r\n]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

export default function ReadingTask({ task }) {

  // ======================================================
  // STATE
  // ======================================================

  const [highlightedIndexes, setHighlightedIndexes] = useState([]);
  const [activeWordIndex, setActiveWordIndex] = useState(null);
  const [isLocked, setIsLocked] = useState(false);

  // ======================================================
  // REFS
  // ======================================================

  const recognizerRef = useRef(null);
  const highlightedIndexesRef = useRef([]);
  const activeWordIndexRef = useRef(null);
  const contentRef = useRef(null);
  const taskIdRef = useRef(task.id);
  const totalWordsRef = useRef(0);
  const lockTimerRef = useRef(null);

  // ======================================================
  // CONTENT
  // ======================================================

  const content = useMemo(
    () => task.content || [],
    [task.content]
  );

  const totalWords = content.filter(
    item => item.type === "word"
  ).length;

  contentRef.current = content;
  taskIdRef.current = task.id;
  totalWordsRef.current = totalWords;

  // ======================================================
  // LOAD SAVED PROGRESS
  // ======================================================

  useEffect(() => {
    const saved = getUserInputs(task.id);
    if (saved?.[0]) {
      setHighlightedIndexes(saved[0]);
    }
  }, [task.id]);

  // ======================================================
  // СИНХРОНИЗАЦИЯ highlightedIndexes REF
  // ======================================================

  useEffect(() => {
    highlightedIndexesRef.current = highlightedIndexes;
  }, [highlightedIndexes]);

  // ======================================================
  // ОЧИСТКА ТАЙМЕРА ПРИ РАЗМОНТИРОВАНИИ
  // ======================================================

  useEffect(() => {
    return () => {
      if (lockTimerRef.current) {
        clearTimeout(lockTimerRef.current);
      }
    };
  }, []);

  // ======================================================
  // ОБРАБОТКА РЕЗУЛЬТАТА — только одно слово
  // ======================================================

  const handleResult = (transcript) => {
    const spokenWords = normalizeToArray(transcript);
    const idx = activeWordIndexRef.current;

    if (idx === null) return;

    const targetWord = normalizeWord(
      contentRef.current?.[idx]?.word || ""
    );

    if (spokenWords.includes(targetWord)) {

      const merged = [
        ...new Set([
          ...highlightedIndexesRef.current,
          idx
        ])
      ];

      setHighlightedIndexes(merged);
      saveUserInputs(taskIdRef.current, [merged]);
      addTodayWords(APP_ID, 1);

      setActiveWordIndex(null);
      activeWordIndexRef.current = null;

      try {
        recognizerRef.current?.stop();
      } catch (e) {}

      if (merged.length >= totalWordsRef.current / 2) {
        saveCorrectInput(taskIdRef.current, 0);
      }

      window.dispatchEvent(new Event("progressUpdated"));
    }
  };

  const handleResultRef = useRef(handleResult);
  handleResultRef.current = handleResult;

  // ======================================================
  // СОЗДАЁМ recognizer ОДИН РАЗ
  // ======================================================

  useEffect(() => {
    if (!recognizerRef.current) {
      recognizerRef.current = createSpeechRecognizer({
        onResult: (transcript) => {
          handleResultRef.current(transcript);
        },
        onEnd: () => {
          if (activeWordIndexRef.current !== null) {
            try {
              recognizerRef.current?.start();
            } catch (e) {
              console.log("restart blocked");
            }
          }
        }
      });
    }

    return () => {
      try {
        recognizerRef.current?.stop();
      } catch (e) {}
    };
  }, []);

  // ======================================================
  // НАЖАТИЕ НА СЛОВО — начать прослушивание
  // ======================================================

  const handleWordListen = (index) => {
    // если заблокировано — игнорируем нажатие
    if (isLocked) return;

    // блокируем на LOCK_DELAY миллисекунд
    setIsLocked(true);

    // очищаем предыдущий таймер, если был
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
    }

    // снимаем блокировку через 3 секунды
    lockTimerRef.current = setTimeout(() => {
      setIsLocked(false);
      lockTimerRef.current = null;
    }, LOCK_DELAY);

    activeWordIndexRef.current = index;
    setActiveWordIndex(index);

    try {
      recognizerRef.current?.start();
    } catch (e) {
      console.log("already started");
    }
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <SentenceDisplay
          content={content}
          paragraphs={task.paragraphs}
          highlightedIndexes={highlightedIndexes}
          onWordListen={handleWordListen}
          activeWordIndex={activeWordIndex}
          isLocked={isLocked}
        />
      </div>
    </div>
  );
}

