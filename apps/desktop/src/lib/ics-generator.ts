import { TaskBlueprint } from "../types/plan";

/**
 * Helper to add days while skipping weekends
 */
function addBusinessDays(startDate: Date, daysToAdd: number): Date {
  const currentDate = new Date(startDate);
  let added = 0;
  
  // If starting on a weekend, move to Monday first
  while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  while (added < daysToAdd) {
    currentDate.setDate(currentDate.getDate() + 1);
    // If it's Saturday (6) or Sunday (0), don't count it as a "business day"
    // but we still need to move the date forward.
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      added++;
    }
  }
  
  // If we ended on a weekend (safety check)
  while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return currentDate;
}

export function generateICS(
  title: string, 
  tasks: TaskBlueprint[], 
  startDateStr: string,
  skipWeekends: boolean
) {
  const startDate = new Date(startDateStr);
  
  let icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Planner AI//Plan Generator//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH"
  ].join("\r\n") + "\r\n";

  // Sort tasks by day index to ensure correct order
  const sortedTasks = [...tasks].sort((a, b) => a.day - b.day);

  sortedTasks.forEach((task) => {
    let taskDate: Date;

    if (skipWeekends) {
      // "Day 1" is Start Date. "Day 2" is Start Date + 1 business day.
      // So we add (task.day - 1) business days.
      taskDate = addBusinessDays(startDate, task.day - 1);
    } else {
      // Standard consecutive days
      taskDate = new Date(startDate);
      taskDate.setDate(startDate.getDate() + (task.day - 1));
    }

    // Format Date: YYYYMMDD
    const dateStr = taskDate.toISOString().replace(/[-:]/g, "").split("T")[0];
    
    // Unique ID
    const uid = `${task.day}-${Date.now()}-${Math.floor(Math.random() * 10000)}@planner.ai`;

    // Clean Description
    const description = `
GOAL: ${task.outcome || "Complete daily task"}

ACTION PLAN:
${(task.subtasks || []).map((s: string) => `- ${s}`).join("\\n")}

RESOURCES:
${(task.resources || []).join("\\n")}
    `.trim().replace(/\n/g, "\\n");

    const event = [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART;VALUE=DATE:${dateStr}`, // All-day event
      `SUMMARY:${task.title}`,
      `DESCRIPTION:${description}`,
      "STATUS:CONFIRMED",
      "END:VEVENT"
    ].join("\r\n");

    icsContent += event + "\r\n";
  });

  icsContent += "END:VCALENDAR";
  return icsContent;
}

export function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}