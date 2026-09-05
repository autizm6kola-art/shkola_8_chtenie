// import React, {
//   useState,
//   useEffect,
//   useRef,
//   useCallback,
//   useMemo
// } from "react";

// import styles from "../styles/ReadingPage.module.css";

// import SentenceDisplay from "./SentenceDisplay";

// import {
//   saveCorrectInput,
//   getUserInputs,
//   saveUserInputs
// } from "../utils/storage";

// import { createSpeechRecognizer } from "../utils/bookUtils";

// import { addTodayWords } from "../utils/dailyStats";

// const APP_ID = "shkola_8_chtenie";

// // ======================================================
// // НОРМАЛИЗАЦИЯ
// // ======================================================

// function normalizeToArray(text) {

//   return text
//     .toLowerCase()
//     .replace(/[.,!?;:«»"()\r\n]/g, "")
//     .split(/\s+/)
//     .filter(Boolean);
// }

// export default function ReadingTask({ task }) {

//   // ======================================================
//   // STATE
//   // ======================================================

//   const [isListening, setIsListening] =
//     useState(false);

//   const [highlightedIndexes, setHighlightedIndexes] =
//     useState([]);

//   const [isStopped, setIsStopped] =
//     useState(false);

//   // 👇 индекс слова для дочитывания

//   const [activeWordIndex, setActiveWordIndex] =
//     useState(null);

//   // ======================================================
//   // REFS
//   // ======================================================

//   const recognizerRef =
//     useRef(null);

//   // 👇 ВАЖНО
//   // хранит АКТУАЛЬНЫЕ highlighted слова

//   const highlightedIndexesRef =
//     useRef([]);

//   // const mediaRecorderRef =
//   //   useRef(null);

//   // const recordedChunks =
//   //   useRef([]);

//   // ======================================================
//   // CONTENT
//   // ======================================================

//   const content = useMemo(
//     () => task.content || [],
//     [task.content]
//   );

//   const totalWords = content.filter(
//     item => item.type === "word"
//   ).length;

//   // ======================================================
//   // LOAD SAVED PROGRESS
//   // ======================================================

//   useEffect(() => {

//     const saved =
//       getUserInputs(task.id);

//     if (saved?.[0]) {

//       setHighlightedIndexes(saved[0]);
//     }

//   }, [task.id]);

//   // ======================================================
//   // 👇 СИНХРОНИЗАЦИЯ REF
//   // ======================================================

//   useEffect(() => {

//     highlightedIndexesRef.current =
//       highlightedIndexes;

//   }, [highlightedIndexes]);

//   // ======================================================
//   // ОБРАБОТКА РЕЗУЛЬТАТОВ SPEECH
//   // ======================================================

//   const handleResult = useCallback((transcript) => {

//     const transcriptWords =
//       normalizeToArray(transcript);

//     // ==================================================
//     // 🎤 РЕЖИМ ОДНОГО СЛОВА
//     // ==================================================

//     if (activeWordIndex !== null) {

//       const targetWord =
//         content[activeWordIndex]?.word
//           ?.toLowerCase()
//           .replace(/[.,!?;:«»"()\r\n]/g, "");

//       if (
//         transcriptWords.includes(targetWord)
//       ) {

//         const merged = [

//           ...new Set([

//             ...highlightedIndexesRef.current,

//             activeWordIndex

//           ])
//         ];

//         setHighlightedIndexes(merged);

//         saveUserInputs(task.id, [merged]);

//         addTodayWords(APP_ID, 1);

//         // 👇 останавливаем recognizer

//         try {

//           recognizerRef.current?.stop();

//         } catch (e) {}

//         setIsListening(false);

//         setActiveWordIndex(null);
//       }

//       return;
//     }

//     // ==================================================
//     // 🎤 ОБЫЧНОЕ ЧТЕНИЕ ФРАЗЫ
//     // ==================================================

//     const availableTokens =
//       [...transcriptWords];

//     const newMatchedIndexes = [];

//     content.forEach((item, index) => {

//       if (item.type !== "word") return;

//       const clean =
//         item.word
//           .toLowerCase()
//           .replace(/[.,!?;:«»"()\r\n]/g, "");

//       const foundIndex =
//         availableTokens.findIndex(
//           tok => tok === clean
//         );

//       if (foundIndex !== -1) {

//         newMatchedIndexes.push(index);

//         availableTokens.splice(foundIndex, 1);
//       }
//     });

//     // ==================================================
//     // merge старых и новых слов
//     // ==================================================

//     const merged = [

//       ...new Set([

//         ...highlightedIndexesRef.current,

//         ...newMatchedIndexes

//       ])
//     ];

//     // ==================================================
//     // считаем только новые слова
//     // ==================================================

//     const trulyNew = merged.filter(
//       index =>
//         !highlightedIndexesRef.current
//           .includes(index)
//     );

//     addTodayWords(
//       APP_ID,
//       trulyNew.length
//     );

//     setHighlightedIndexes(merged);

//     saveUserInputs(task.id, [merged]);

//     // ==================================================
//     // прогресс
//     // ==================================================

//     if (merged.length >= totalWords / 2) {

//       saveCorrectInput(task.id, 0);
//     }

//     window.dispatchEvent(
//       new Event("progressUpdated")
//     );

//   }, [

//     activeWordIndex,

//     content,

//     task.id,

//     totalWords

//   ]);

