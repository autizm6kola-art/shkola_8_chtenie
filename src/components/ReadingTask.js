import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
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

// ======================================================
// НОРМАЛИЗАЦИЯ
// ======================================================

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

  const [isListening, setIsListening] =
    useState(false);

  const [highlightedIndexes, setHighlightedIndexes] =
    useState([]);

  const [isStopped, setIsStopped] =
    useState(false);

  // 👇 индекс слова для дочитывания

  const [activeWordIndex, setActiveWordIndex] =
    useState(null);

  // ======================================================
  // REFS
  // ======================================================

  const recognizerRef =
    useRef(null);

  // 👇 ВАЖНО
  // хранит АКТУАЛЬНЫЕ highlighted слова

  const highlightedIndexesRef =
    useRef([]);

  const mediaRecorderRef =
    useRef(null);

  const recordedChunks =
    useRef([]);

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

  // ======================================================
  // LOAD SAVED PROGRESS
  // ======================================================

  useEffect(() => {

    const saved =
      getUserInputs(task.id);

    if (saved?.[0]) {

      setHighlightedIndexes(saved[0]);
    }

  }, [task.id]);

  // ======================================================
  // 👇 СИНХРОНИЗАЦИЯ REF
  // ======================================================

  useEffect(() => {

    highlightedIndexesRef.current =
      highlightedIndexes;

  }, [highlightedIndexes]);

  // ======================================================
  // ОБРАБОТКА РЕЗУЛЬТАТОВ SPEECH
  // ======================================================

  const handleResult = useCallback((transcript) => {

    const transcriptWords =
      normalizeToArray(transcript);

    // ==================================================
    // 🎤 РЕЖИМ ОДНОГО СЛОВА
    // ==================================================

    if (activeWordIndex !== null) {

      const targetWord =
        content[activeWordIndex]?.word
          ?.toLowerCase()
          .replace(/[.,!?;:«»"()\r\n]/g, "");

      if (
        transcriptWords.includes(targetWord)
      ) {

        const merged = [

          ...new Set([

            ...highlightedIndexesRef.current,

            activeWordIndex

          ])
        ];

        setHighlightedIndexes(merged);

        saveUserInputs(task.id, [merged]);

        addTodayWords(APP_ID, 1);

        // 👇 останавливаем recognizer

        try {

          recognizerRef.current?.stop();

        } catch (e) {}

        setIsListening(false);

        setActiveWordIndex(null);
      }

      return;
    }

    // ==================================================
    // 🎤 ОБЫЧНОЕ ЧТЕНИЕ ФРАЗЫ
    // ==================================================

    const availableTokens =
      [...transcriptWords];

    const newMatchedIndexes = [];

    content.forEach((item, index) => {

      if (item.type !== "word") return;

      const clean =
        item.word
          .toLowerCase()
          .replace(/[.,!?;:«»"()\r\n]/g, "");

      const foundIndex =
        availableTokens.findIndex(
          tok => tok === clean
        );

      if (foundIndex !== -1) {

        newMatchedIndexes.push(index);

        availableTokens.splice(foundIndex, 1);
      }
    });

    // ==================================================
    // merge старых и новых слов
    // ==================================================

    const merged = [

      ...new Set([

        ...highlightedIndexesRef.current,

        ...newMatchedIndexes

      ])
    ];

    // ==================================================
    // считаем только новые слова
    // ==================================================

    const trulyNew = merged.filter(
      index =>
        !highlightedIndexesRef.current
          .includes(index)
    );

    addTodayWords(
      APP_ID,
      trulyNew.length
    );

    setHighlightedIndexes(merged);

    saveUserInputs(task.id, [merged]);

    // ==================================================
    // прогресс
    // ==================================================

    if (merged.length >= totalWords / 2) {

      saveCorrectInput(task.id, 0);
    }

    window.dispatchEvent(
      new Event("progressUpdated")
    );

  }, [

    activeWordIndex,

    content,

    task.id,

    totalWords

  ]);

  // ======================================================
  // 🎤 СОЗДАЁМ recognizer ОДИН РАЗ
  // ======================================================

  useEffect(() => {

    if (!recognizerRef.current) {

      recognizerRef.current =
        createSpeechRecognizer({

          onResult: (transcript) => {

            handleResult(transcript);
          },

          onEnd: () => {

            // 👇 если listening ещё активно —
            // автоматически перезапускаем session

            if (isListening) {

              try {

                recognizerRef.current?.start();

              } catch (e) {

                console.log(
                  "restart blocked"
                );
              }
            }
          }
        });
    }

    // cleanup только при уходе
    // со страницы

    return () => {

      try {

        recognizerRef.current?.stop();

      } catch (e) {}
    };

  }, []);

  // ======================================================
  // 🔴 RECORDING
  // ======================================================

  const startRecording = async () => {

    recordedChunks.current = [];

    try {

      const stream =
        await navigator.mediaDevices
          .getUserMedia({
            audio: true
          });

      const mediaRecorder =
        new MediaRecorder(stream);

      mediaRecorderRef.current =
        mediaRecorder;

      mediaRecorder.ondataavailable =
        (event) => {

          if (event.data.size > 0) {

            recordedChunks.current
              .push(event.data);
          }
        };

      mediaRecorder.start();

    } catch (err) {

      console.error(err);

      alert(
        "Нет доступа к микрофону"
      );
    }
  };

  const stopRecording = () => {

    if (mediaRecorderRef.current) {

      mediaRecorderRef.current.stop();
    }
  };

  // ======================================================
  // ▶️ START
  // ======================================================

  // const handleStart = () => {

  //   setIsStopped(false);

  //   setActiveWordIndex(null);

  //   setIsListening(true);

  //   startRecording();

  //   try {

  //     recognizerRef.current?.start();

  //   } catch (e) {

  //     console.log(
  //       "already started"
  //     );
  //   }
  // };

  // ======================================================
  // ⏹ STOP
  // ======================================================

  // const handleStop = () => {

  //   setIsListening(false);

  //   setIsStopped(true);

  //   setActiveWordIndex(null);

  //   stopRecording();

  //   try {

  //     recognizerRef.current?.stop();

  //   } catch (e) {}
  // };

  // ======================================================
  // 🎤 ДОЧИТАТЬ ОДНО СЛОВО
  // ======================================================

  const handleWordListen = (index) => {

    setActiveWordIndex(index);

    setIsStopped(false);

    setIsListening(true);

    try {

      recognizerRef.current?.start();

    } catch (e) {

      console.log(
        "already started"
      );
    }
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (

    <div
      className={`
        ${styles.container}
        ${isStopped ? styles.completed : ""}
      `}
    >

      <div className={styles.row}>

        <SentenceDisplay
          content={content}
          paragraphs={task.paragraphs}
          highlightedIndexes={
            highlightedIndexes
          }
          onWordListen={
            handleWordListen
          }
          activeWordIndex={
            activeWordIndex
          }
        />

        {/* <button
          className={styles.button}
          onClick={handleStart}
          disabled={isListening}
          title="Начать читать"
        >
          ▶️
        </button> */}

      </div>
    </div>
  );
}