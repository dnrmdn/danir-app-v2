import { DialogContent, DialogHeader, DialogTitle } from "@/components/animate-ui/components/radix/dialog";
import { CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { useTaskStore } from "@/lib/store/task-store";
import TaskCardEditForm from "./taskCardEditForm";
import { Member, Task } from "@/types/domain";
import TaskCardInfo from "./taskCardInfo";

type Props = {
  task: Task;
  member: Member;
  setOpen: (v: boolean) => void;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
};

export default function TaskCardDialog({ task, member, setOpen, isEditing, setIsEditing }: Props) {
  const { deleteTask, toggleTask } = useTaskStore();

  return (
    <DialogContent className="w-[480px] rounded-[2rem] border border-white/10 bg-[#08111f]/95 p-6 text-white backdrop-blur-xl">
      <DialogHeader>
        <DialogTitle className="mb-1 line-clamp-2 text-3xl font-black text-white">
          {isEditing ? "Edit task" : task.label}
        </DialogTitle>
        {!isEditing && <p className="text-sm text-slate-400">Update details, mark progress, or remove this task from the board.</p>}
      </DialogHeader>

      {isEditing ? (
        <TaskCardEditForm task={task} setOpen={setOpen} setIsEditing={setIsEditing} />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3">
            <button
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10"
              onClick={() => setIsEditing(true)}
            >
              <Pencil size={18} />
              Edit
            </button>

            <button
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-red-400/15 bg-red-500/10 text-red-200 transition hover:bg-red-500/15"
              onClick={async () => {
                await deleteTask(task.id);
                setOpen(false);
              }}
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>

          <TaskCardInfo task={task} member={member} />

          <button
            onClick={async () => {
              await toggleTask(task.id);
              setOpen(false);
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 py-3 text-lg font-semibold text-cyan-100 transition hover:bg-cyan-400/15"
          >
            <CheckCircle2 size={18} />
            {task.completed ? "Mark as incomplete" : "Mark as complete"}
          </button>
        </>
      )}
    </DialogContent>
  );
}