//   // ======================================================
//   // 🎤 СОЗДАЁМ recognizer ОДИН РАЗ
//   // ======================================================

//   useEffect(() => {

//     if (!recognizerRef.current) {

//       recognizerRef.current =
//         createSpeechRecognizer({

//           onResult: (transcript) => {

//             handleResult(transcript);
//           },

//           onEnd: () => {

//             // 👇 если listening ещё активно —
//             // автоматически перезапускаем session

//             if (isListening) {

//               try {

//                 recognizerRef.current?.start();

//               } catch (e) {

//                 console.log(
//                   "restart blocked"
//                 );
//               }
//             }
//           }
//         });
//     }

//     // cleanup только при уходе
//     // со страницы

//     return () => {

//       try {

//         recognizerRef.current?.stop();

//       } catch (e) {}
//     };

//   }, []);

//   // ======================================================
//   // 🔴 RECORDING
//   // ======================================================

//   // const startRecording = async () => {

//   //   recordedChunks.current = [];

//   //   try {

//   //     const stream =
//   //       await navigator.mediaDevices
//   //         .getUserMedia({
//   //           audio: true
//   //         });

//   //     const mediaRecorder =
//   //       new MediaRecorder(stream);

//   //     mediaRecorderRef.current =
//   //       mediaRecorder;

//   //     mediaRecorder.ondataavailable =
//   //       (event) => {

//   //         if (event.data.size > 0) {

//   //           recordedChunks.current
//   //             .push(event.data);
//   //         }
//   //       };

//   //     mediaRecorder.start();

//   //   } catch (err) {

//   //     console.error(err);

//   //     alert(
//   //       "Нет доступа к микрофону"
//   //     );
//   //   }
//   // };

//   // const stopRecording = () => {

//   //   if (mediaRecorderRef.current) {

//   //     mediaRecorderRef.current.stop();
//   //   }
//   // };

//   // ======================================================
//   // ▶️ START
//   // ======================================================

//   // const handleStart = () => {

//   //   setIsStopped(false);

//   //   setActiveWordIndex(null);

//   //   setIsListening(true);

//   //   startRecording();

//   //   try {

//   //     recognizerRef.current?.start();

//   //   } catch (e) {

//   //     console.log(
//   //       "already started"
//   //     );
//   //   }
//   // };

//   // ======================================================
//   // ⏹ STOP
//   // ======================================================

//   // const handleStop = () => {

//   //   setIsListening(false);

//   //   setIsStopped(true);

//   //   setActiveWordIndex(null);

//   //   stopRecording();

//   //   try {

//   //     recognizerRef.current?.stop();

//   //   } catch (e) {}
//   // };

//   // ======================================================
//   // 🎤 ДОЧИТАТЬ ОДНО СЛОВО
//   // ======================================================

//   const handleWordListen = (index) => {

//     setActiveWordIndex(index);

//     setIsStopped(false);

//     setIsListening(true);

//     try {

//       recognizerRef.current?.start();

//     } catch (e) {

//       console.log(
//         "already started"
//       );
//     }
//   };

//   // ======================================================
//   // RENDER
//   // ======================================================

//   return (

//     <div
//       className={`
//         ${styles.container}
//         ${isStopped ? styles.completed : ""}
//       `}
//     >

//       <div className={styles.row}>

//         <SentenceDisplay
//           content={content}
//           paragraphs={task.paragraphs}
//           highlightedIndexes={
//             highlightedIndexes
//           }
//           onWordListen={
//             handleWordListen
//           }
//           activeWordIndex={
//             activeWordIndex
//           }
//         />

//         {/* <button
//           className={styles.button}
//           onClick={handleStart}
//           disabled={isListening}
//           title="Начать читать"
//         >
//           ▶️
//         </button> */}

//       </div>
//     </div>
//   );
// }

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

  // ======================================================
  // REFS
  // ======================================================

  const recognizerRef = useRef(null);

  // всегда актуальные значения для колбэков recognizer
  const highlightedIndexesRef = useRef([]);
  const activeWordIndexRef = useRef(null);
  const contentRef = useRef(null);
  const taskIdRef = useRef(task.id);
  const totalWordsRef = useRef(0);

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

  // обновляем ref-ы на каждом рендере
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
  // ОБРАБОТКА РЕЗУЛЬТАТА — только одно слово
  // ======================================================

  const handleResult = (transcript) => {
    const spokenWords = normalizeToArray(transcript);
    const idx = activeWordIndexRef.current;

    // если никто не нажал на слово — ничего не делаем
    if (idx === null) return;

    const targetWord = normalizeWord(
      contentRef.current?.[idx]?.word || ""
    );

    // проверяем, назвал ли человек нужное слово
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

      // сначала обнуляем активное слово,
      // потом останавливаем recognizer
      // (чтобы onEnd не перезапустил слушание)
      setActiveWordIndex(null);
      activeWordIndexRef.current = null;

      try {
        recognizerRef.current?.stop();
      } catch (e) {}

      // прогресс
      if (merged.length >= totalWordsRef.current / 2) {
        saveCorrectInput(taskIdRef.current, 0);
      }

      window.dispatchEvent(new Event("progressUpdated"));
    }
  };

  // ref на handleResult — recognizer всегда
  // вызывает последнюю версию функции
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
          // перезапуск только если всё ещё ждём слово
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
        />
      </div>
    </div>
  );
}
