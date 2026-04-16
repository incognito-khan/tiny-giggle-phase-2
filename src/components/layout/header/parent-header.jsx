import React from 'react'
import { Bell, MessageCircle, Search, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

function ParentHeader() {
    const cartItems = useSelector((state) => state.cart.cart);
    const user = useSelector((state) => state.auth.user);
    console.log(cartItems, 'cartItems')
    const router = useRouter();
    return (
        <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
                        <h1>Hello, {user?.name?.split(" ")[0]}!</h1>
                    </h1>
                    <p className="text-gray-600 text-sm lg:text-base">
                        Here are all your little ones and their precious details
                    </p>
                </div>

                <div className="flex items-center gap-2 lg:gap-4">
                    <div className="relative flex-1 lg:flex-none">
                        <Search className="w-4 h-4 lg:w-5 lg:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search anything here"
                            className="pl-8 lg:pl-10 w-full lg:w-80 bg-gray-50 border-gray-200 rounded-full text-sm"
                        />
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative rounded-full"
                    >
                        <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
                        <Badge className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 p-0 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">
                            3
                        </Badge>
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative rounded-full cursor-pointer"
                        onClick={() => router.push('/parent-dashboard/cart')}
                    >
                        <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
                        <Badge className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 p-0 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                            {cartItems?.length}
                        </Badge>
                    </Button>

                    <div className="hidden lg:flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src="/placeholder.svg?height=40&width=40" />
                            <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white">
                                {user?.name
                                    ? user.name
                                        .split(" ")
                                        .slice(0, 2) // take max 2 words
                                        .map((n) => n[0].toUpperCase()) // take first letter of each
                                        .join("")
                                    : "?"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-gray-800">{user?.name}</p>
                            <p className="text-sm text-green-500">Online</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default ParentHeader;
