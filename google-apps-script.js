function doGet(e) {
  const params = e.parameter;
  const action = params.action;

  // Handle CORS
  const headers = {
    "Access-Control-Allow-Origin": "*"
  };

  if (action === "getQuestions") {
    const count = parseInt(params.count) || 10;
    const questions = getRandomQuestions(count);
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      data: questions
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "error",
    message: "Invalid action"
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  // Handle submitting results
  try {
    const data = JSON.parse(e.postData.contents);

    // Validate required fields
    // Validate required fields
    if (!data.id || !data.answers) {
      throw new Error("Missing required fields");
    }

    const result = saveScore(data);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      data: result
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getRandomQuestions(count) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("题目"); // Questions sheet
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  const headers = data[0]; // Assuming first row is header
  const rows = data.slice(1);

  // Columns: ID, Question, A, B, C, D, Answer
  // Index: 0, 1, 2, 3, 4, 5, 6 (Adjust based on user's sheet)
  // User spec: 题號(0), 题目(1), A(2), B(3), C(4), D(5), 解答(6)

  // Shuffle rows
  for (let i = rows.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }

  const selected = rows.slice(0, count).map(row => ({
    id: row[0],
    question: row[1],
    options: {
      A: row[2],
      B: row[3],
      C: row[4],
      D: row[5]
    },
    answer: row[6] // In real app, maybe hide this? But user asked to calculate score in GAS.
    // If calculating in GAS, we shouldn't send answer to frontend?
    // User said: "成績計算：將作答結果傳送到 Google Apps Script 計算成績"
    // So frontend sends chosen answers, backend calculates.
    // BUT frontend needs to show next question or immediate feedback?
    // "闖關問答" usually implies immediate pass/fail?
    // Let's assume we send 'answer' hash or just hide it.
    // However, to keep it simple and responsive, usually we check on client or send answers at end.
    // User request: "將作答結果傳送到 Google Apps Script 計算成績" -> This implies submitting ALL answers at end.
    // So for "getQuestions", we SHOULD NOT send the answer key if we want to be secure.
    // But for simplicity in a "game", often we do.
    // Let's follow "Submit answers to calculate". So I will NOT send the 'answer' column to frontend.
  }));

  // Remove answer from payload for security if calculation is done on server
  // Wait, if calculation is on server, how does user know if they passed?
  // They submit, server returns score.
  // We need to store the correct answers in the server session? GAS is stateless.
  // We can convert the Question ID to map to answers during grading.

  return selected.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options
    // No answer field
  }));
}

function saveScore(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("回答"); // Responses sheet
  if (!sheet) {
    sheet = ss.insertSheet("回答");
    sheet.appendRow(["ID", "闯关次数", "总分", "最高分", "第一次通关分数", "通关耗时(次)", "最近游玩时间"]);
  }

  // Grading logic if answers are sent
  // Wait, the input `data` has `score`.
  // User req: "將作答結果傳送到 Google Apps Script 計算成績"
  // This means frontend sends { id, answers: {qId: 'A', ...} } and backend calculates score.
  // Let's implement that.

  let score = 0;
  let correctCount = 0;

  // Load answers map
  const qSheet = ss.getSheetByName("题目");
  const qData = qSheet.getDataRange().getValues();
  const answerMap = {}; // id -> correct answer
  qData.slice(1).forEach(row => {
    answerMap[row[0]] = row[6]; // ID is col 0, Answer is col 6
  });

  const userAnswers = data.answers; // Expecting array or map
  // userAnswers: [{id: 1, answer: 'A'}, ...]

  userAnswers.forEach(ans => {
    if (String(answerMap[ans.id]).trim().toUpperCase() === String(ans.answer).trim().toUpperCase()) {
      score += 10; // 10 points per question? Or 1? Let's say 1 point per question.
      correctCount++;
    }
  });

  const totalQuestions = userAnswers.length;
  // Use config or just simple int score.

  // Update "回答" sheet
  const rData = sheet.getDataRange().getValues();
  let rowIndex = -1;
  const userId = String(data.id);

  for (let i = 1; i < rData.length; i++) {
    if (String(rData[i][0]) === userId) {
      rowIndex = i + 1; // 1-based row index
      break;
    }
  }

  const now = new Date();
  const attempts = rowIndex > -1 ? (rData[rowIndex - 1][1] || 0) + 1 : 1;

  // Need to handle logic: "若同 ID 已通關過，後續分數不覆蓋，僅在同列增加闖關次數"
  // What defines "Passed"? "PASS_THRESHOLD".
  // Let's pass that status from frontend or calculate here?
  // Passed if correctCount >= threshold?
  // Let's just store the score. The logic "don't overwrite first clear score" implies we check if existing first clear score exists.

  if (rowIndex === -1) {
    // New user
    sheet.appendRow([
      userId,
      1,
      correctCount,
      correctCount,
      correctCount >= (data.threshold || 0) ? correctCount : "",
      attempts,
      now
    ]);
  } else {
    // Existing user
    const currentRow = rData[rowIndex - 1];
    const currentHighScore = currentRow[3] || 0;
    const currentFirstClear = currentRow[4];

    // high score
    const newHigh = Math.max(currentHighScore, correctCount);

    // first clear
    let newFirstClear = currentFirstClear;
    if (currentFirstClear === "" && correctCount >= (data.threshold || 0)) {
      newFirstClear = correctCount;
    }

    // Update row
    sheet.getRange(rowIndex, 2, 1, 6).setValues([[
      attempts,
      currentRow[2], // Total score history? "總分" might mean cumulative? Or just latest? 
      // "總分" usually means total accumulated, but "最高分" is separate. 
      // Let's assume "總分" is cumulative score across all plays? Or just latest? 
      // "回答" sheet usually tracks sessions. If one row per user, "Total Score" probably means sum of all attempts?
      // Let's assume "Total Score" is cumulative.
      (currentRow[2] || 0) + correctCount,
      newHigh,
      newFirstClear,
      attempts, // "花了幾次通關" -> If they passed now, how many attempts until now? 
      // Maybe this field is "Attempts taken to first clear"? 
      // If already cleared, keep old value. If clearing now, set to current attempts.
      (newFirstClear !== "" && currentFirstClear === "") ? attempts : (currentRow[5] || ""),
      now
    ]]);
  }

  return {
    score: correctCount,
    passed: correctCount >= (data.threshold || 0),
    totalQuestions: totalQuestions
  };
}
