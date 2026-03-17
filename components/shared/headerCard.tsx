import { Member } from "@/types/domain";

type HeaderCardProps = {
  member: Member;
  children?: React.ReactNode; // konten khusus (progress bar / star bar)
};

export default function HeaderCard({ member, children }: HeaderCardProps) {
  return (
    <div className="flex items-center px-4 py-2">
      {/* Avatar */}
      <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full ${member.iconColor} flex items-center justify-center`}>
        <p className="font-bold text-white text-lg sm:text-xl">{member.name[0]}</p>
      </div>

      <div className="flex flex-col flex-1 ml-3">
        <p className="text-lg sm:text-xl font-semibold">{member.name}</p>

        {/* Konten dynamic */}
        {children}
      </div>
    </div>
  );
}

