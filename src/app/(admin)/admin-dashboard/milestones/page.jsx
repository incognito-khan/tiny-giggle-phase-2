"use client"

import React, { useMemo, useState, useEffect } from "react"
import { MoreHorizontal, Plus, Eye, Pencil, Trash2, ListPlus, Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useDispatch, useSelector } from "react-redux"
import { createMilestone, getAllMilestonesWithSub, createSubMilestone, updateMilestone, deleteMilestone, updateSubMilestone, deleteSubMilestone } from "@/store/slices/milestoneSlice"
import MilestoneCard from "@/components/milestone/card"
import { uploadImage } from "@/store/slices/mediaSlice"
import Loading from "@/components/loading";
import { toast } from "react-toastify"
import AdminHeader from "@/components/layout/header/admin-header"

// Reusable form for adding/editing a Milestone
function MilestoneForm({ initialValues, onSubmit, onCancel, mode }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(initialValues?.imageUrl || null);
    const [form, setForm] = useState({
        month: initialValues?.month || "",
        title: initialValues?.title || "",
        description: initialValues?.description || "",
    })

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            setPreview(URL.createObjectURL(selectedFile));
        } else {
            setPreview(null);
        }
    };

    function handleChange(e) {
        const { name, value } = e.target
        setForm((f) => ({ ...f, [name]: value }))
    }

    function handleSubmit(e) {
        e.preventDefault()
        onSubmit(form, file, initialValues?.id)
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
                <Label className="mb-2">Milestone Image</Label>
                <div className="flex items-center justify-between w-full border rounded-lg px-3 py-2">
                    <label
                        htmlFor="file-upload"
                        className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm px-4 py-2 rounded cursor-pointer"
                    >
                        Choose File
                    </label>
                    <span className="text-gray-500 text-sm truncate">
                        {file ? file.name : "No file chosen"}
                    </span>
                    <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
                {preview && (
                    <div className="mt-2">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-lg border"
                        />
                    </div>
                )}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="month">Month</Label>
                <Input id="month" name="month" value={form.month} onChange={handleChange} placeholder="e.g., Jan 2026" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" value={form.title} onChange={handleChange} placeholder="Milestone title" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Brief milestone description"
                    rows={4}
                />
            </div>
            <DialogFooter className="mt-2">
                <Button type="button" className="bg-pink-600 hover:bg-pink-500" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">{mode === "edit" ? "Save Changes" : "Add Milestone"}</Button>
            </DialogFooter>
        </form>
    )
}

// Reusable form for adding/editing a Sub-Milestone
function SubMilestoneForm({ initialValues, onSubmit, onCancel, mode = "add" }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(initialValues?.imageUrl);
    const [form, setForm] = useState({
        title: initialValues?.title || "",
        description: initialValues?.description || ""
    })

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            setPreview(URL.createObjectURL(selectedFile));
        } else {
            setPreview(null);
        }
    };

    function handleChange(e) {
        const { name, value } = e.target
        setForm((f) => ({ ...f, [name]: value }))
    }

    function handleSubmit(e) {
        e.preventDefault()
        onSubmit(form, file, initialValues?.id)
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
                <Label className="mb-2">Sub Milestone Image</Label>
                <div className="flex items-center justify-between w-full border rounded-lg px-3 py-2">
                    <label
                        htmlFor="file-upload"
                        className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm px-4 py-2 rounded cursor-pointer"
                    >
                        Choose File
                    </label>
                    <span className="text-gray-500 text-sm truncate">
                        {file ? file.name : "No file chosen"}
                    </span>
                    <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
                {preview && (
                    <div className="mt-2">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-lg border"
                        />
                    </div>
                )}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="subTitle">Title</Label>
                <Input
                    id="subTitle"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Sub-milestone title"
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="subDescription">Description</Label>
                <Textarea
                    id="subDescription"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Short description"
                    rows={3}
                />
            </div>
            <DialogFooter className="mt-2">
                <Button type="button" className="bg-pink-600 hover:bg-pink-500" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">{mode === "edit" ? "Save Changes" : "Add Sub-Milestone"}</Button>
            </DialogFooter>
        </form>
    )
}

