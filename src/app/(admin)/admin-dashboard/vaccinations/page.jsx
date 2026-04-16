"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Plus, Eye, Pencil, Trash2, ListPlus, Search } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import Loading from "@/components/loading"
import { useDispatch, useSelector } from "react-redux"
import { createVaccination, getAllVaccinations, updateVaccination, deleteVaccination } from "@/store/slices/vaccinationSlice"
import AdminHeader from "@/components/layout/header/admin-header"

const COUNTRIES = ["Pakistan", "USA", "UAE"]
const MONTHS = ["At Birth (Month 1)", "Month 2", "Month 4", "Month 6", "Month 12", "Month 18", "Year 5"]
const ADMIN_SITES = ["by-mouth", "right-upper-arm", "thigh"]

const fakeDelay = (ms = 350) => new Promise((res) => setTimeout(res, ms))

const monthOrder = (m) => (MONTHS.indexOf(m) === -1 ? 999 : MONTHS.indexOf(m))
const countryOrder = (c) => {
    const idx = COUNTRIES.indexOf(c)
    return idx === -1 ? 999 : idx
}

function toTitleCaseHyphenated(s) {
    if (!s) return ""
    return s
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
}

function groupByCountryMonth(items) {
    const grouped = {}
    for (const item of items) {
        const country = item.country || "Unknown"
        const month = item.month || "Unknown"
        if (!grouped[country]) grouped[country] = {}
        if (!grouped[country][month]) grouped[country][month] = []
        grouped[country][month].push(item)
    }
    return grouped
}

