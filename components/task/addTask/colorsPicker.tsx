import { useState } from "react";

export default function ColorPicker() {
  const colors = [
    "#e74c3c", "#d35400", "#f1c40f", "#1abc9c",
    "#e67e22", "#f39c12", "#f7dc6f", "#76d7c4",
    "#27ae60", "#48c9b0", "#5dade2", "#3498db",
    "#9b59b6", "#af7ac5", "#ec7063", "#95a5a6"
  ];

  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-5 gap-4 p-4 bg-gray-100 rounded-xl max-w-full">
      {colors.map((color) => (
        <div
          key={color}
          onClick={() => setSelected(color)}
          className={`w-10 h-10 rounded-full cursor-pointer transition-all duration-200 border-2 ${
            selected === color ? "border-gray-700 scale-110" : "border-transparent"
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}
