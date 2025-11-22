// src/types.ts
export interface Task {
  id: number
  label: string;
  date: string;
  time: string;
  completed: boolean;
  reward?: number;
  createdAt: Date
  memberId: number

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
