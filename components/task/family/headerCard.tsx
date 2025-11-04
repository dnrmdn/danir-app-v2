export default function HeaderCard() {
  const member = {
    name: "Dani Ramdani",
    CheckIcon: "bg-red-300",
  };

  // Ambil nama depan
  const firstName = member.name.split("")[0];

  return (
    <div className="bg-blue-300 max-w-[400px] h-[500px] rounded-4xl">
      <div className="flex p-5">
        <div
        className={`relative w-20 h-20 rounded-full ${member.CheckIcon} flex items-center justify-center`}
      >
        <p className="font-bold text-white text-3xl">{firstName}</p>
      </div>
      <div className="w-50 h-20">
        <p className="text-2xl pl-2">{member.name}</p>
        <div className="flex p-2 justify-around">
            <div className="bg-blue-100 w-20 h-8 rounded-lg flex items-center justify-center">Danir</div>
            <div className="bg-blue-100 w-20 h-8 rounded-lg flex items-center justify-center">Danir</div>
        </div>
      </div>
      </div>
    </div>
  );
}
