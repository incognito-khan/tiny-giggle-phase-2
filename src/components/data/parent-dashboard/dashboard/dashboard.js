// Chart data
export const growthData = [
  { month: "Jan", height: 65, weight: 6.5 },
  { month: "Feb", height: 67, weight: 7.2 },
  { month: "Mar", height: 69, weight: 7.8 },
  { month: "Apr", height: 71, weight: 8.3 },
  { month: "May", height: 73, weight: 8.9 },
  { month: "Jun", height: 75, weight: 9.2 },
  { month: "Jul", height: 76, weight: 9.6 },
  { month: "Aug", height: 78, weight: 10.1 },
  { month: "Sep", height: 79, weight: 10.4 },
]

export const childrenData = [
  { month: "Jan", infant: 15000, toddler: 25000, preschool: 18000 },
  { month: "Feb", infant: 22500, toddler: 18000, preschool: 25000 },
  { month: "Mar", infant: 18000, toddler: 28000, preschool: 22000 },
  { month: "Apr", infant: 28000, toddler: 32000, preschool: 35000 },
  { month: "May", infant: 25000, toddler: 38000, preschool: 28000 },
  { month: "Jun", infant: 35000, toddler: 42000, preschool: 38000 },
]

export const programsData = [
  { name: "Feeding Time", value: 35, color: "#ec4899" },
  { name: "Sleep Schedule", value: 30, color: "#8b5cf6" },
  { name: "Play Activities", value: 25, color: "#06b6d4" },
  { name: "Learning", value: 10, color: "#10b981" },
]

export const chartConfig = {
  height: {
    label: "Height (cm)",
    color: "hsl(var(--chart-1))",
  },
  weight: {
    label: "Weight (kg)",
    color: "hsl(var(--chart-2))",
  },
  infant: {
    label: "Infant",
    color: "#ec4899",
  },
  toddler: {
    label: "Toddler",
    color: "#10b981",
  },
  preschool: {
    label: "Preschool",
    color: "#3b82f6",
  },
}

export const babyList = [
  { name: "Emma Johnson", age: "2y", date: "Jun 30, 2024", parent: "Sarah Johnson" },
  { name: "Liam Smith", age: "8m", date: "Aug 15, 2024", parent: "David Smith" },
  { name: "Mia Larson", age: "1y", date: "Sep 01, 2024", parent: "John Larson" },
  { name: "Noah Green", age: "6m", date: "Jun 30, 2024", parent: "Helen Green" },
  { name: "Ava Turner", age: "3y", date: "Aug 20, 2024", parent: "Lisa Turner" },
]