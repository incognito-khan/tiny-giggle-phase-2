"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Plus, Edit, Trash2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { createSupplier, getAllSuppliers, updateSupplier, deleteSupplier } from "@/store/slices/supplierSlice"
import { createArtist, getAllArtists, updateArtist, deleteArtist } from "@/store/slices/artistSlice"
import { getAllMusicCategories } from "@/store/slices/categorySlice"
import { useDispatch, useSelector } from "react-redux"
import Loading from "@/components/loading"
import { toast } from "react-toastify"
import { format } from "date-fns/format"
import AdminHeader from "@/components/layout/header/admin-header"
import { POST } from "@/lib/api"
import { CheckCircle2, Clock, Shield, ExternalLink, Paperclip, FileText, Image as ImageIcon, CreditCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function Artists() {
    const user = useSelector((state) => state.auth.user);
    const categories = useSelector((state) => state.category.categories);
    console.log("categories", categories);
    const suppliers = useSelector((state) => state.supplier.suppliers);
    console.log(suppliers, 'suppliers')
    const artists = useSelector((state) => state.artist.artists);
    console.log(artists, 'artists');
    const [isCreateArtist, setIsCreateArtist] = useState(false)
    const [isEditSupplier, setIsEditSupplier] = useState(false);
    const [isEditArtist, setIsEditArtist] = useState(false);
    const [newArtist, setNewArtist] = useState({
        name: "",
        cnic: "",
        email: "",
        city: "",
        state: "",
        country: "",
        status: "",
        nationalId: "",
        portfolio: "",
        copyrightCertificates: "",
        exhibitionRecords: "",
        bankDetails: "",
    })
    const [editArtist, setEditArtist] = useState({
        id: "",
        name: "",
        cnic: "",
        email: "",
        city: "",
        state: "",
        country: "",
        status: "",
        isVerified: false,
        isPaid: false,
        nationalId: "",
        portfolio: "",
        copyrightCertificates: "",
        exhibitionRecords: "",
        bankDetails: "",
    })
    const [categoryId, setCategoryId] = useState(undefined);
    const [subCategoryId, setSubCategoryId] = useState(undefined);
    const [filteredSuppliers, setFilteredSuppliers] = useState(suppliers)
    const [filteredArtists, setFilteredArtists] = useState(artists);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedFilterCategory, setSelectedFilterCategory] = useState(undefined);
    const [selectedFilterStatus, setSelectedFilterStatus] = useState(undefined);
    const [editingIndex, setEditingIndex] = useState(null);
    const [uploading, setUploading] = useState({
        nationalId: false,
        portfolio: false,
        copyrightCertificates: false,
        exhibitionRecords: false,
        bankDetails: false,
    });
    const [uploadProgress, setUploadProgress] = useState({
        nationalId: 0,
        portfolio: 0,
        copyrightCertificates: 0,
        exhibitionRecords: 0,
        bankDetails: 0,
    });
    const dispatch = useDispatch();

    const selectedCategory = categories?.find(cat => cat.id === categoryId);

    const handleCategoryFilter = (categoryId) => {
        if (!categoryId) {
            setFilteredArtists(artists);
            return;
        }
        if (categoryId === "all") {
            setFilteredArtists(artists);
            return;
        }
        const filtered = artists.filter(artist => artist?.category?.id === categoryId);
        setFilteredArtists(filtered);
    }

    const handleStatusFilter = (selectedFilterStatus) => {
        if (!selectedFilterStatus) {
            setFilteredArtists(artists);
            return;
        }
        if (selectedFilterStatus === "all") {
            setFilteredArtists(artists);
            return;
        }
        const filtered = artists.filter(artist => artist?.status === selectedFilterStatus);
        setFilteredArtists(filtered);
    }

    const handleFileUpload = async (e, field, isEdit = false) => {
        const file = e.target.files[0];
        if (!file) return;

        console.log(`Starting upload for ${field}:`, file.name, "isEdit:", isEdit);
        console.log("Current user ID:", user?.id);

        try {
            setUploading(prev => ({ ...prev, [field]: true }));
            setUploadProgress(prev => ({ ...prev, [field]: 10 }));

            const formData = new FormData();
            formData.append("file", file);

            const token = localStorage.getItem("token");
            const response = await fetch(`/api/v1/parents/${user?.id}/upload`, {
                method: "POST",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData
            });

            const data = await response.json();
            
            if (data.url) {
                setUploadProgress(prev => ({ ...prev, [field]: 100 }));
                
                if (isEdit) {
                    setEditArtist(prev => ({ ...prev, [field]: data.url }));
                } else {
                    setNewArtist(prev => ({ ...prev, [field]: data.url }));
                }
                toast.success(`${field.replace(/([A-Z])/g, ' $1').trim()} uploaded successfully`);
            } else {
                throw new Error(data.error || "Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(`Failed to upload ${field}`);
        } finally {
            setTimeout(() => {
                setUploading(prev => ({ ...prev, [field]: false }));
                setUploadProgress(prev => ({ ...prev, [field]: 0 }));
            }, 500);
        }
    };

    const clearFilters = () => {
        setFilteredArtists(artists);
        setSearch("");
        setSelectedFilterCategory("");
        setSelectedFilterStatus("")
    }

    const handleCreateArtist = async () => {

        if (!categoryId) {
            toast.error("Please select a category");
            return;
        }

        if (!subCategoryId) {
            toast.error("Please select a sub category");
            return;
        }

        console.log(newArtist, "newArtist")

        if (!newArtist.name || !newArtist.email || !newArtist.cnic || !newArtist.city || !newArtist.state || !newArtist.country) {
            toast.error("Please fill all the fields");
            return;
        }

        const formData = {
            ...newArtist,
            categoryId,
            subCategoryId
        }

        dispatch(createArtist({ setLoading, adminId: user?.id, formData }))
        setIsCreateArtist(false)
        setNewArtist({
            name: "",
            email: "",
            cnic: "",
            state: "",
            city: "",
            country: "",
            status: "",
            nationalId: "",
            portfolio: "",
            copyrightCertificates: "",
            exhibitionRecords: "",
            bankDetails: "",
        })
    }

    const handleEditArtist = async () => {
        if (!categoryId) {
            toast.error("Please select a category");
            return;
        }
        if (!subCategoryId) {
            toast.error("Please select a sub category");
            return;
        }
        // console.log("editSupplier", editSupplier);
        if (!editArtist.name || !editArtist.cnic || !editArtist.email || !editArtist.city || !editArtist.state || !editArtist.country || !editArtist.status) {
            toast.error("Please fill all the fields");
            return;
        }

        const formData = {
            ...editArtist,
            categoryId,
            subCategoryId
        }

        dispatch(updateArtist({ setLoading, adminId: user?.id, formData, artistId: editArtist.id }))
        setIsEditArtist(false)
        setEditArtist({
            id: "",
            name: "",
            cnic: "",
            email: "",
            state: "",
            city: "",
            country: "",
            status: "",
            isVerified: false,
            isPaid: false,
            nationalId: "",
            portfolio: "",
            copyrightCertificates: "",
            exhibitionRecords: "",
            bankDetails: "",
        })
    }

    const gettingAllArtists = () => {
        dispatch(getAllArtists({ setLoading, search, adminId: user?.id }))
    }

    const gettingAllCategories = () => {
        dispatch(getAllMusicCategories({ setLoading }))
    }

    useEffect(() => {
        gettingAllArtists();
        gettingAllCategories();
    }, [])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            gettingAllArtists();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [search]);

    useEffect(() => {
        setFilteredArtists(artists);
    }, [artists])

    const delArtist = (artistId) => {
        if (!artistId) {
            toast.error("Artist ID are required to delete a product");
            return;
        }
        dispatch(deleteArtist({ setLoading, artistId, adminId: user?.id }))
    }

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
                    <AdminHeader title="Artist" subTitle="Manage Artists" />
                </div>

                {/* Content */}
                <main className="flex-1 p-6">
                    <div className="bg-card rounded-lg border border-border">
                        {/* Category List Header */}
                        <div className="p-6 border-b border-border">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-card-foreground">Artists List</h2>
                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setIsCreateArtist(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Artist
                                </Button>
                            </div>

                            {/* Filters */}
                            <div className="grid grid-cols-4 gap-4 items-center">
                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">Artist Name</label>
                                    <Input placeholder="Enter artist name" value={search} onChange={(e) => setSearch(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">Category</label>
                                    <Select value={selectedFilterCategory} onValueChange={(value) => {
                                        handleCategoryFilter(value);
                                        setSelectedFilterCategory(value);
                                    }}>
                                        <SelectTrigger className={`w-[100%]`}>
                                            <SelectValue placeholder="Select Artist Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            {categories?.map((cat, index) => (
                                                <SelectItem key={index} value={cat?.id}>{cat?.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">Status</label>
                                    <Select value={selectedFilterStatus} onValueChange={(value) => {
                                        handleStatusFilter(value);
                                        setSelectedFilterStatus(value);
                                    }}>
                                        <SelectTrigger className={`w-[100%]`}>
                                            <SelectValue placeholder="Select Artist Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                                            <SelectItem value="INACTIVE">INACTIVE</SelectItem>
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
                        {artists?.length !== 0 && filteredArtists?.length > 0 && !loading && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50 border-b border-border">
                                        <tr>
                                            <th className="text-left p-4 font-semibold text-muted-foreground uppercase text-[11px] tracking-wider">FullName / Email</th>
                                            <th className="text-left p-4 font-semibold text-muted-foreground uppercase text-[11px] tracking-wider">Verification</th>
                                            <th className="text-left p-4 font-semibold text-muted-foreground uppercase text-[11px] tracking-wider">Payment</th>
                                            <th className="text-left p-4 font-semibold text-muted-foreground uppercase text-[11px] tracking-wider">Category</th>
                                            <th className="text-left p-4 font-semibold text-muted-foreground uppercase text-[11px] tracking-wider">Status</th>
                                            <th className="text-left p-4 font-semibold text-muted-foreground uppercase text-[11px] tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredArtists?.map((artist, index) => (
                                            <tr key={index} className="group hover:bg-muted/30 transition-colors duration-200">
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900 leading-none">{artist?.name}</span>
                                                        <span className="text-xs text-muted-foreground mt-1">{artist?.email}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1.5">
                                                        {artist?.isVerified ? (
                                                            <Badge variant="success" className="bg-green-100 text-green-700 border-green-200 gap-1 rounded-md px-2 py-0.5">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                Verified
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="warning" className="bg-orange-100 text-orange-700 border-orange-200 gap-1 rounded-md px-2 py-0.5 font-medium">
                                                                <Clock className="w-3 h-3" />
                                                                Pending
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1.5">
                                                        {artist?.isPaid ? (
                                                            <Badge variant="success" className="bg-blue-100 text-blue-700 border-blue-200 gap-1 rounded-md px-2 py-0.5">
                                                                <Shield className="w-3 h-3" />
                                                                Paid
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 gap-1 rounded-md px-2 py-0.5 font-medium">
                                                                <Clock className="w-3 h-3" />
                                                                Unpaid
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md w-fit">
                                                            {artist?.category?.name}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground ml-1">
                                                            {artist?.subCategory?.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold tracking-tight uppercase ${
                                                        artist?.status === 'ACTIVE' 
                                                        ? 'bg-green-600 text-white' 
                                                        : 'bg-gray-400 text-white'
                                                    }`}>
                                                        {artist?.status}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="w-8 h-8 rounded-full hover:bg-gray-100 hover:text-primary transition-all duration-200"
                                                            onClick={() => {
                                                                setIsEditArtist(true);
                                                                setEditArtist({
                                                                    id: artist?.id,
                                                                    name: artist?.name,
                                                                    email: artist?.email,
                                                                    cnic: artist?.cnic,
                                                                    country: artist?.country,
                                                                    state: artist?.state,
                                                                    city: artist?.city,
                                                                    status: artist?.status,
                                                                    isVerified: artist?.isVerified || false,
                                                                    isPaid: artist?.isPaid || false,
                                                                    nationalId: artist?.nationalId || "",
                                                                    portfolio: artist?.portfolio || "",
                                                                    copyrightCertificates: artist?.copyrightCertificates || "",
                                                                    exhibitionRecords: artist?.exhibitionRecords || "",
                                                                    bankDetails: artist?.bankDetails || "",
                                                                });
                                                                setCategoryId(artist?.category?.id);
                                                                setSubCategoryId(artist?.subCategory?.id)
                                                            }}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="w-8 h-8 rounded-full hover:bg-red-50 hover:text-destructive transition-all duration-200"
                                                            onClick={() => delArtist(artist?.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {filteredArtists?.length === 0 && !loading && (
                            <div className="p-6">
                                <p className="text-lg font-medium text-gray-500 text-center">
                                    No Artist Found
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <Dialog open={isEditArtist} onOpenChange={setIsEditArtist}>
                <DialogContent className="sm:max-w-3xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-gradient-to-r from-secondary/90 to-secondary p-6 text-white text-center">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold tracking-tight text-white">Manage Artist Profile</DialogTitle>
                            <p className="text-secondary-foreground/80 text-sm mt-1">Update artist details and verification status</p>
                        </DialogHeader>
                    </div>

                    <div className="p-8 max-h-[85vh] overflow-y-auto custom-scrollbar bg-gray-50/30">
                        <div className="space-y-8">
                            {/* Section 1: Activation & Verification Status */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold text-sm">
                                        <Shield size={16} />
                                    </div>
                                    <h3 className="font-bold text-gray-800">Verification & Account Status</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Account Status</Label>
                                        <Select
                                            value={editArtist.status}
                                            onValueChange={(value) => setEditArtist({ ...editArtist, status: value })}
                                        >
                                            <SelectTrigger className="rounded-xl border-gray-200 h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                                                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="p-3 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col gap-2">
                                        <Label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Verification</Label>
                                        <Select
                                            value={editArtist.isVerified ? "true" : "false"}
                                            onValueChange={(value) => setEditArtist({ ...editArtist, isVerified: value === "true" })}
                                        >
                                            <SelectTrigger className="h-8 rounded-lg bg-white border-gray-200">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="true" className="text-green-600 font-bold">VERIFIED</SelectItem>
                                                <SelectItem value="false" className="text-gray-400 font-bold">PENDING</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="p-3 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col gap-2">
                                        <Label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Payment</Label>
                                        <Select
                                            value={editArtist.isPaid ? "true" : "false"}
                                            onValueChange={(value) => setEditArtist({ ...editArtist, isPaid: value === "true" })}
                                        >
                                            <SelectTrigger className="h-8 rounded-lg bg-white border-gray-200">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="true" className="text-blue-600 font-bold">PAID</SelectItem>
                                                <SelectItem value="false" className="text-gray-400 font-bold">UNPAID</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Basic Profile */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">1</div>
                                    <h3 className="font-bold text-gray-800">Basic Information</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <Input
                                            className="rounded-xl h-11"
                                            value={editArtist.name}
                                            onChange={(e) => setEditArtist({ ...editArtist, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input
                                            type="email"
                                            className="rounded-xl h-11"
                                            value={editArtist.email}
                                            onChange={(e) => setEditArtist({ ...editArtist, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>CNIC</Label>
                                        <Input
                                            className="rounded-xl h-11"
                                            value={editArtist.cnic}
                                            onChange={(e) => setEditArtist({ ...editArtist, cnic: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Location</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                placeholder="City"
                                                className="rounded-xl h-11"
                                                value={editArtist.city}
                                                onChange={(e) => setEditArtist({ ...editArtist, city: e.target.value })}
                                            />
                                            <Input
                                                placeholder="Country"
                                                className="rounded-xl h-11"
                                                value={editArtist.country}
                                                onChange={(e) => setEditArtist({ ...editArtist, country: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Professional Documents */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 font-bold text-sm">3</div>
                                    <h3 className="font-bold text-gray-800">Verification Documents</h3>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { id: 'nationalId', label: 'National ID Card', icon: Shield },
                                        { id: 'portfolio', label: 'Professional Portfolio', icon: ImageIcon },
                                        { id: 'copyrightCertificates', label: 'Copyright Certificates', icon: Paperclip },
                                        { id: 'exhibitionRecords', label: 'Exhibition Records', icon: FileText },
                                        { id: 'bankDetails', label: 'Bank Details / Proof', icon: CreditCard }
                                    ].map((doc) => (
                                        <div key={doc.id} className="relative">
                                            <div className="flex items-center justify-between mb-2 px-1">
                                                <Label className="text-xs font-bold text-gray-400 uppercase">{doc.label}</Label>
                                                {editArtist[doc.id] && (
                                                    <a href={editArtist[doc.id]} target="_blank" rel="noreferrer" 
                                                       className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
                                                        VIEW FILE <ExternalLink size={10} />
                                                    </a>
                                                )}
                                            </div>
                                            <div className={`
                                                relative border-2 border-dashed rounded-2xl p-4 transition-all duration-300
                                                ${editArtist[doc.id] ? 'border-primary/20 bg-primary/5' : 'border-gray-200 bg-gray-50/50'}
                                            `}>
                                                <input
                                                    type="file"
                                                    id={`edit-doc-${doc.id}`}
                                                    className="hidden"
                                                    onChange={(e) => handleFileUpload(e, doc.id, true)}
                                                />
                                                <div className="flex items-center gap-4">
                                                    <div 
                                                        className={`p-3 rounded-xl cursor-pointer hover:scale-105 transition-transform ${editArtist[doc.id] ? 'bg-primary/20 text-primary' : 'bg-white text-gray-400 shadow-sm'}`}
                                                        onClick={() => document.getElementById(`edit-doc-${doc.id}`).click()}
                                                    >
                                                        <doc.icon size={20} />
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        {uploading[doc.id] ? (
                                                            <div className="space-y-2">
                                                                <Progress value={uploadProgress[doc.id]} className="h-1.5" />
                                                            </div>
                                                        ) : (
                                                            <div className="cursor-pointer" onClick={() => document.getElementById(`edit-doc-${doc.id}`).click()}>
                                                                <span className="text-xs font-bold text-gray-600 block">
                                                                    {editArtist[doc.id] ? 'Update Document' : 'Upload Document'}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400">PDF, JPG or PNG</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10 pt-6 border-t border-gray-100">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-2xl h-14 font-bold border-gray-200 text-gray-500 hover:bg-gray-50"
                                onClick={() => setIsEditArtist(false)}
                            >
                                Cancel Changes
                            </Button>
                            <Button
                                className="flex-[2] bg-secondary hover:bg-secondary/90 rounded-2xl h-14 font-bold shadow-xl shadow-secondary/20 text-white"
                                onClick={handleEditArtist}
                                disabled={loading || Object.values(uploading).some(v => v)}
                            >
                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                {loading ? 'Saving Changes...' : 'Update Artist Profile'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isCreateArtist} onOpenChange={setIsCreateArtist}>
                <DialogContent className="sm:max-w-3xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-gradient-to-r from-primary/90 to-primary p-6 text-white text-center">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold tracking-tight">Create New Artist Profile</DialogTitle>
                            <p className="text-primary-foreground/80 text-sm mt-1">Register a new creative professional to the platform</p>
                        </DialogHeader>
                    </div>

                    <div className="p-8 max-h-[85vh] overflow-y-auto custom-scrollbar bg-gray-50/30">
                        <div className="space-y-8">
                            {/* Section 1: Basic Information */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">1</div>
                                    <h3 className="font-bold text-gray-800">Profile Information</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="create-fullName">Full Name</Label>
                                        <Input
                                            id="create-fullName"
                                            placeholder="Enter legal name"
                                            className="rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all h-11"
                                            value={newArtist.name}
                                            onChange={(e) => setNewArtist({ ...newArtist, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="create-email">Email Address</Label>
                                        <Input
                                            id="create-email"
                                            type="email"
                                            placeholder="artist@example.com"
                                            className="rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all h-11"
                                            value={newArtist.email}
                                            onChange={(e) => setNewArtist({ ...newArtist, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="create-cnic">Identification No. (CNIC)</Label>
                                        <Input
                                            id="create-cnic"
                                            placeholder="42XXX-XXXXXXX-X"
                                            className="rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all h-11"
                                            value={newArtist.cnic}
                                            onChange={(e) => setNewArtist({ ...newArtist, cnic: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="create-status">Initial Status</Label>
                                        <Select
                                            value={newArtist.status}
                                            onValueChange={(value) => setNewArtist({ ...newArtist, status: value })}
                                        >
                                            <SelectTrigger id="create-status" className="rounded-xl bg-gray-50 border-gray-200 h-11">
                                                <SelectValue placeholder="Set account status" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                                                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Location & Category */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-sm">2</div>
                                    <h3 className="font-bold text-gray-800">Location & Specialization</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Country</Label>
                                        <Input
                                            placeholder="Pakistan"
                                            className="rounded-xl bg-gray-50 h-11"
                                            value={newArtist.country}
                                            onChange={(e) => setNewArtist({ ...newArtist, country: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>State/Province</Label>
                                        <Input
                                            placeholder="Punjab"
                                            className="rounded-xl bg-gray-50 h-11"
                                            value={newArtist.state}
                                            onChange={(e) => setNewArtist({ ...newArtist, state: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>City</Label>
                                        <Input
                                            placeholder="Lahore"
                                            className="rounded-xl bg-gray-50 h-11"
                                            value={newArtist.city}
                                            onChange={(e) => setNewArtist({ ...newArtist, city: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-2">
                                        <Label>Primary Category</Label>
                                        <Select value={categoryId} onValueChange={setCategoryId}>
                                            <SelectTrigger className="rounded-xl bg-gray-50 h-11">
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {categories?.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Sub Category</Label>
                                        <Select 
                                            value={subCategoryId} 
                                            onValueChange={setSubCategoryId}
                                            disabled={!categoryId || !selectedCategory?.subCategories?.length}
                                        >
                                            <SelectTrigger className="rounded-xl bg-gray-50 h-11">
                                                <SelectValue placeholder={!categoryId ? "Select category first" : "Select Sub Category"} />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {selectedCategory?.subCategories?.map((sub) => (
                                                    <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Professional Documents */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 font-bold text-sm">3</div>
                                    <h3 className="font-bold text-gray-800">Verification Documents</h3>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { id: 'nationalId', label: 'National ID Card', icon: Shield },
                                        { id: 'portfolio', label: 'Professional Portfolio', icon: ImageIcon },
                                        { id: 'copyrightCertificates', label: 'Copyright Certificates', icon: Paperclip },
                                        { id: 'exhibitionRecords', label: 'Exhibition Records', icon: FileText },
                                        { id: 'bankDetails', label: 'Bank Details / Proof', icon: CreditCard }
                                    ].map((doc) => (
                                        <div key={doc.id} className="relative group">
                                            <Label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-2 block">{doc.label}</Label>
                                            <div className={`
                                                relative border-2 border-dashed rounded-2xl p-4 transition-all duration-300
                                                ${newArtist[doc.id] ? 'border-green-200 bg-green-50/30' : 'border-gray-200 hover:border-primary/40 bg-gray-50/50'}
                                            `}>
                                                <input
                                                    type="file"
                                                    id={`create-doc-${doc.id}`}
                                                    className="hidden"
                                                    onChange={(e) => handleFileUpload(e, doc.id, false)}
                                                />
                                                <div className="flex items-center gap-4">
                                                    <div 
                                                        className={`p-3 rounded-xl cursor-pointer hover:scale-105 transition-transform ${newArtist[doc.id] ? 'bg-green-100 text-green-600' : 'bg-white text-gray-400 group-hover:text-primary shadow-sm'}`}
                                                        onClick={() => document.getElementById(`create-doc-${doc.id}`).click()}
                                                    >
                                                        <doc.icon size={20} />
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        {uploading[doc.id] ? (
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between text-[10px] font-bold text-primary italic uppercase tracking-wider">
                                                                    <span>Uploading...</span>
                                                                    <span>{uploadProgress[doc.id]}%</span>
                                                                </div>
                                                                <Progress value={uploadProgress[doc.id]} className="h-1.5" />
                                                            </div>
                                                        ) : newArtist[doc.id] ? (
                                                            <div className="flex items-center justify-between cursor-pointer" onClick={() => document.getElementById(`create-doc-${doc.id}`).click()}>
                                                                <span className="text-xs font-bold text-green-700 truncate max-w-[120px]">File Uploaded</span>
                                                                <CheckCircle2 size={16} className="text-green-500" />
                                                            </div>
                                                        ) : (
                                                            <div className="cursor-pointer" onClick={() => document.getElementById(`create-doc-${doc.id}`).click()}>
                                                                <span className="text-xs font-bold text-gray-600 block">Click to Upload</span>
                                                                <span className="text-[10px] text-gray-400">PDF, JPG or PNG</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10 pt-6 border-t border-gray-100">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-2xl h-14 border-gray-200 text-gray-500 font-bold hover:bg-gray-50"
                                onClick={() => setIsCreateArtist(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-[2] bg-primary hover:bg-primary/90 rounded-2xl h-14 font-bold text-white shadow-xl shadow-primary/20 transform active:scale-[0.98] transition-all"
                                onClick={handleCreateArtist}
                                disabled={loading || Object.values(uploading).some(v => v)}
                            >
                                <UserPlus className="w-5 h-5 mr-2" />
                                {loading ? 'Registering Artist...' : 'Register Artist Profile'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
