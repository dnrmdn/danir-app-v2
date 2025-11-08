"use client";

import { Card } from "@/components/ui/card";
import HeaderCard from "./headerCard";
import TaskCard from "./taskCard";
import { Member } from "@/types/typeData";
import { members } from "../data/members";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue } from "framer-motion";

function useScrollConstraints(ref: React.RefObject<HTMLDivElement>) {
  const [constraints, setConstraints] = useState({ left: 0, right: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element || !element.firstElementChild) return;

    const updateConstraints = () => {
      const viewportWidth = element.offsetWidth;
      const content = element.firstElementChild as HTMLElement;
      const contentWidth = content.scrollWidth;

      // 💡 Deteksi ukuran layar
      const screenWidth = window.innerWidth;
      let offset = 0;

      // Sesuaikan offset berdasarkan device
      if (screenWidth >= 1024) {
        // Desktop
        offset = 0; // tidak perlu tambahan
      } else if (screenWidth >= 640) {
        // Tablet
        offset = 200; // supaya pas di tengah
      } else {
        // Mobile
        offset = 0; // normal tanpa tambahan
      }

      const totalWidth = contentWidth + offset;

      setConstraints({
        left: Math.min(0, viewportWidth - totalWidth),
        right: 0,
      });
    };

    updateConstraints();
    window.addEventListener("resize", updateConstraints);
    return () => window.removeEventListener("resize", updateConstraints);
  }, [ref]);

  return constraints;
}

export default function FamilyCard({ member }: { member: Member }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const { left, right } = useScrollConstraints(ref);

  if (!member) {
    return <div className="p-4">No member provided</div>;
  }

  // Maksimal 4 card di layar besar
  const maxVisibleCards = 4;
  const enableDrag = members.length > maxVisibleCards;

  return (
    <div className="overflow-hidden" ref={ref}>
      <motion.div
        drag={enableDrag ? "x" : false}
        dragConstraints={{ left, right }}
        style={{ x }}
        className="scrollable"
      >
        <div className="flex gap-6 p-4 scroll-smooth">
          {members.map((person, index) => (
            <Card
              key={index}
              className={`flex flex-col rounded-3xl ${person.bgColor} transition-all duration-300`}
              style={{
                height: "90vh",
                flex: "0 0 auto",
                width: "calc(100% / 1.1)",
                maxWidth: "400px",
              }}
            >
              <HeaderCard member={person} />
              <div className="px-4 overflow-y-auto h-full rounded-[40px] space-y-4 no-scrollbar">
                {person.tasks.map((task, i) => (
                  <TaskCard
                    key={`${person.name}-${task.label}-${i}`}
                    task={task}
                    member={person}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      <style jsx>{`
        @media (min-width: 640px) {
          /* Tablet: 2 card */
          .scrollable > div > div {
            width: calc(50% - 1rem);
          }
        }
        @media (min-width: 1024px) {
          /* Desktop: 4 card */
          .scrollable > div > div {
            width: calc(25% - 1rem);
          }
        }
      `}</style>
    </div>
  );
}