export default function Page() {
    const user = useSelector((state) => state.auth.user);
    const miles = useSelector((state) => state.milestone.milestones);
    console.log(miles, 'milestones')
    const [expanded, setExpanded] = useState(() => new Set())
    const [loading, setLoading] = useState(false);;

    // Dialog state for milestone add/edit
    const [milestoneDialog, setMilestoneDialog] = useState({
        open: false,
        mode: "add", // 'add' | 'edit'
        milestone: null,
    })

    // Dialog state for sub-milestone add/edit
    const [subDialog, setSubDialog] = useState({
        open: false,
        parentId: null,
        mode: "add", // 'add' | 'edit'
        subMilestone: null,
    })

    // Dialog state for viewing sub-milestone details
    const [viewDialog, setViewDialog] = useState({
        open: false,
        sub: null,
    })

    const dispatch = useDispatch();

    const gettingAllMilestones = () => {
        dispatch(getAllMilestonesWithSub({ adminId: user?.id, setLoading }))
    }

    useEffect(() => {
        gettingAllMilestones()
    }, [])

    function handleAddMilestoneClick() {
        setMilestoneDialog({ open: true, mode: "add", milestone: null })
    }

    function handleEditMilestone(milestone, e) {
        if (e) e.stopPropagation()
        setMilestoneDialog({ open: true, mode: "edit", milestone })
    }

    function handleDeleteMilestone(id, e) {
        if (e) e.stopPropagation()
        // setMilestones((list) => list.filter((m) => m.id !== id))
        dispatch(deleteMilestone({ setLoading, milestoneId: id, adminId: user?.id }))
    }

    function handleAddSubMilestone(parentId, e) {
        if (e) e.stopPropagation()
        setSubDialog({ open: true, parentId, mode: "add", subMilestone: null })
    }

    function handleEditSubMilestone(parentId, sub, e) {
        if (e) e.stopPropagation()
        setSubDialog({ open: true, parentId, mode: "edit", subMilestone: sub })
    }

    function handleDeleteSubMilestone(parentId, subId, e) {
        if (e) e.stopPropagation()
        dispatch(deleteSubMilestone({ setLoading, milestoneId: parentId, subId, adminId: user?.id }))
    }

    // Milestone form submit handler (add or edit)
    async function submitMilestone(form, file, milestoneId) {
        if (milestoneDialog.mode === "add") {
            console.log(form, file, 'form from submit milestone')

            if (!file) {
                toast.error("Select an Image")
                return;
            }

            const imageUrl = await dispatch(uploadImage({ setLoading, parentId: user?.id, file })).unwrap();

            const formData = {
                ...form,
                month: parseInt(form.month),
                imageUrl
            }

            dispatch(createMilestone({ setLoading, formData, adminId: user?.id }))

        } else if (milestoneDialog.mode === "edit" && milestoneDialog.milestone) {
            if (file) {
                const url = await dispatch(uploadImage({ file, parentId: user?.id, setLoading })).unwrap();
                form.imageUrl = url
            }
            dispatch(updateMilestone({ setLoading, adminId: user?.id, body: form, milestoneId }))
        }
        setMilestoneDialog({ open: false, mode: "add", milestone: null })
    }

    // Sub-milestone form submit handler (add or edit)
    async function submitSubMilestone(form, file, subId) {
        const pid = subDialog.parentId
        if (!pid) return

        if (subDialog.mode === "edit" && subDialog.subMilestone) {
            if (file) {
                const url = await dispatch(uploadImage({ setLoading, parentId: user?.id, file })).unwrap();
                form.imageUrl = url
            }

            dispatch(updateSubMilestone({ milestoneId: pid, subId, setLoading, body: form, adminId: user?.id }))
            setSubDialog({ open: false, parentId: null, mode: "add", subMilestone: null })
            return
        }

        const imageUrl = await dispatch(uploadImage({ setLoading, parentId: user?.id, file })).unwrap();

        const formData = {
            ...form,
            imageUrl
        }

        dispatch(createSubMilestone({ setLoading, adminId: user?.id, milestoneId: pid, formData }))

        setExpanded((prev) => {
            const next = new Set(prev)
            next.add(pid)
            return next
        })
        setSubDialog({ open: false, parentId: null, mode: "add", subMilestone: null })
    }

    return (
        <main className="mx-auto w-full p-6 md:p-8">
            {loading && <Loading />}
            <AdminHeader title="Milestones" subTitle="Manage milestones and sub-milestones" />
            <div className="mb-6 mt-7 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-lg">Milestones List</h3>
                </div>
                <Button onClick={handleAddMilestoneClick}>
                    <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                    Add Milestone
                </Button>
            </div>

            <section className="rounded-lg border">
                <Table>
                    <TableCaption className="sr-only">Milestone list</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-24">Month</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-12 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <MilestoneCard miles={miles} handleEditMilestone={handleEditMilestone} handleDeleteMilestone={handleDeleteMilestone} handleAddSubMilestone={handleAddSubMilestone} handleEditSubMilestone={handleEditSubMilestone} handleDeleteSubMilestone={handleDeleteSubMilestone} />
                    </TableBody>
                </Table>
            </section>

            {/* Milestone Dialog */}
            <Dialog
                open={milestoneDialog.open}
                onOpenChange={(open) => {
                    if (!open) setMilestoneDialog({ open: false, mode: "add", milestone: null })
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{milestoneDialog.mode === "edit" ? "Edit Milestone" : "Add Milestone"}</DialogTitle>
                        <DialogDescription>
                            {milestoneDialog.mode === "edit"
                                ? "Update the fields below to modify the milestone."
                                : "Fill out the form to add a new milestone."}
                        </DialogDescription>
                    </DialogHeader>
                    <MilestoneForm
                        mode={milestoneDialog.mode}
                        initialValues={milestoneDialog.milestone}
                        onSubmit={submitMilestone}
                        onCancel={() => setMilestoneDialog({ open: false, mode: "add", milestone: null })}

                    />
                </DialogContent>
            </Dialog>

            {/* Sub-Milestone Dialog */}
            <Dialog
                open={subDialog.open}
                onOpenChange={(open) => {
                    if (!open) setSubDialog({ open: false, parentId: null, mode: "add", subMilestone: null })
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{subDialog.mode === "edit" ? "Edit Sub-Milestone" : "Add Sub-Milestone"}</DialogTitle>
                        <DialogDescription>
                            {subDialog.mode === "edit"
                                ? "Update the fields below to modify the sub-milestone."
                                : "Provide a title, description, and optional image URL."}
                        </DialogDescription>
                    </DialogHeader>
                    <SubMilestoneForm
                        mode={subDialog.mode}
                        initialValues={subDialog.subMilestone}
                        onSubmit={submitSubMilestone}
                        onCancel={() => setSubDialog({ open: false, parentId: null, mode: "add", subMilestone: null })}
                        milestoneId={subDialog.parentId}
                    />
                </DialogContent>
            </Dialog>

           
        </main>
    )
}
