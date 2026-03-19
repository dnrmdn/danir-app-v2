import { Member } from "@/types/domain";

import { useLanguage } from "@/components/language-provider";

type HeaderCardProps = {
  member: Member;
  children?: React.ReactNode;
};

const contentHeader = {
  id: { personal: "Papan personal" },
  en: { personal: "Personal board" }
};

export default function HeaderCard({ member, children }: HeaderCardProps) {
  const { locale } = useLanguage();
  const t = contentHeader[locale];

  return (
    <div className="border-b border-black/5 dark:border-white/10 px-5 py-4">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${member.iconColor} shadow-sm sm:h-14 sm:w-14`}>
          <p className="text-lg font-black text-white sm:text-xl">{member.name[0]}</p>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-lg font-black text-slate-800 dark:text-white sm:text-xl">{member.name}</p>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t.personal}</p>
          <div className="mt-2">{children}</div>
        </div>
      </div>
    </div>
  );
}
