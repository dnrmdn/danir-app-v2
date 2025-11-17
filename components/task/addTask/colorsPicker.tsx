import { useState } from "react";

interface ColorPickerProps {
  onSelect: (index: number) => void;
}

export default function ColorPicker({ onSelect }: ColorPickerProps) {
  const colors = [
    "#93c5fd", // blue-300
    "#fca5a5", // red-300
    "#86efac", // green-300
    "#fde047", // yellow-300
    "#c4b5fd", // purple-300
    "#f9a8d4", // pink-300
    "#a5b4fc", // indigo-300
    "#5eead4", // teal-300
    "#fdba74", // orange-300
    "#d1d5db", // gray-300
  ];

  
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    setSelected(index);
    onSelect(index);
  };

  return (
    <div className="grid grid-cols-5 gap-4 p-4 bg-gray-100 rounded-xl max-w-full">
      {colors.map((color, index) => (
        <div
          key={index}
          onClick={() => handleSelect(index)}
          className={`w-10 h-10 rounded-full cursor-pointer transition-all duration-200 border-2 ${
            selected === index ? "border-white border-4 scale-100" : "border-transparent"
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}
