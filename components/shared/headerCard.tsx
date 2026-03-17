import { Member } from "@/types/domain";

type HeaderCardProps = {
  member: Member;
  children?: React.ReactNode;
};

export default function HeaderCard({ member, children }: HeaderCardProps) {
  return (
    <div className="border-b border-black/5 px-5 py-4">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${member.iconColor} shadow-sm sm:h-14 sm:w-14`}>
          <p className="text-lg font-black text-white sm:text-xl">{member.name[0]}</p>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-lg font-black text-slate-800 sm:text-xl">{member.name}</p>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Personal board</p>
          <div className="mt-2">{children}</div>
        </div>
      </div>
    </div>
  );
}
