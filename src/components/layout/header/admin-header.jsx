import React from 'react'
import { useSelector } from 'react-redux';
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react"

const AdminHeader = ({ title, subTitle }) => {
    const user = useSelector((state) => state.auth.user);

    const getAvatarLetters = (name) => {
        if (!name) return "";
        const letters = name.slice(0, 2); // get first 2 letters
        return letters.toUpperCase();
    }

    return (
        <header className="bg-background border-b border-border flex items-center justify-between">
            <div>
                <h1 className="text-balance text-2xl font-semibold tracking-tight">{title}</h1>
                <p className="text-muted-foreground">{subTitle}.</p>
            </div>

            <div className="flex items-center gap-4">
                {/* <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-10 w-64" />
                </div> */}
                <Avatar className="w-10 h-10">
                    {user?.avatarUrl ? (
                        <AvatarImage src={user.avatarUrl} />
                    ) : (
                        <AvatarFallback>{getAvatarLetters(user?.name)}</AvatarFallback>
                    )}
                </Avatar>
                <div className="text-right">
                    <div className="font-medium text-foreground">{user?.name}</div>
                    <div className="text-sm text-muted-foreground">
                        {user?.role === 'artist'
                            ? "ARTIST"
                            : user?.role === 'supplier'
                                ? "SUPPLIER"
                                : "ADMIN"
                        }
                    </div>

                </div>
            </div>
        </header>
    )
}

export default AdminHeader;
