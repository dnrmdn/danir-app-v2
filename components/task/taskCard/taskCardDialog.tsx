import { DialogContent, DialogHeader, DialogTitle } from "@/components/animate-ui/components/radix/dialog";
import { CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { useTaskStore } from "@/lib/store/task-store";
import TaskCardEditForm from "./taskCardEditForm";
import { Member, Task } from "@/types/domain";
import TaskCardInfo from "./taskCardInfo";

import { useLanguage } from "@/components/language-provider";

type Props = {
  task: Task;
  member: Member;
  setOpen: (v: boolean) => void;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
};

const contentDialog = {
  id: {
    editTitle: "Edit tugas",
    desc: "Update detail, tandai progres, atau hapus tugas ini dari papan.",
    edit: "Edit",
    delete: "Hapus",
    markIncomplete: "Batalkan selesainya",
    markComplete: "Tandai selesai"
  },
  en: {
    editTitle: "Edit task",
    desc: "Update details, mark progress, or remove this task from the board.",
    edit: "Edit",
    delete: "Delete",
    markIncomplete: "Mark as incomplete",
    markComplete: "Mark as complete"
  }
};

export default function TaskCardDialog({ task, member, setOpen, isEditing, setIsEditing }: Props) {
  const { deleteTask, toggleTask } = useTaskStore();
  const { locale } = useLanguage();
  const t = contentDialog[locale];

  return (
    <DialogContent className="w-[480px] rounded-[2rem] border border-border bg-popover/95 p-6 text-popover-foreground shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#08111f]/95 dark:text-white">
      <DialogHeader>
        <DialogTitle className="mb-1 line-clamp-2 text-3xl font-black text-foreground dark:text-white">
          {isEditing ? t.editTitle : task.label}
        </DialogTitle>
        {!isEditing && <p className="text-sm text-muted-foreground dark:text-slate-400">{t.desc}</p>}
      </DialogHeader>

      {isEditing ? (
        <TaskCardEditForm task={task} setOpen={setOpen} setIsEditing={setIsEditing} />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3">
            <button
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-border bg-muted/50 text-foreground transition hover:bg-muted dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
              onClick={() => setIsEditing(true)}
            >
              <Pencil size={18} />
              {t.edit}
            </button>

            <button
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-100 text-red-800 transition hover:bg-red-200 dark:border-red-400/15 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/15"
              onClick={async () => {
                await deleteTask(task.id);
                setOpen(false);
              }}
            >
              <Trash2 size={18} />
              {t.delete}
            </button>
          </div>

          <TaskCardInfo task={task} member={member} />

          <button
            onClick={async () => {
              await toggleTask(task.id);
              setOpen(false);
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-200 bg-cyan-100/50 py-3 text-lg font-semibold text-cyan-800 transition hover:bg-cyan-200/50 dark:border-cyan-300/20 dark:bg-cyan-400/10 dark:text-cyan-100 dark:hover:bg-cyan-400/15"
          >
            <CheckCircle2 size={18} />
            {task.completed ? t.markIncomplete : t.markComplete}
          </button>
        </>
      )}
    </DialogContent>
  );
}
