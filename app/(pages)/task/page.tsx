
import AddButtonTask from "@/components/task/addTask/addButtonTask";
import MainTaskCard from "@/components/task/addTask/mainTaskCard";

export default function TaskPage() {
  return (
      <div className="relative">
        {/* FamilyCard di bawah */}
        <MainTaskCard/>
  
        {/* FloatButton di atas */}
        <div className="fixed bottom-10 right-10 sm:bottom-10 rounded-full shadow-sm  sm:right-15 z-50 ">
          <AddButtonTask/>
        </div>
      </div>
    );
}
