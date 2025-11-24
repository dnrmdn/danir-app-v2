"use client";
import { useState } from "react";
import { Dialog } from "@/components/animate-ui/components/radix/dialog";
import { Member, Task } from "@/types/typeData";
import TaskCardDisplay from "./taskCardDisplay";
import TaskCardDialog from "./taskCardDialog";

type TaskCardProps = {
  task: Task;
  member: Member;
};

export default function TaskCard({ task, member } : TaskCardProps) {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TaskCardDisplay task={task} member={member} onOpen={() => setOpen(true)} />

      <TaskCardDialog
        task={task}
        member={member}
        setOpen={setOpen}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
      />
    </Dialog>
  );
}
