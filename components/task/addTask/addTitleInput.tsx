import { SortAsc } from 'lucide-react'

export default function AddTitleInput() {
  return (
    <div>
        <div className="bg-gray-100 rounded-lg">
        <div className="flex max-w-full items-center px-4 gap-2">
          <SortAsc size={30}/>
          <div className="flex-1 pt-2">
            <p className="text-sm px-2 text-gray-400">Title</p>
            <input
        type="text"
        placeholder="Create your task title here..."
        className="w-full h-10 mb-1 px-2 rounded-md text-xl transparent focus:outline-none"
      />
          </div>
        </div>
      </div>
    </div>
  )
}
