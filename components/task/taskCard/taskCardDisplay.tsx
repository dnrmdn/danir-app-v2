import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/helpers/dateFormat";
import { formatTimeToAmPm } from "@/lib/helpers/timeFormat";
import { Member, Task } from "@/types/domain";
import { CalendarDays, Clock3, Sparkles, Star } from "lucide-react";
import CheckButton from "../addTask/checkButton";
import { useTaskStore } from "@/lib/store/task-store";
import { capitalize } from "@/lib/helpers/capitalized";

import { useLanguage } from "@/components/language-provider";

type Props = {
  task: Task;
  member: Member;
  onOpen: () => void;
};

const contentTask = {
  id: { done: "Selesai", active: "Aktif", flexible: "Tugas fleksibel" },
  en: { done: "Done", active: "Active", flexible: "Flexible task" }
};

export default function TaskCardDisplay({ task, member, onOpen }: Props) {
  const { toggleTask } = useTaskStore();
  const { locale } = useLanguage();
  const t = contentTask[locale];

  return (
    <Card
      onClick={onOpen}
      className={`w-full cursor-pointer rounded-[2rem] border-0 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${task.completed ? member.taskColorDone : member.taskColor}`}
    >
      <div className="flex items-start justify-between gap-3 px-5 py-4">
        <div className="flex flex-1 flex-col items-start">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-white/70 dark:bg-black/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">
              {task.completed ? t.done : t.active}
            </span>
            {Number(task.reward) > 0 && (
              <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${member.bgColor}`}>
                <Star size={14} fill={task.completed ? "#eab308" : "transparent"} color={task.completed ? "#eab308" : "#64748b"} />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{task.reward} pts</span>
              </div>
            )}
          </div>

          <p className={`line-clamp-2 text-left text-base font-black ${task.completed ? "text-slate-500 dark:text-slate-400 line-through" : "text-slate-800 dark:text-white"}`}>
            {capitalize(task.label)}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {task.date && (
              <div className="inline-flex items-center gap-1 rounded-full bg-white/70 dark:bg-black/20 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300">
                <CalendarDays size={13} />
                {formatDate(task.date)}
              </div>
            )}
            {task.time && (
              <div className="inline-flex items-center gap-1 rounded-full bg-white/70 dark:bg-black/20 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300">
                <Clock3 size={13} />
                {formatTimeToAmPm(task.time)}
              </div>
            )}
            {!task.date && !task.time && (
              <div className="inline-flex items-center gap-1 rounded-full bg-white/70 dark:bg-black/20 px-2.5 py-1 text-xs text-slate-500 dark:text-slate-300">
                <Sparkles size={13} />
                {t.flexible}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <CheckButton member={member} checked={task.completed} onToggle={() => toggleTask(task.id)} />
        </div>
      </div>
    </Card>
  );
}
