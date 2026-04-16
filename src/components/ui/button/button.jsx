"use client"

export default function CustomButton({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className = "",
}) {
  const baseStyles = "font-bold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg"

  const variants = {
    primary: "bg-brand hover:bg-orange-600 text-white",
    secondary: "bg-secondary hover:bg-purple-700 text-white",
  }

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  }

  return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  )
}
