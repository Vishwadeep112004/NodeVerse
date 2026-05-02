const dailySubmissions = {
  "2026-04-28": 1,
  "2026-04-29": 2,
  "2026-04-30": 1,
  "2026-05-01": 1,
  "2026-05-02": 5
};
const today = new Date("2026-05-02T07:42:56+05:30");
const tYear = today.getFullYear();
const tMonth = String(today.getMonth() + 1).padStart(2, '0');
const tDay = String(today.getDate()).padStart(2, '0');
const todayKey = `${tYear}-${tMonth}-${tDay}`;
console.log("todayKey:", todayKey);
console.log("value:", dailySubmissions[todayKey]);
