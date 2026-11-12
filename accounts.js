/* Registered student accounts (prototype only).
   WARNING: anyone can read this file in the browser, so real passwords
   must NEVER be stored like this. A real app checks them on a server. */
const STUDENT_ACCOUNTS = [
  { email: 'b36700@students.ucu.ac.ug', password: 'Notify2021#' },
  { email: 'b34567@students.ucu.ac.ug', password: 'Notify2022#' },
  { email: 'b29399@students.ucu.ac.ug', password: 'Notify2023#' },
  { email: 'b24799@students.ucu.ac.ug', password: 'Notify2024#' },
  { email: 'b38759@students.ucu.ac.ug', password: 'Notify2025#' },
  { email: 'b36707@students.ucu.ac.ug', password: 'Notify2026#' }
];

// Email comparison ignores capital letters and extra spaces
function findAccount(email) {
  const wanted = String(email).trim().toLowerCase();
  return STUDENT_ACCOUNTS.find(a => a.email === wanted) || null;
}
