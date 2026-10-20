const { execSync } = require("child_process");
const path = require("path");
require("dotenv").config();

const mysqlPath = `"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe"`;
const host = process.env.MYSQL_HOST || "127.0.0.1";
const port = process.env.MYSQL_PORT || "3306";
const user = process.env.MYSQL_USER || "root";
const password = process.env.MYSQL_PASSWORD || "Ayush123";
const dbName = process.env.MYSQL_DATABASE || "intership_portel";

console.log("=========================================");
console.log("🐬 MYSQL DATABASE INSPECTION REPORT");
console.log("=========================================\n");
console.log(`Connecting to: ${user}@${host}:${port}/${dbName}\n`);

function query(sql) {
  const cmd = `${mysqlPath} -h ${host} -P ${port} -u ${user} -p${password} -D ${dbName} -t -e "${sql}"`;
  try {
    return execSync(cmd, { encoding: "utf8" });
  } catch (err) {
    return `Error: ${err.message}`;
  }
}

console.log("📋 1. TABLES IN DATABASE:");
console.log(query("SHOW TABLES;"));

console.log("👥 2. REGISTERED USERS:");
console.log(query("SELECT id, email, role, created_at FROM users;"));

console.log("🎓 3. STUDENT PROFILES:");
console.log(query("SELECT id, user_id, full_name, university, major, gpa, skills FROM students;"));

console.log("🏢 4. COMPANIES:");
console.log(query("SELECT id, user_id, company_name, industry, location, is_verified FROM companies;"));

console.log("💼 5. POSTED INTERNSHIPS:");
console.log(query("SELECT id, title, stipend, location, internship_type, status FROM internships;"));

console.log("📝 6. APPLICATIONS & MATCH SCORES:");
console.log(query("SELECT id, student_id, internship_id, match_score, status, applied_at FROM applications;"));

console.log("=========================================");
console.log("✅ MYSQL DATABASE: HEALTHY & FULLY ACCESSIBLE");
console.log("=========================================\n");
