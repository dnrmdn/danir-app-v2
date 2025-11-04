import { members } from "../data/members";

export default function HollyCard() {
  return (
    <div>
        {members.map((member, i) => (
            <div key={i} className="flex-none scroll-ml-4">Anjayaaaaaa</div>
        ))}
    </div>
  )
}
