
import { members } from "@/components/task/data/members";
import FamilyCard from "@/components/task/newFamilia/familyCard";

export default function CalenderPage() {

  const member = members[0];
  return (
    <div>
      <FamilyCard member={member} />
    </div>
  );
}
