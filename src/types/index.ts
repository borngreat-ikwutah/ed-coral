export interface AssignmentRow {
  assignment_id: string;
  course_code: string;
  title: string;
  due_date: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  github_issue_title?: string | null;
  github_status?: 'open' | 'closed' | null;
}

export interface AgentServerResponse {
  sql: string;
  data: AssignmentRow[];
  explanation: string;
  error?: string;
}
