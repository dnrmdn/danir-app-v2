import FloatButton from "@/components/floatButton";
import AddTaskForm from "./addTaskForm";
import { Plus } from "lucide-react";

export default function AddButtonTask() {
  return (
    <FloatButton floating={true} shadow={true} bgColor="bg-blue-500" size="w-14 h-14" icon={<Plus color="white" size={30} />} position="bottom-8 right-8">
      <AddTaskForm isOpen={true} onClose={() => {}} />
    </FloatButton>
  );
}
