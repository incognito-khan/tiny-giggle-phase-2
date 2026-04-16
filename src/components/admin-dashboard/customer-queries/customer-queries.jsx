"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Plus, Edit, Trash2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAllQueries, updateQuery, deleteQuery } from "@/store/slices/querySlice"
import { useDispatch, useSelector } from "react-redux"
import Loading from "@/components/loading"
import { toast } from "react-toastify"
import { format } from "date-fns/format"
import AdminHeader from "@/components/layout/header/admin-header";


export function CustomerQueries() {
    const user = useSelector((state) => state.auth.user);
    const queries = useSelector((state) => state.query.queries);
    console.log(queries, 'queries')
    const [filteredQueires, setFilteredQueires] = useState(queries);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedFilterStatus, setSelectedFilterStatus] = useState(undefined);
    const [selectedFilterPriority, setSelectedFilterPriority] = useState(undefined);
    const [editQuery, setEditQuery] = useState({
        status: "",
        priority: ""
    })
    const [editingIndex, setEditingIndex] = useState(null);
    const dispatch = useDispatch();

    const handleStatusFilter = (status) => {
        if (!status) {
            setFilteredQueires(queries);
            return;
        }
        if (status === "all") {
            setFilteredQueires(queries);
            return;
        }
        const filtered = queries.filter(query => query?.status === status);
        setFilteredQueires(filtered);
    }

    const handlePriorityFilter = (priority) => {
        if (!priority) {
            setFilteredQueires(queries);
            return;
        }
        if (priority === "all") {
            setFilteredQueires(queries);
            return;
        }
        const filtered = queries.filter(query => query?.priority === priority);
        setFilteredQueires(filtered);
    }

    const clearFilters = () => {
        setFilteredQueires(queries);
        setSearch("");
        setSelectedFilterPriority("");
        setSelectedFilterStatus("");
    }

    const gettingAllQueries = () => {
        dispatch(getAllQueries({ setLoading, search, adminId: user?.id }))
    }

    const handleUpdateQuery = (queryId) => {
        if (!queryId) {
            return;
        }
        if (!editQuery.status && !editQuery.priority) {
            toast.error("Please fill all the fields!")
            return;
        }

        dispatch(updateQuery({ setLoading, adminId: user?.id, body: editQuery, queryId }))
        setEditQuery({
            status: "",
            priority: ""
        });
        setEditingIndex(null);
    };

    const handleDeleteQuery = (queryId) => {
        if (!queryId) {
            return;
        }

        dispatch(deleteQuery({ setLoading, queryId, adminId: user?.id }))
    }

    useEffect(() => {
        gettingAllQueries();
    }, [])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            gettingAllQueries();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [search]);

    useEffect(() => {
        setFilteredQueires(queries);
    }, [queries])

    const formatDate = (date) => {
        return format(date, 'MMM dd, yyyy')
    }

    return (
        <div className="flex h-screen bg-background w-full">
            {loading && <Loading />}
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}

                <div className="px-6 py-4">
                    <AdminHeader title="Inqueries" subTitle="Manage Inqueries" />
                </div>

                {/* Content */}
                <main className="flex-1 p-6">
                    <div className="bg-card rounded-lg border border-border">
                        {/* Category List Header */}
                        <div className="p-6 border-b border-border">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-card-foreground">Inqueries List</h2>
                            </div>

                            {/* Filters */}
                            <div className="grid grid-cols-4 gap-4 items-center">
                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">Search Query</label>
                                    <Input placeholder="Enter query subject or email" value={search} onChange={(e) => setSearch(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">Status</label>
                                    <Select value={selectedFilterStatus} onValueChange={(value) => {
                                        handleStatusFilter(value);
                                        setSelectedFilterStatus(value);
                                    }}>
                                        <SelectTrigger className={`w-[100%]`}>
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="PENDING">Pending</SelectItem>
                                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">Priority</label>
                                    <Select value={selectedFilterPriority} onValueChange={(value) => {
                                        handlePriorityFilter(value);
                                        setSelectedFilterPriority(value);
                                    }}>
                                        <SelectTrigger className={`w-[100%]`}>
                                            <SelectValue placeholder="Select Priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="LOW">Low</SelectItem>
                                            <SelectItem value="MEDIUM">Medium</SelectItem>
                                            <SelectItem value="HIGH">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full mt-7" onClick={clearFilters}>
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        {queries?.length !== 0 && filteredQueires?.length > 0 && !loading && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">NAME</th>
                                            <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">EMAIL</th>
                                            <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">SUBJECT</th>
                                            <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">MESSAGE</th>
                                            <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">STATUS</th>
                                            <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">PRIORITY</th>
                                            <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">CREATED AT</th>
                                            <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredQueires?.map((query, index) => (
                                            <tr key={index} className="border-b border-border hover:bg-muted/50">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-medium text-card-foreground">{query?.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-card-foreground">{query?.email}</td>
                                                <td className="p-4 text-card-foreground">{query?.subject}</td>
                                                <td
                                                    className="p-4 text-card-foreground max-w-xs truncate"
                                                    title={query?.message}
                                                >
                                                    {query?.message}
                                                </td>
                                                <td className="p-4 text-card-foreground">
                                                    {editingIndex === index ? (
                                                        <select
                                                            value={editQuery.status}
                                                            onChange={(e) => setEditQuery({ ...editQuery, status: e.target.value })}
                                                            className="border border-border rounded-md px-2 py-1 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                                        >
                                                            <option value="PENDING">Pending</option>
                                                            <option value="IN_PROGRESS">In Progress</option>
                                                            <option value="RESOLVED">Resolved</option>
                                                        </select>
                                                    ) : (
                                                        <span>{query?.status}</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-card-foreground">
                                                    {editingIndex === index ? (
                                                        <select
                                                            value={editQuery.priority}
                                                            onChange={(e) => setEditQuery({ ...editQuery, priority: e.target.value })}
                                                            className="border border-border rounded-md px-2 py-1 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                                        >
                                                            <option value="LOW">Low</option>
                                                            <option value="MEDIUM">Medium</option>
                                                            <option value="HIGH">High</option>
                                                        </select>
                                                    ) : (
                                                        <span>{query?.priority}</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-card-foreground">{query?.createdAt && formatDate(query?.createdAt)}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        {editingIndex === index ? (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleUpdateQuery(query?.id)}
                                                                    className="bg-green-500 hover:bg-green-600 text-white"
                                                                >
                                                                    Submit
                                                                </Button>

                                                                <Button
                                                                    className="bg-pink-500 hover:bg-pink-600"
                                                                    size="sm"
                                                                    onClick={() => setEditingIndex(null)}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-muted-foreground hover:text-card-foreground"
                                                                onClick={() => {
                                                                    setEditingIndex(index);
                                                                    setEditQuery({
                                                                        status: query?.status,
                                                                        priority: query?.priority
                                                                    })
                                                                }}
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        {editingIndex !== index && (
                                                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive"
                                                                onClick={() => handleDeleteQuery(query?.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {filteredQueires?.length === 0 && !loading && (
                            <div className="p-6">
                                <p className="text-lg font-medium text-gray-500 text-center">
                                    No Query Found
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
