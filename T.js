const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "input.txt");
const outputPath = path.join(__dirname, "output.json");

const START_NUMBER = 1;


// ======================================================
// Читаем TXT
// ======================================================

const text = fs.readFileSync(inputPath, "utf-8");


// ======================================================
// Разбивка строки на слова и пунктуацию
// ======================================================

function tokenize(line) {

  const tokens = [];

  const regex =
    /[А-Яа-яЁёA-Za-z0-9]+(?:-[А-Яа-яЁёA-Za-z0-9]+)*|[.,!?;:«»"()–—-]/g;

  const matches = line.match(regex) || [];

  for (const match of matches) {

    const isWord =
      /[А-Яа-яЁёA-Za-z0-9]/.test(match);

    tokens.push({
      word: match,
      type: isWord
        ? "word"
        : "punctuation"
    });

  }

  return tokens;
}


// ======================================================
// Разбираем TXT на блоки
//
// Каждый блок начинается с:
//
// ===
//
// Первая непустая строка после ===
// становится title.
//
// Каждая следующая непустая строка
// становится отдельным абзацем.
// ======================================================

const lines = text
  .split(/\r?\n/)
  .map(line => line.trim());


const result = [];

let currentBlock = null;
let titleTaken = false;


// ======================================================
// Обрабатываем строки
// ======================================================

for (const line of lines) {


  // ====================================================
  // Новый блок
  // ====================================================

  if (line === "===") {

    if (
      currentBlock &&
      currentBlock.content.length > 0
    ) {

      result.push(currentBlock);

    }


    currentBlock = {

      id: START_NUMBER + result.length,

      title: "",

      // Все слова блока
      content: [],

      // Отдельные абзацы
      paragraphs: []

    };


    titleTaken = false;

    continue;
  }


  // ====================================================
  // Всё до первого === игнорируем
  // ====================================================

  if (!currentBlock) {
    continue;
  }


  // ====================================================
  // Пустая строка
  //
  // Пустая строка означает конец абзаца.
  // Ничего специально делать не нужно:
  // каждый непустой line уже является отдельным
  // абзацем.
  // ====================================================

  if (!line) {
    continue;
  }


  // ====================================================
  // Первая строка блока = title
  // ====================================================

  if (!titleTaken) {

    currentBlock.title = line;

    titleTaken = true;


    const titleTokens = tokenize(line);


    // Добавляем в общий content
    currentBlock.content.push(
      ...titleTokens
    );


    // И отдельно сохраняем как первый абзац
    currentBlock.paragraphs.push(
      titleTokens
    );


    continue;
  }


  // ====================================================
  // Обычный абзац
  // ====================================================

  const paragraphTokens = tokenize(line);


  // Добавляем в общий content
  currentBlock.content.push(
    ...paragraphTokens
  );


  // Добавляем отдельным абзацем
  currentBlock.paragraphs.push(
    paragraphTokens
  );

}


// ======================================================
// Добавляем последний блок
// ======================================================

if (
  currentBlock &&
  currentBlock.content.length > 0
) {

  result.push(currentBlock);

}


// ======================================================
// Записываем JSON
// ======================================================

fs.writeFileSync(

  outputPath,

  JSON.stringify(
    result,
    null,
    2
  ),

  "utf-8"

);


console.log(
  `✅ Готово! JSON создан. Пунктов: ${result.length}`
);