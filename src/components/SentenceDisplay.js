// 

import React from "react";

import styles from "../styles/SentenceDisplay.module.css";

// ======================================================
// 🔊 Озвучка слова
// ======================================================

function speakWord(word) {
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(word);

  utterance.lang = "ru-RU";
  utterance.rate = 0.85;
  utterance.pitch = 1;
  utterance.volume = 1;

  speechSynthesis.speak(utterance);
}

// ======================================================
// SentenceDisplay
// ======================================================

export default function SentenceDisplay({
  content,
  paragraphs,
  highlightedIndexes,
  onWordListen,
  activeWordIndex,
  visitedButNotRecognized = [],
  isLocked = false
}) {

  // ====================================================
  // Если paragraphs ещё не передан,
  // используем content
  // ====================================================

  if (!paragraphs || paragraphs.length === 0) {

    return (

      <div className={styles.wrapper}>

        {content.map((item, index) => {

          // ============================================
          // Пунктуация
          // ============================================

          if (item.type !== "word") {
            return (
              <span key={index}>
                {item.word}
              </span>
            );
          }

          // ============================================
          // Состояние слова
          // ============================================

          const isHighlighted = highlightedIndexes.includes(index);
          const isActive = activeWordIndex === index && !isHighlighted;
          const isVisited =
            visitedButNotRecognized.includes(index) &&
            !isHighlighted &&
            !isActive;

          return (

            <div
              key={index}
              className={styles.wordBlock}
            >

              {/* 👂 СЛУШАТЬ СЛОВО */}

              <button
                className={styles.listenButton}
                onClick={() => speakWord(item.word)}
                title="Прослушать слово"
              >
                👂
              </button>

              {/* СЛОВО */}

              <span
                className={`
                  ${styles.word}
                  ${isHighlighted ? styles.highlighted : ""}
                  ${isActive ? styles.active : ""}
                  ${isVisited ? styles.visited : ""}
                `}
              >
                {item.word}
              </span>

              {/* 🎤 ПРОЧИТАТЬ СЛОВО */}

              <button
                className={styles.miniMic}
                onClick={() => onWordListen(index)}
                disabled={isLocked}
                title="Прочитать слово"
                style={{
                  opacity: isLocked ? 0.4 : 1,
                  cursor: isLocked ? "not-allowed" : "pointer"
                }}
              >
                🎤
              </button>

            </div>

          );

        })}

      </div>

    );

  }

  // ====================================================
  // ВАРИАНТ С АБЗАЦАМИ
  // ====================================================

  let globalIndex = 0;

  return (

    <div className={styles.wrapper}>

      {paragraphs.map((paragraph, paragraphIndex) => {

        return (

          <div
            key={paragraphIndex}
            className={styles.paragraph}
          >

            {paragraph.map((item) => {

              const index = globalIndex;
              globalIndex++;

              // ======================================
              // Пунктуация
              // ======================================

              if (item.type !== "word") {
                return (
                  <span key={index}>
                    {item.word}
                  </span>
                );
              }

              // ======================================
              // Состояние слова
              // ======================================

              const isHighlighted = highlightedIndexes.includes(index);
              const isActive = activeWordIndex === index && !isHighlighted;
              const isVisited =
                visitedButNotRecognized.includes(index) &&
                !isHighlighted &&
                !isActive;

              return (

                <span
                  key={index}
                  className={styles.wordBlock}
                >

                  {/* 👂 СЛУШАТЬ СЛОВО */}

                  <button
                    className={styles.listenButton}
                    onClick={() => speakWord(item.word)}
                    title="Прослушать слово"
                  >
                    👂
                  </button>

                  {/* СЛОВО */}

                  <span
                    className={`
                      ${styles.word}
                      ${isHighlighted ? styles.highlighted : ""}
                      ${isActive ? styles.active : ""}
                      ${isVisited ? styles.visited : ""}
                    `}
                  >
                    {item.word}
                  </span>

                  {/* 🎤 ПРОЧИТАТЬ СЛОВО */}

                  <button
                    className={styles.miniMic}
                    onClick={() => onWordListen(index)}
                    disabled={isLocked}
                    title="Прочитать слово"
                    style={{
                      opacity: isLocked ? 0.4 : 1,
                      cursor: isLocked ? "not-allowed" : "pointer"
                    }}
                  >
                    🎤
                  </button>

                </span>

              );

            })}

          </div>

        );

      })}

    </div>

  );

}
