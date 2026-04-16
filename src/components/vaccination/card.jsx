import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from '@/components/ui/badge'

const COUNTRIES = ["Pakistan", "USA", "UAE"]
const MONTHS = ["At Birth (Month 1)", "Month 2", "Month 4", "Month 6", "Month 12", "Month 18", "Year 5"]

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

const VaccinationCard = ({ vaccinations, parent = false, handleShowVacStatus }) => {
    const [expanded, setExpanded] = useState({})
    const grouped = useMemo(() => groupByCountryMonth(vaccinations), [vaccinations])

    const sortedCountries = useMemo(
        () => Object.keys(grouped).sort((a, b) => countryOrder(a) - countryOrder(b) || a.localeCompare(b)),
        [grouped],
    )

    function toggleMonth(country, month) {
        const key = `${country}::${month}`
        setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
    }
    return (
        <div>
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
                                                        {/* {list.map((v) => (
                                                            <div
                                                                key={v.id}
                                                                className="flex items-center justify-between rounded-md border px-3 py-3 bg-card/50 relative"
                                                            >
                                                                <Badge variant="default">Taken</Badge>
                                                                <div className="min-w-0">
                                                                    <div className="font-medium truncate">{v.name}</div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {toTitleCaseHyphenated(v.administrationSite)}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Button className="bg-pink-600 hover:bg-pink-500" size="sm">
                                                                        Edit
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))} */}
                                                        {list.map((v) => (
                                                            <div
                                                                key={v.id}
                                                                className="flex flex-col gap-2 rounded-md border bg-card/50 p-3"
                                                            >
                                                                {/* Show badge only when parent is true */}
                                                                {parent && <Badge variant={v?.status === 'TAKEN' ? 'success' : "destructive"} className="self-end">{v?.status}</Badge>}

                                                                <div className="flex items-center justify-between">
                                                                    <div className="min-w-0">
                                                                        <div className="font-medium truncate">{v.name}</div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {toTitleCaseHyphenated(v.administrationSite)}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-2">
                                                                        <Button className="bg-pink-600 hover:bg-pink-500 cursor-pointer" size="sm" onClick={() => handleShowVacStatus(v?.status === 'TAKEN' ? 'PENDING' : 'TAKEN', v?.id)}>
                                                                            {v?.status === "TAKEN" ? "Mark PENDING" : "Mark TAKEN"}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {list?.length === 0 && (
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
        </div>
    )
}

export default VaccinationCard;
