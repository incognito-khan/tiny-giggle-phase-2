"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Plus, Edit, Trash2, CheckCircle, CloudUpload, FileText, ShieldCheck, Loader2, Stethoscope, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useDispatch, useSelector } from "react-redux"
import { getAllDoctors, createDoctor, updateDoctor, deleteDoctor } from "@/store/slices/doctorSlice"
import Loading from "@/components/loading"
import { toast } from "react-toastify"
import AdminHeader from "@/components/layout/header/admin-header"

export function Doctors() {
    const user = useSelector((state) => state.auth.user);
    const doctors = useSelector((state) => state.doctor.doctors);
    const pagination = useSelector((state) => state.doctor.pagination || { total: 0, totalPages: 1, limit: 10 });
    const [isCreateModal, setIsCreateModal] = useState(false)
    const [isEditModal, setIsEditModal] = useState(false);
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        city: "",
        state: "",
        zipCode: "",
        specialty: "",
        licenseNumber: "",
        yearsOfExperience: "",
        consultationFee: "",
        serviceMode: "OFFLINE",
        bio: "",
        nationalId: "",
        medicalLicense: "",
        specialtyCertificate: "",
        malpracticeInsurance: "",
        deaRegistration: ""
    })

    const [editTarget, setEditTarget] = useState(null)
    const [uploading, setUploading] = useState({})
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getAllDoctors({ setLoading, adminId: user?.id, search, page: currentPage, limit: ITEMS_PER_PAGE }));
    }, [search, currentPage]);

    const handleFileUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(prev => ({ ...prev, [field]: true }));
            const uploadFormData = new FormData();
            uploadFormData.append("file", file);

            const response = await fetch(`/api/v1/upload`, {
                method: "POST",
                body: uploadFormData
            });

            const data = await response.json();
            if (data.url) {
                setFormData(prev => ({ ...prev, [field]: data.url }));
                toast.success(`${field.replace(/([A-Z])/g, ' $1').trim()} uploaded`);
            }
        } catch (err) {
            toast.error("File upload failed");
        } finally {
            setUploading(prev => ({ ...prev, [field]: false }));
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.email || !formData.specialty) {
            toast.error("Required fields are missing");
            return;
        }

        if (isEditModal) {
            dispatch(updateDoctor({ setLoading, adminId: user?.id, doctorId: editTarget.id, formData }))
                .then((res) => { if (!res.error) setIsEditModal(false) });
        } else {
            dispatch(createDoctor({ setLoading, adminId: user?.id, formData }))
                .then((res) => { if (!res.error) setIsCreateModal(false) });
        }
    }

    const startEdit = (doctor) => {
        setEditTarget(doctor);
        setFormData(doctor);
        setIsEditModal(true);
    }

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this doctor?")) {
            dispatch(deleteDoctor({ setLoading, adminId: user?.id, doctorId: id }));
        }
    }

    const { total, totalPages, limit } = pagination;

    return (
        <div className="flex flex-col h-screen bg-slate-50/50 w-full overflow-hidden">
            {loading && <Loading />}
            
            <div className="px-8 py-6">
                <AdminHeader title="Medical Professionals" subTitle="Manage authorized doctors and specialists" />
            </div>

            <main className="flex-1 p-8 pt-0 overflow-y-auto">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-50">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Doctor Directory</h2>
                                <p className="text-slate-400 font-medium text-sm">Review, verify and manage medical staff</p>
                            </div>
                            <Button 
                                className="bg-slate-900 hover:bg-black text-white px-6 h-12 rounded-2xl font-bold shadow-lg shadow-slate-200 transition-all active:scale-95" 
                                onClick={() => {
                                    setFormData({ serviceMode: "OFFLINE" });
                                    setIsCreateModal(true);
                                }}
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Onboard Doctor
                            </Button>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input 
                                    placeholder="Search by name, email or specialty..." 
                                    value={search} 
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="text-left p-6 font-black text-slate-400 uppercase text-xs tracking-widest">Doctor</th>
                                    <th className="text-left p-6 font-black text-slate-400 uppercase text-xs tracking-widest">Specialty</th>
                                    <th className="text-left p-6 font-black text-slate-400 uppercase text-xs tracking-widest">Experience</th>
                                    <th className="text-left p-6 font-black text-slate-400 uppercase text-xs tracking-widest">Status</th>
                                    <th className="text-left p-6 font-black text-slate-400 uppercase text-xs tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {doctors?.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                {doc.profilePicture ? (
                                                    <img src={doc.profilePicture} alt={doc.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-100" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-lg border border-indigo-100">
                                                        {doc.name.charAt(doc.name.startsWith("Dr.") ? 4 : 0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-black text-slate-800">{doc.name}</div>
                                                    <div className="text-sm text-slate-400 font-medium">{doc.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black inline-block uppercase tracking-wider">
                                                {doc.specialty}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="text-slate-600 font-bold">{doc.yearsOfExperience} Years</div>
                                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-tight">Practice Time</div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-2">
                                                <div className={`text-[10px] font-black px-3 py-1 rounded-full w-fit flex items-center gap-1.5 ${doc.isVerified ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                                    {doc.isVerified ? <ShieldCheck className="w-3 h-3" /> : null}
                                                    {doc.isVerified ? 'VERIFIED' : 'PENDING VERIFICATION'}
                                                </div>
                                                <div className={`text-[9px] font-black px-3 py-1 rounded-full w-fit ${doc.isPaid ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                                    {doc.isPaid ? 'PAID MEMBER' : 'UNPAID'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-indigo-50 hover:text-indigo-600 text-slate-400" onClick={() => startEdit(doc)}>
                                                    <Edit className="w-5 h-5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-rose-50 hover:text-rose-600 text-slate-400" onClick={() => handleDelete(doc.id)}>
                                                    <Trash2 className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(!doctors || doctors.length === 0) && !loading && (
                            <div className="p-20 text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                    <Stethoscope className="w-10 h-10 text-slate-200" />
                                </div>
                                <h3 className="text-xl font-black text-slate-800">No doctors found</h3>
                                <p className="text-slate-400 font-medium">Try adjusting your search or add a new professional.</p>
                            </div>
                        )}

                        {/* Pagination Footer */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-8 py-5 border-t border-slate-50">
                                <p className="text-xs font-bold text-slate-400">
                                    Showing <span className="text-slate-700">{(currentPage - 1) * limit + 1}</span>–<span className="text-slate-700">{Math.min(currentPage * limit, total)}</span> of <span className="text-slate-700">{total}</span> doctors
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-xl h-9 w-9 text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-30"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`h-9 w-9 rounded-xl text-xs font-black transition-all ${
                                                page === currentPage
                                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                                                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-xl h-9 w-9 text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-30"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <ProfessionalModal 
                isOpen={isCreateModal || isEditModal}
                setIsOpen={(val) => { setIsCreateModal(val); setIsEditModal(val); }}
                title={isEditModal ? "Edit Doctor Profile" : "Onboard New Doctor"}
                formData={formData}
                setFormData={setFormData}
                handleSave={handleSave}
                uploading={uploading}
                handleFileUpload={handleFileUpload}
                loading={loading}
                type="doctor"
            />
        </div>
    )
}

function ProfessionalModal({ isOpen, setIsOpen, title, formData, setFormData, handleSave, uploading, handleFileUpload, loading, type }) {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-4xl rounded-[3rem] overflow-y-auto max-h-[90vh] bg-white border-0 shadow-2xl p-0">
                <div className="p-10 space-y-10">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
                            <p className="text-slate-400 font-medium italic mt-1 font-serif">Carefully review all credentials before saving.</p>
                        </div>
                        <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center">
                            <Stethoscope className="w-8 h-8 text-indigo-600" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12">
                        {/* Basic Info */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs">01</div>
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Identity & Contact</h3>
                            </div>
                            
                            <div className="space-y-6">
                                {/* Profile Picture Upload */}
                                <div className="flex items-center gap-6 p-4 rounded-3xl bg-slate-50/50 border border-slate-100">
                                    <div className="relative group">
                                        {formData.profilePicture ? (
                                            <img src={formData.profilePicture} className="w-20 h-20 rounded-[2rem] object-cover border-2 border-white shadow-md" alt="Profile" />
                                        ) : (
                                            <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 flex items-center justify-center border-2 border-white shadow-md">
                                                <Stethoscope className="w-8 h-8 text-indigo-300" />
                                            </div>
                                        )}
                                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <CloudUpload className="w-6 h-6 text-white" />
                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'profilePicture')} />
                                        </label>
                                        {uploading['profilePicture'] && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-[2rem]">
                                                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-sm">Professional Avatar</h4>
                                        <p className="text-xs text-slate-400 font-medium">Clear headshot for patient trust</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-slate-400 uppercase tracking-tighter ml-1">Full Name</Label>
                                    <Input value={formData.name || ""} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white font-bold" placeholder="Dr. John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-slate-400 uppercase tracking-tighter ml-1">Email Address</Label>
                                    <Input value={formData.email || ""} onChange={(e) => setFormData({...formData, email: e.target.value})} className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white font-bold" placeholder="john@hospital.com" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-tighter ml-1">Phone</Label>
                                        <Input value={formData.phone || ""} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white font-bold" placeholder="+1..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-tighter ml-1">Specialty</Label>
                                        <Input value={formData.specialty || ""} onChange={(e) => setFormData({...formData, specialty: e.target.value})} className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white font-bold" placeholder="Pediatrician" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional Info */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs">02</div>
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Verification Details</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-tighter ml-1">License Number</Label>
                                        <Input value={formData.licenseNumber || ""} onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-tighter ml-1">Exp. (Years)</Label>
                                        <Input type="number" value={formData.yearsOfExperience || ""} onChange={(e) => setFormData({...formData, yearsOfExperience: e.target.value})} className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white font-bold" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-tighter ml-1">Fee ($/hour)</Label>
                                        <Input type="number" value={formData.consultationFee || ""} onChange={(e) => setFormData({...formData, consultationFee: e.target.value})} className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-tighter ml-1">Service Mode</Label>
                                        <Select value={formData.serviceMode} onValueChange={(val) => setFormData({...formData, serviceMode: val})}>
                                            <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ONLINE">ONLINE</SelectItem>
                                                <SelectItem value="OFFLINE">OFFLINE</SelectItem>
                                                <SelectItem value="BOTH">BOTH</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-tighter ml-1">Verification</Label>
                                        <Select value={formData.isVerified ? "true" : "false"} onValueChange={(val) => setFormData({...formData, isVerified: val === "true"})}>
                                            <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">VERIFIED</SelectItem>
                                                <SelectItem value="false">UNDER REVIEW</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-tighter ml-1">Payment Status</Label>
                                        <Select value={formData.isPaid ? "true" : "false"} onValueChange={(val) => setFormData({...formData, isPaid: val === "true"})}>
                                            <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">PAID MEMBER</SelectItem>
                                                <SelectItem value="false">UNPAID</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs">03</div>
                            <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Professional Documentation</h3>
                        </div>

                        <div className="grid grid-cols-4 gap-6">
                            {[
                                { id: 'medicalLicense', label: 'Medical License' },
                                { id: 'specialtyCertificate', label: 'Certifications' },
                                { id: 'malpracticeInsurance', label: 'Insurance' },
                                { id: 'deaRegistration', label: 'DEA Reg.' }
                            ].map((doc) => (
                                <div key={doc.id} className="group relative p-6 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/30 hover:bg-white hover:border-indigo-200 transition-all text-center">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-4 block">{doc.label}</Label>
                                    {formData[doc.id] ? (
                                        <div className="text-emerald-500 font-bold text-xs flex flex-col items-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5" />
                                            </div>
                                            LINKED
                                        </div>
                                    ) : (
                                        <div className="text-slate-300 font-bold text-[10px] flex flex-col items-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            EMPTY
                                        </div>
                                    )}
                                    <input type="file" id={`upload-${doc.id}`} className="hidden" onChange={(e) => handleFileUpload(e, doc.id)} />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-2 right-2 rounded-full w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => document.getElementById(`upload-${doc.id}`).click()}
                                        disabled={uploading[doc.id]}
                                    >
                                        {uploading[doc.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4 text-indigo-500" />}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button
                            variant="outline"
                            className="flex-1 h-16 rounded-[2rem] border-slate-100 text-slate-400 font-black hover:bg-slate-50"
                            onClick={() => setIsOpen(false)}
                        >
                            IGNORE CHANGES
                        </Button>
                        <Button
                            className="flex-[2] h-16 rounded-[2rem] bg-slate-900 text-white font-black hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-95"
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <CheckCircle className="w-6 h-6 mr-2" />}
                            VALIDATE & COMMIT PROFILE
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
