import { DialogContent, DialogHeader, DialogTitle } from "@/components/animate-ui/components/radix/dialog";
import { Pencil, Trash2 } from "lucide-react";
import { useTaskStore } from "@/lib/store/task-store";
import TaskCardEditForm from "./taskCardEditForm";
import { Member, Task } from "@/types/typeData";
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
    <DialogContent className="rounded-4xl w-[450px] p-6">
      <DialogHeader>
        <DialogTitle className="text-4xl font-semibold mb-4 line-clamp-2">{isEditing ? "Edit Task" : task.label}</DialogTitle>
      </DialogHeader>

      {isEditing ? (
        <TaskCardEditForm task={task} setOpen={setOpen} setIsEditing={setIsEditing} />
      ) : (
        <>
          <div className="w-full flex justify-center mb-6">
            <div className="w-1/2 flex gap-4">
              <button className="flex-1 h-14 rounded-4xl bg-gray-100 hover:bg-gray-200 cursor-pointer" onClick={() => setIsEditing(true)}>
                <Pencil size={18} className="mx-auto" />
                Edit
              </button>

              <button
                className="flex-1 h-14 rounded-4xl bg-gray-100 text-red-500 hover:bg-gray-200 cursor-pointer"
                onClick={async () => {
                  await deleteTask(task.id);
                  setOpen(false);
                }}
              >
                <Trash2 size={18} className="mx-auto" />
                Delete
              </button>
            </div>
          </div>

          <TaskCardInfo task={task} member={member} />

          <button
            onClick={async () => {
              await toggleTask(task.id);
              setOpen(false);
            }}
            className="w-full py-3 bg-blue-600 text-white rounded-2xl text-lg"
          >
            {task.completed ? "Mark as Incomplete" : "Mark as Complete"}
          </button>
        </>
      )}
    </DialogContent>
  );
}
