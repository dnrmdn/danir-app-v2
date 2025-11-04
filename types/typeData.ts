// src/types.ts
export interface Task {
  label: string;
  period: string;
  icon: string;
  done: boolean;
}

export interface Member {
  name: string;
  color: string;      // Tailwind class e.g. "bg-blue-50"
  iconColor: string;  // Tailwind class e.g. "bg-blue-200"
  checkColor: string;
  tasks: Task[];      // list tugas milik member
}
