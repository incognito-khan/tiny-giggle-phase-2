import React, { useState } from 'react'
import { MoreHorizontal, Check, Eye, Pencil, Trash2, ListPlus, Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { format } from 'date-fns';

const MilestoneCard = ({ miles, handleEditMilestone, handleDeleteMilestone, handleAddSubMilestone, handleEditSubMilestone, handleDeleteSubMilestone, parent = false, handleShowMileStatus }) => {
    const [expanded, setExpanded] = useState(() => new Set())

    const [viewDialog, setViewDialog] = useState({
        open: false,
        sub: null,
    })

    function toggleExpand(id) {
        setExpanded((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    function handleViewMilestone(id, e) {
        if (e) e.stopPropagation()
        toggleExpand(id)
    }

    function handleViewSubMilestone(sub, e) {
        if (e) e.stopPropagation()
        setViewDialog({ open: true, sub })
    }

    const formatDate = (date) => {
        if (!date) return;

        return format(date, 'MMM dd, yyyy')
    }
    return (
        <>
            {miles?.map((m) => {
                const isExpanded = expanded.has(m?.id)
                return (
                    <React.Fragment key={m?.id}>
                        <TableRow className="cursor-pointer hover:bg-muted/40" onClick={() => toggleExpand(m.id)}>
                            <TableCell className="font-medium">{m?.month}</TableCell>
                            <TableCell>{m?.title}</TableCell>
                            <TableCell className="text-muted-foreground">
                                <span className="line-clamp-2">{m?.description}</span>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon" aria-label="Open actions menu">
                                            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {!parent && (
                                            <DropdownMenuItem onClick={(e) => handleEditMilestone(m, e)}>
                                                <Pencil className="mr-2 h-4 w-4" aria-hidden="true" /> Edit
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={(e) => handleViewMilestone(m.id, e)}>
                                            <Eye className="mr-2 h-4 w-4" aria-hidden="true" /> View
                                        </DropdownMenuItem>
                                        {!parent && (
                                            <>
                                                <DropdownMenuItem onClick={(e) => handleAddSubMilestone(m.id, e)}>
                                                    <ListPlus className="mr-2 h-4 w-4" aria-hidden="true" /> Add Sub-Milestone
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={(e) => handleDeleteMilestone(m.id, e)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" /> Delete
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>

                        {/* Expanded content for sub-milestones */}
                        <TableRow className="bg-transparent">
                            <TableCell colSpan={4} className="p-0">
                                <AnimatePresence initial={false}>
                                    {isExpanded && (
                                        <motion.div
                                            key={`${m?.id}-details`}
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            transition={{ duration: 0.18 }}
                                            className="border-t"
                                        >
                                            <div className="bg-gray-50">
                                                <div className="border-l-4 border-pink-300 p-4">
                                                    <div className="mb-3 flex items-start gap-4">
                                                        {m?.imageUrl ? (
                                                            <img
                                                                src={m.imageUrl || "/placeholder.svg"}
                                                                alt={`Milestone ${m?.title}`}
                                                                className="h-16 w-28 rounded-md object-cover"
                                                            />
                                                        ) : null}
                                                        <div className="text-sm text-muted-foreground">
                                                            <strong className="text-foreground">Details:</strong>{" "}
                                                            {m?.description || "No additional details."}
                                                        </div>
                                                    </div>

                                                    <div className="rounded-md border bg-card">
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead className="text-sm">Sub-Milestone</TableHead>
                                                                    <TableHead className="text-sm">Description</TableHead>
                                                                    {parent && (
                                                                        <>
                                                                            <TableHead className="text-sm">Status</TableHead>
                                                                            <TableHead className="text-sm">Achieved At</TableHead>
                                                                        </>
                                                                    )}
                                                                    <TableHead className="text-sm w-40">Image</TableHead>
                                                                    <TableHead className="text-sm w-12 text-right">Actions</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {m?.subMilestones && m?.subMilestones.length > 0 ? (
                                                                    m?.subMilestones.map((s) => (
                                                                        <TableRow key={s.id}>
                                                                            <TableCell className="text-sm">{s?.title}</TableCell>
                                                                            <TableCell className="text-sm text-muted-foreground">
                                                                                <span className="line-clamp-2">{s?.description}</span>
                                                                            </TableCell>
                                                                            {parent && s?.isCompleted ? (
                                                                                <>
                                                                                    <TableCell className="text-sm">Achieved</TableCell>
                                                                                    <TableCell className="text-sm">{formatDate(s?.achievedAt)}</TableCell>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <TableCell className="text-sm text-muted-foreground">Unachieved</TableCell>
                                                                                    <TableCell className="text-sm text-muted-foreground">—</TableCell>
                                                                                </>
                                                                            )}
                                                                            <TableCell className="text-sm">
                                                                                {s?.imageUrl ? (
                                                                                    <img
                                                                                        src={s?.imageUrl || "/placeholder.svg"}
                                                                                        alt={`Sub-milestone ${s?.title}`}
                                                                                        className="h-12 w-24 rounded object-cover"
                                                                                    />
                                                                                ) : (
                                                                                    <span className="text-muted-foreground">—</span>
                                                                                )}
                                                                            </TableCell>
                                                                            <TableCell className="text-right">
                                                                                <DropdownMenu>
                                                                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                                        <Button variant="ghost" size="icon" aria-label="Open actions menu">
                                                                                            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                                                                                        </Button>
                                                                                    </DropdownMenuTrigger>
                                                                                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                                        <DropdownMenuSeparator />
                                                                                        {!parent ? (
                                                                                            <>
                                                                                                <DropdownMenuItem onClick={(e) => handleEditSubMilestone(m.id, s, e)}>
                                                                                                    <Pencil className="mr-2 h-4 w-4" aria-hidden="true" /> Edit
                                                                                                </DropdownMenuItem>
                                                                                                <DropdownMenuItem onClick={(e) => handleViewSubMilestone(s, e)}>
                                                                                                    <Eye className="mr-2 h-4 w-4" aria-hidden="true" /> View
                                                                                                </DropdownMenuItem>
                                                                                                <DropdownMenuSeparator />
                                                                                                <DropdownMenuItem
                                                                                                    className="text-destructive"
                                                                                                    onClick={(e) => handleDeleteSubMilestone(m.id, s.id, e)}
                                                                                                >
                                                                                                    <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" /> Delete
                                                                                                </DropdownMenuItem>
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                <DropdownMenuItem onClick={(e) => handleViewSubMilestone(s, e)}>
                                                                                                    <Eye className="mr-2 h-4 w-4" aria-hidden="true" /> View
                                                                                                </DropdownMenuItem>
                                                                                                <DropdownMenuItem onClick={(e) => handleShowMileStatus(e, s?.isCompleted ? false : true, s?.id)}>
                                                                                                    <Check className="mr-2 h-4 w-4" aria-hidden="true" />
                                                                                                    {s?.isCompleted ? (
                                                                                                        "Unachieved"
                                                                                                    ) : (
                                                                                                        "Achieved"
                                                                                                    )}
                                                                                                </DropdownMenuItem>
                                                                                            </>
                                                                                        )}
                                                                                    </DropdownMenuContent>
                                                                                </DropdownMenu>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))
                                                                ) : (
                                                                    <TableRow>
                                                                        <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                                                                            No sub-milestones yet. Use the menu to add one.
                                                                        </TableCell>
                                                                    </TableRow>
                                                                )}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </TableCell>
                        </TableRow>
                    </React.Fragment>
                )
            })}

            {/* View Sub-Milestone Dialog */}
            <Dialog
                open={viewDialog.open}
                onOpenChange={(open) => {
                    if (!open) setViewDialog({ open: false, sub: null })
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{viewDialog.sub?.title || "Sub-Milestone"}</DialogTitle>
                        <DialogDescription className="sr-only">Sub-milestone details</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3">
                        {viewDialog.sub?.imageUrl ? (
                            <img
                                src={viewDialog.sub.imageUrl || "/placeholder.svg"}
                                alt={`Sub-milestone ${viewDialog.sub.title}`}
                                className="h-36 w-full rounded-md object-cover"
                            />
                        ) : null}
                        <p className="text-sm text-muted-foreground">{viewDialog.sub?.description || "No additional details."}</p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )

}

export default MilestoneCard;
