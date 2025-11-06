import AddProfile from "./addProfile";
import { members } from "../data/members"; 
import AddDateInput from "./addDateInput";
import AddTimeInput from "./addTimeInput";
import AddTitleInput from "./addTitleInput";
import AddRepeatInput from "./addRepeatInput";

export default function AddTaskForm() {
  return (
    <div className="flex flex-col gap-4">
      <AddTitleInput />
      <AddProfile members={members} />
      <AddDateInput/>
      <AddTimeInput/>
      <AddRepeatInput/>
      <button className="bg-blue-500 text-white rounded-xl p-3 hover:bg-blue-600 transition">
        Add Task
      </button>
    </div>
  );
}
