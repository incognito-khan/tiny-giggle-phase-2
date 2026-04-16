"use client"

import { Button } from "@/components/ui/button"

// const categories = [
//   { id: 1, name: "All Products"},
//   { id: 2, name: "Feeding"},
//   { id: 3, name: "Clothing"},
//   { id: 4, name: "Toys"},
//   { id: 5, name: "Bath & Care"},
//   { id: 6, name: "Sleep"},
//   { id: 7, name: "Safety"},
//   { id: 8, name: "Strollers"},
//   { id: 9, name: "Car Seats"},
//   { id: 10, name: "Nursery"},
// ]

export default function CategoryTabs({ activeCategory, onCategoryChange, categories, type }) {
  const allCategories = [{ id: 1, name: `All ${type}` }, ...categories];
  return (
    <div className="w-full bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {allCategories?.map((category) => (
            <Button
              key={category?.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              className={`
                flex-shrink-0 rounded-2xl px-6 py-3 text-sm font-medium cursor-pointer transition-all duration-200 shadow-sm
                ${
                  activeCategory === category?.id
                    ? "bg-pink-500 text-white shadow-md hover:bg-pink-600"
                    : "border-border hover:bg-pink-500 hover:text-white"
                }
              `}
              onClick={() => onCategoryChange(category?.id)}
            >
              <span className="whitespace-nowrap">{category?.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