export default function VaccinationsPage() {
    const user = useSelector((state) => state.auth.user);
    const vacs = useSelector((state) => state.vaccination.vaccinations);
    console.log(vacs, 'vacs')
    const [vaccinations, setVaccinations] = useState([])
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null)
    const [opError, setOpError] = useState(null)

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [editing, setEditing] = useState(null)
    const [deleteId, setDeleteId] = useState(null)

    const [form, setForm] = useState({
        title: "",
        administrationSite: ADMIN_SITES[0],
        month: MONTHS[0],
        country: COUNTRIES[0],
    })

    const [expanded, setExpanded] = useState({}) // key: `${country}::${month}` -> boolean
    const dispatch = useDispatch();

    const gettingAllVaccinations = () => {
        dispatch(getAllVaccinations({ setLoading, adminId: user?.id }))
    }

    useEffect(() => {
        if (!user?.id) return
        gettingAllVaccinations()
    }, [user?.id])

    useEffect(() => {
        if (!vacs || vacs.length === 0) return

        // replace dummy with API data
        setVaccinations(vacs)

        // Expand by default all months that have data
        const defaults = {}
        const grouped = groupByCountryMonth(vacs)
        Object.entries(grouped).forEach(([country, months]) => {
            Object.entries(months).forEach(([month, arr]) => {
                if (arr.length > 0) defaults[`${country}::${month}`] = true
            })
        })
        setExpanded({})
    }, [vacs])


    const grouped = useMemo(() => groupByCountryMonth(vaccinations), [vaccinations])

    function openAddForm() {
        setEditing(null)
        setForm({
            title: "",
            administrationSite: ADMIN_SITES[0],
            month: MONTHS[0],
            country: COUNTRIES[0],
            note: "",
        })
        setIsFormOpen(true)
    }

    function openEditForm(item) {
        setEditing(item)
        const siteReverseMap = {
            BY_MOUTH: "by-mouth",
            RIGHT_UPPER_ARM: "right-upper-arm",
            THIGH: "thigh",
        }

        const monthReverseMap = {
            AT_BIRTH: "At Birth (Month 1)",
            MONTH_2: "Month 2",
            MONTH_4: "Month 4",
            MONTH_6: "Month 6",
            MONTH_12: "Month 12",
            MONTH_18: "Month 18",
            YEAR_5: "Year 5",
        }

        const countryReverseMap = {
            PAKISTAN: "Pakistan",
            USA: "USA",
            UAE: "UAE",
        }
        setForm({
            title: item.name || "",
            administrationSite: siteReverseMap[item.administrationSite] || ADMIN_SITES[0],
            month: monthReverseMap[item.month] || MONTHS[0],
            country: countryReverseMap[item.country] || COUNTRIES[0],
            note: item.note || "",
        })
        setIsFormOpen(true)
    }

    function onFormChange(key, value) {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitting(true)
        setOpError(null)

        const siteMap = {
            "by-mouth": "BY_MOUTH",
            "right-upper-arm": "RIGHT_UPPER_ARM",
            "thigh": "THIGH",
        }

        const monthMap = {
            "At Birth (Month 1)": "AT_BIRTH",
            "Month 2": "MONTH_2",
            "Month 4": "MONTH_4",
            "Month 6": "MONTH_6",
            "Month 12": "MONTH_12",
            "Month 18": "MONTH_18",
            "Year 5": "YEAR_5",
        }

        const countryMap = {
            "Pakistan": "PAKISTAN",
            "USA": "USA",
            "UAE": "UAE",
        }

        if (editing) {
            const formData = {
                name: form.title.trim(),
                administrationSite: siteMap[form.administrationSite] || "BY_MOUTH",
                month: monthMap[form.month] || "AT_BIRTH",
                country: countryMap[form.country] || "PAKISTAN",
            }

            await dispatch(updateVaccination({ vaccinationId: editing.id, formData, setLoading, adminId: user?.id })).unwrap()
        } else {
            const formData = {
                name: form.title.trim(),
                administrationSite: siteMap[form.administrationSite] || "BY_MOUTH",
                month: monthMap[form.month] || "AT_BIRTH",
                country: countryMap[form.country] || "PAKISTAN",
            }
            console.log(formData, 'formData')
            await dispatch(createVaccination({ formData, setLoading, adminId: user?.id })).unwrap()
        }

        setSubmitting(false)
        setIsFormOpen(false)
        setEditing(null)
    }

    function requestDelete(id) {
        setDeleteId(id)
        setIsDeleteOpen(true)
    }

    async function confirmDelete() {
        if (!deleteId) return
        setOpError(null)
        
        await dispatch(deleteVaccination({ vaccinationId: deleteId, adminId: user?.id, setLoading })).unwrap()
        setVaccinations((cur) => cur.filter((v) => v.id !== deleteId))
        setIsDeleteOpen(false)
        setDeleteId(null)
    }

    function toggleMonth(country, month) {
        const key = `${country}::${month}`
        setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    const sortedCountries = useMemo(
        () => Object.keys(grouped).sort((a, b) => countryOrder(a) - countryOrder(b) || a.localeCompare(b)),
        [grouped],
    )

    return (
        <main className="mx-auto w-full p-6 space-y-6">
            {loading && <Loading />}
            <AdminHeader title="Vaccinations" subTitle="Manage Vaccinations" />

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-pretty">Vaccinations List</h1>
                <Button onClick={openAddForm} className="gap-2">
                    Add Vaccination
                </Button>
            </div>

            {/* Show operation-level errors without replacing main content */}
            {opError && <div className="text-sm text-destructive">{opError}</div>}

            {loading ? (
                <div className="text-sm text-muted-foreground">Loading vaccinations…</div>
            ) : error ? (
                <div className="text-sm text-destructive">Failed to load. Please try again.</div>
            ) : sortedCountries.length === 0 ? (
                <Card className="rounded-xl shadow-sm bg-card/70 backdrop-blur-sm">
                    <CardContent className="py-10 text-center text-sm text-muted-foreground">
                        No vaccinations found. Click “Add Vaccination” to create one.
                    </CardContent>
                </Card>
            ) : (
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {sortedCountries.map((country) => {
                        const months = grouped[country] || {}
                        const sortedMonths = Object.keys(months).sort((a, b) => monthOrder(a) - monthOrder(b))
                        return (
                            <Card key={country} className="border rounded-xl shadow-sm bg-card/70 backdrop-blur-sm">
                                <CardHeader className="py-4">
                                    <CardTitle className="text-lg font-semibold text-pretty">{country}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {sortedMonths.map((month) => {
                                        const list = months[month] || []
                                        const open = !!expanded[`${country}::${month}`]
                                        return (
                                            <div key={month} className="rounded-lg border bg-background">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleMonth(country, month)}
                                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent rounded-lg"
                                                    aria-expanded={open}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="h-4 w-4 text-muted-foreground">{open ? "▾" : "▸"}</span>
                                                        <span className="font-medium">{month}</span>
                                                        <span className="text-xs text-muted-foreground">({list.length})</span>
                                                    </div>
                                                    <span className="sr-only">
                                                        {open ? "Collapse" : "Expand"} {month}
                                                    </span>
                                                </button>

                                                <AnimatePresence initial={false}>
                                                    {open && (
                                                        <motion.div
                                                            key="content"
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2, ease: "easeInOut" }}
                                                            style={{ overflow: "hidden" }}
                                                        >
                                                            <Separator />
                                                            <div className="p-4 space-y-3">
                                                                {list.map((v) => (
                                                                    <div
                                                                        key={v.id}
                                                                        className="flex items-center justify-between rounded-md border px-3 py-3 bg-card/50"
                                                                    >
                                                                        <div className="min-w-0">
                                                                            <div className="font-medium truncate">{v.name}</div>
                                                                            <div className="text-xs text-muted-foreground">
                                                                                {toTitleCaseHyphenated(v.administrationSite)}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <Button className="bg-pink-600 hover:bg-pink-500" size="sm" onClick={() => openEditForm(v)}>
                                                                                Edit
                                                                            </Button>
                                                                            <Button variant="destructive" size="sm" onClick={() => requestDelete(v.id)}>
                                                                                Delete
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {list.length === 0 && (
                                                                    <div className="text-sm text-muted-foreground px-1 py-2">
                                                                        No vaccinations for this month.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )
                                    })}
                                </CardContent>
                            </Card>
                        )
                    })}
                </section>
            )}

            {/* Add / Edit Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit Vaccination" : "Add Vaccination"}</DialogTitle>
                        <DialogDescription>Fill the fields below and save.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Name</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., BCG Vaccine"
                                    value={form.title}
                                    onChange={(e) => onFormChange("title", e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Administration Site</Label>
                                <Select
                                    value={form.administrationSite}
                                    onValueChange={(val) => onFormChange("administrationSite", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select administration site" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ADMIN_SITES.map((site) => (
                                            <SelectItem key={site} value={site}>
                                                {toTitleCaseHyphenated(site)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Month</Label>
                                <Select value={form.month} onValueChange={(val) => onFormChange("month", val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MONTHS.map((m) => (
                                            <SelectItem key={m} value={m}>
                                                {m}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Country</Label>
                                <Select value={form.country} onValueChange={(val) => onFormChange("country", val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COUNTRIES.map((c) => (
                                            <SelectItem key={c} value={c}>
                                                {c}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                className="bg-pink-600 hover:bg-pink-500"
                                onClick={() => {
                                    setIsFormOpen(false)
                                    setEditing(null)
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Saving…" : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Vaccination</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this vaccination? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button className="bg-pink-600 hover:bg-pink-500" onClick={() => setIsDeleteOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    )
}
