// src/types.ts
export interface Task {
  id: number
  label: string;
  date: string;
  time: string;
  completed: boolean;
  icon: string;
  createdAt: Date

}

export interface Member {
  id: number; // ← tambahkan ini
  name: string;
  bgColor: string;
  taskColor: string;
  taskColorDone: string;
  iconColor: string;
  checkColor: string;
  tasks: Task[];
}
