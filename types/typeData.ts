// src/types.ts
export interface Task {
  label: string;
  period: string;
  icon: string;
  done: boolean;
}

export interface Member {
  name: string;
  bgColor: string;      
  taskColor: string;      
  taskColorDone: string;      
  iconColor: string;  
  checkColor: string;
  tasks: Task[];      
}
