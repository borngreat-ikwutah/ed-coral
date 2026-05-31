import { AssignmentRow } from "../types";

/**
 * Translates a user's natural language inquiry into a structured Coral SQL query.
 */
export function translatePromptToSql(prompt: string): string {
  const query = prompt.toLowerCase().trim();
  
  if (query.includes("pending") || query.includes("todo") || query.includes("to do") || query.includes("undone")) {
    return "SELECT * FROM academic_tracker.assignments WHERE status = 'Pending'";
  }
  
  if (query.includes("in progress") || query.includes("doing") || query.includes("active")) {
    return "SELECT * FROM academic_tracker.assignments WHERE status = 'In Progress'";
  }
  
  if (query.includes("completed") || query.includes("done") || query.includes("finished") || query.includes("passed")) {
    return "SELECT * FROM academic_tracker.assignments WHERE status = 'Completed'";
  }
  
  if (query.includes("critical") || query.includes("overdue") || query.includes("soon") || query.includes("deadline")) {
    // Show assignments that are pending or in progress, ordered by due date
    return "SELECT * FROM academic_tracker.assignments WHERE status != 'Completed' ORDER BY due_date ASC";
  }

  if (query.includes("github") || query.includes("issue") || query.includes("open")) {
    return "SELECT * FROM academic_tracker.assignments WHERE github_status IS NOT NULL";
  }
  
  // Default to selecting all assignments
  return "SELECT * FROM academic_tracker.assignments ORDER BY due_date ASC";
}

/**
 * Compiles a rich, encouraging, and highly specific dashboard briefing from raw data.
 */
export function generateAdvisorBriefing(
  userPrompt: string,
  sql: string,
  data: AssignmentRow[]
): string {
  // 1. Transparency Focus
  const queriedTables = "Queried local assignments tracker database via Coral";
  
  // Get counts
  const completed = data.filter(r => r.status === "Completed");

  // Determine critical overdue assignments
  const currentDateStr = "2026-05-28"; // Based on our current local time
  const criticalItems = data.filter(
    r => r.status !== "Completed" && r.due_date <= currentDateStr
  );
  const regularPending = data.filter(
    r => r.status !== "Completed" && r.due_date > currentDateStr
  );

  // Sync checks (discrepancies between local status and github status)
  // E.g., github status is open but local status is Completed, or vice versa
  const syncIssues = data.filter(r => {
    if (r.github_status === "open" && r.status === "Completed") return true;
    if (r.github_status === "closed" && r.status !== "Completed") return true;
    return false;
  });

  // Constructing Markdown Briefing
  let markdown = `📊 **Query Diagnostic**: ${queriedTables}. Executed SQL: \`${sql}\`.\n\n`;
  
  markdown += `Hey there! 🎓 As your academic coach, I've reviewed your current workload and tracking sync states. You are making steady progress, but let's make sure your workspace is aligned and nothing slips through the cracks!\n\n`;

  // Segment 1: Critical Focus
  markdown += `### 🔴 Critical Focus\n`;
  if (criticalItems.length > 0) {
    markdown += `We have **${criticalItems.length}** item(s) that are immediately overdue or require urgent attention:\n`;
    criticalItems.forEach(item => {
      markdown += `- **${item.course_code}**: *${item.title}* was due on **${item.due_date}** (Status: \`${item.status}\`).`;
      if (item.github_issue_title) {
        markdown += ` Linked GitHub Issue: "${item.github_issue_title}" is currently \`${item.github_status}\`.`;
      }
      markdown += `\n`;
    });
  } else {
    markdown += `- Fantastic! No overdue assignments are currently pending or in progress. Outstanding work on managing your time!\n`;
  }
  markdown += `\n`;

  // Segment 2: Sync Checks
  markdown += `### 🟡 Sync Checks\n`;
  if (syncIssues.length > 0 || regularPending.length > 0) {
    if (syncIssues.length > 0) {
      markdown += `⚠️ **Workspace Sync Alerts**:\n`;
      syncIssues.forEach(item => {
        markdown += `- **${item.course_code}**: Local tracker reports \`${item.status}\`, but GitHub Issue status is \`${item.github_status}\`. Let's synchronize these states.\n`;
      });
    }
    
    if (regularPending.length > 0) {
      markdown += `📅 **Upcoming Milestones**:\n`;
      regularPending.forEach(item => {
        markdown += `- **${item.course_code}**: *${item.title}* is due on **${item.due_date}** (Status: \`${item.status}\`). Keep up the momentum!\n`;
      });
    }
  } else {
    markdown += `- All active schedules and local tasks are fully synchronized with their repositories!\n`;
  }
  markdown += `\n`;

  // Segment 3: Clear Tracks
  markdown += `### 🟢 Clear Tracks\n`;
  if (completed.length > 0) {
    markdown += `Awesome job! You have fully completed these assignments across all files:\n`;
    completed.forEach(item => {
      markdown += `- **${item.course_code}**: *${item.title}* (Completed on/before ${item.due_date}).`;
      if (item.github_issue_title) {
        markdown += ` GitHub Issue closed: "${item.github_issue_title}".`;
      }
      markdown += `\n`;
    });
  } else {
    markdown += `- No completed assignments are showing in the current filtered view. Let's get one checked off soon!\n`;
  }
  markdown += `\n`;

  // Notion prompt connector
  markdown += `--- \n`;
  markdown += `💡 **Pro Tip**: Want to keep your syllabus, database, and lecture notes fully unified? Connect your **Notion workspace** to EduCoral AI to automatically import assignment dates directly into your dashboard! Click **"Connect Notion Workspace"** in the sidebar to get started. 🚀`;

  return markdown;
}
