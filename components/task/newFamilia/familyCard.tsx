"use client"; 

import { Card } from "@/components/ui/card";
import HeaderCard from "./headerCard";
import TaskCard from "./taskCard";
import { Member } from "@/types/typeData";
import { members } from "../data/members";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue } from "framer-motion";

export default function FamilyCard({ member }: { member: Member }) {
  /**
   * Custom hook: useScrollConstraints
   * ----------------------------------
   * Tujuan:
   *  - Menghitung batas kiri dan kanan untuk drag horizontal (x-axis)
   *  - Agar konten tidak bisa di-drag keluar dari area tampilan
   *
   * Parameter:
   *  - ref → referensi ke elemen wrapper (viewport)
   *
   * Output:
   *  - { left, right } → nilai batas drag pada sumbu X
   */

  function useScrollConstraints(ref) {
    const [constraints, setConstraints] = useState({ left: 0, right: 0 });

    useEffect(() => {
      const element = ref.current;
      if (!element) return;

      // Lebar tampilan yang terlihat (viewport)
      const viewportWidth = element.offsetWidth;

      // Lebar konten sebenarnya di dalam wrapper
      const contentWidth = element.firstChild.scrollWidth + 200;

      // Hitung batas kiri dan kanan
      // Misal konten lebih panjang dari viewport, maka 'left' akan bernilai negatif
      setConstraints({ left: viewportWidth - contentWidth, right: 0 });
    }, []);

    return constraints;
  }

  // useMotionValue: menyimpan posisi X (horizontal offset) yang bisa diubah dengan Framer Motion
  const x = useMotionValue(0);

  // Ref ke elemen pembungkus utama (digunakan untuk hitung constraint)
  const ref = useRef(null);

  // Ambil nilai batas kiri dan kanan dari custom hook di atas
  const { left, right } = useScrollConstraints(ref);

  

  /**
   * handleWheel (optional)
   * ----------------------
   * Fungsi untuk menangani scroll dengan mouse wheel
   * - Ketika pengguna scroll vertikal (deltaY), kita ubah jadi pergeseran horizontal (X)
   * - clamp() menjaga posisi X agar tidak keluar dari batas kiri/kanan
   */
  // function handleWheel(event) {
  //   event.preventDefault();
  //   const newX = x.get() - event.deltaY; // gunakan deltaY untuk geser horizontal
  //   const clampedX = clamp(left, right, newX);
  //   x.stop(); // hentikan animasi sebelumnya
  //   x.set(clampedX); // set posisi baru
  // }

  // Jika tidak ada member diberikan ke komponen, tampilkan fallback text
  if (!member) {
    return <div className="p-4">No member provided</div>;
  }

  /**
   * Bagian utama render komponen
   * ----------------------------
   * Struktur:
   *  - <div> utama: pembungkus yang menyembunyikan overflow (hanya tampil area viewport)
   *  - <motion.div>: elemen yang bisa di-drag secara horizontal
   *  - Di dalamnya ada list member (Card) yang ditampilkan berdampingan
   */
  return (
    <div className="overflow-hidden" ref={ref}>
      <motion.div
        drag="x" // aktifkan drag horizontal
        dragConstraints={{ left, right }} // batasi pergerakan sesuai hasil perhitungan
        className="scrollable"
        style={{ x }} // hubungkan nilai motionValue agar posisi X bisa berubah dinamis
      >
        {/* Wrapper untuk semua Card member */}
        <div className="flex gap-6 p-4 scroll-smooth">
          {/* Render semua anggota keluarga (member) */}
          {members.map((member, index) => (
            <Card key={index} className={`max-w-[400px] h-[90vh] ${member.bgColor} rounded-4xl flex flex-col`}>
              {/* Header setiap kartu */}
              <HeaderCard member={member} />

              {/* Daftar task milik member, bisa di-scroll vertikal */}
              <div className="px-4 overflow-y-auto max-w-[400px] h-[90vh] rounded-[50px] space-y-4 no-scrollbar">
                {member.tasks.map((task, i) => (
                  <TaskCard key={`${member.name}-${task.label}-${i}`} task={task} member={member} />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
