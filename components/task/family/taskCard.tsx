import { Card } from "@/components/ui/card";
import CheckButton from "./checkButton";

export default function TaskCard() {
  return (
    <Card className="max-w-[400px] rounded-4xl">
      <div className="flex items-center justify-between px-4">
        <div>
            <p className=" px-4 font-bold truncate">Lorem </p>
            <p className=" px-4 text-gray-500 text-sm truncate">Lorem </p>
        </div>
        <CheckButton/>
      </div>
    </Card>
  );
}
