"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Plus, Edit, Trash2, UserPlus, FileText, CheckCircle, CloudUpload, Upload, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { getAllProducts, createProduct, delProduct, updateProduct } from "@/store/slices/productSlice"
import { createSupplier, getAllSuppliers, updateSupplier, deleteSupplier } from "@/store/slices/supplierSlice"
import { getAllCategories } from "@/store/slices/categorySlice"
import { uploadImage } from "@/store/slices/mediaSlice"
import { useDispatch, useSelector } from "react-redux"
import Loading from "@/components/loading"
import { toast } from "react-toastify"
import { format } from "date-fns/format"
import AdminHeader from "@/components/layout/header/admin-header"

export function Suppliers() {
    const user = useSelector((state) => state.auth.user);
    const categories = useSelector((state) => state.category.categories);
    console.log("categories", categories);
    const products = useSelector((state) => state.product.products);
    console.log("products", products);
    const suppliers = useSelector((state) => state.supplier.suppliers);
    console.log(suppliers, 'suppliers')
    const [isCreateSupplier, setIsCreateSupplier] = useState(false)
    const [isEditProduct, setIsEditProduct] = useState(false);
    const [isEditSupplier, setIsEditSupplier] = useState(false);
    const [newSupplier, setNewSupplier] = useState({
        name: "",
        cnic: "",
        email: "",
        city: "",
        state: "",
        country: "",
        status: "INACTIVE",
        nationalId: "",
        businessRegistration: "",
        taxId: "",
        productCatalog: "",
        insurance: "",
    })
    const [editSupplier, setEditSupplier] = useState({
        id: "",
        name: "",
        cnic: "",
        email: "",
        city: "",
        state: "",
        country: "",
        status: "",
        nationalId: "",
        businessRegistration: "",
        taxId: "",
        productCatalog: "",
        insurance: "",
        isVerified: false,
        isPaid: false
    })
    const [editProduct, setEditProduct] = useState({
        id: "",
        name: "",
        slug: "",
        costPrice: "",
        salePrice: "",
        quantity: "",
        taxPercent: "",
    })
    const [uploading, setUploading] = useState({
        nationalId: false,
        businessRegistration: false,
        taxId: false,
        productCatalog: false,
        insurance: false
    })
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [categoryId, setCategoryId] = useState(undefined);
    const [subCategoryId, setSubCategoryId] = useState(undefined);
    const [filteredSuppliers, setFilteredSuppliers] = useState(suppliers)
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedFilterCategory, setSelectedFilterCategory] = useState(undefined);
    const [selectedFilterStatus, setSelectedFilterStatus] = useState(undefined);
    const [editingIndex, setEditingIndex] = useState(null);
    const dispatch = useDispatch();

    const selectedCategory = categories?.find(cat => cat.id === categoryId);

    const handleCategoryFilter = (categoryId) => {
        if (!categoryId) {
            setFilteredSuppliers(suppliers);
            return;
        }
        if (categoryId === "all") {
            setFilteredSuppliers(suppliers);
            return;
        }
        const filtered = suppliers.filter(supplier => supplier?.category?.id === categoryId);
        setFilteredSuppliers(filtered);
    }

    const handleStatusFilter = (selectedFilterStatus) => {
        if (!selectedFilterStatus) {
            setFilteredSuppliers(suppliers);
            return;
        }
        if (selectedFilterStatus === "all") {
            setFilteredSuppliers(suppliers);
            return;
        }
        const filtered = suppliers.filter(supplier => supplier?.status === selectedFilterStatus);
        setFilteredSuppliers(filtered);
    }

    const clearFilters = () => {
        setFilteredSuppliers(suppliers);
        setSearch("");
        setSelectedFilterCategory("");
        setSelectedFilterStatus("")
    }

    const handleFileUpload = async (e, field, isEdit = false) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(prev => ({ ...prev, [field]: true }));
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
                if (isEdit) {
                    setEditSupplier(prev => ({ ...prev, [field]: data.url }));
                } else {
                    setNewSupplier(prev => ({ ...prev, [field]: data.url }));
                }
                toast.success(`${field.replace(/([A-Z])/g, ' $1').trim()} uploaded successfully`);
            }
        } catch (err) {
            toast.error("File upload failed");
        } finally {
            setUploading(prev => ({ ...prev, [field]: false }));
        }
    };

    const handleCreateSupplier = async () => {
        if (!categoryId) {
            toast.error("Please select a category");
            return;
        }

        if (!subCategoryId) {
            toast.error("Please select a sub category");
            return;
        }

        if (!newSupplier.name || !newSupplier.email || !newSupplier.cnic) {
            toast.error("Required basic fields are missing");
            return;
        }

        const isUploading = Object.values(uploading).some(v => v);
        if (isUploading) {
            toast.warning("Please wait for files to finish uploading");
            return;
        }

        const formData = {
            ...newSupplier,
            categoryId,
            subCategoryId
        }

        dispatch(createSupplier({ setLoading, adminId: user?.id, formData }))
        setIsCreateSupplier(false)
        setNewSupplier({
            name: "",
            email: "",
            cnic: "",
            state: "",
            city: "",
            country: "",
            status: "INACTIVE",
            nationalId: "",
            businessRegistration: "",
            taxId: "",
            productCatalog: "",
            insurance: "",
        })
    }

    const handleEditSupplier = async () => {
        if (!categoryId) {
            toast.error("Please select a category");
            return;
        }
        if (!subCategoryId) {
            toast.error("Please select a sub category");
            return;
        }
        
        if (!editSupplier.name || !editSupplier.cnic || !editSupplier.email) {
            toast.error("Basic fields are required");
            return;
        }

        const formData = {
            ...editSupplier,
            categoryId,
            subCategoryId
        }

        dispatch(updateSupplier({ setLoading, adminId: user?.id, formData, supplierId: editSupplier.id }))
        setIsEditSupplier(false)
        setEditSupplier({
            id: "",
            name: "",
            cnic: "",
            email: "",
            state: "",
            city: "",
            country: "",
            status: "",
            nationalId: "",
            businessRegistration: "",
            taxId: "",
            productCatalog: "",
            insurance: "",
            isVerified: false,
            isPaid: false
        })
    }

    const gettingAllSuppliers = () => {
        dispatch(getAllSuppliers({ setLoading, search, adminId: user?.id }))
    }

    const gettingAllCategories = () => {
        dispatch(getAllCategories({ setLoading }))
    }

    useEffect(() => {
        gettingAllSuppliers();
        gettingAllCategories();
    }, [])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            gettingAllSuppliers();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [search]);

    useEffect(() => {
        setFilteredSuppliers(suppliers);
    }, [suppliers])

    const delSupplier = (supplierId) => {
        if (!supplierId) {
            toast.error("Supplier ID are required to delete a product");
            return;
        }
        dispatch(deleteSupplier({ setLoading, supplierId, adminId: user?.id }))
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
                    <AdminHeader title="Suppliers" subTitle="Manage Suppliers" />
                </div>

                {/* Content */}
                <main className="flex-1 p-6">
                    <div className="bg-card rounded-lg border border-border">
                        {/* Category List Header */}
                        <div className="p-6 border-b border-border">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-card-foreground">Suppliers List</h2>
                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setIsCreateSupplier(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Supplier
                                </Button>
                            </div>

                            {/* Filters */}
                            <div className="grid grid-cols-4 gap-4 items-center">
                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">Supplier Name</label>
                                    <Input placeholder="Enter supplier name" value={search} onChange={(e) => setSearch(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">Category</label>
                                    <Select value={selectedFilterCategory} onValueChange={(value) => {
                                        handleCategoryFilter(value);
                                        setSelectedFilterCategory(value);
                                    }}>
                                        <SelectTrigger className={`w-[100%]`}>
                                            <SelectValue placeholder="Select Supplier Category" />
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
                                            <SelectValue placeholder="Select Supplier Status" />
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
                        {suppliers?.length !== 0 && filteredSuppliers?.length > 0 && !loading && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">FULL NAME</th>
                                            <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">CNIC</th>
                                            <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">COUNTRY</th>
                                            <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">ADDRESS</th>
                                            <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">STATUS</th>
                                            {/* <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">SUBSCRIPTION</th> */}
                                            <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">CATEGORY</th>
                                            <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSuppliers?.map((supplier, index) => (
                                            <tr key={index} className="border-b border-border hover:bg-muted/50">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-medium text-card-foreground">{supplier?.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-card-foreground">{supplier?.cnic}</td>
                                                <td className="p-4 text-card-foreground">{supplier?.country}</td>
                                                <td
                                                    className="p-4 text-card-foreground max-w-xs truncate"
                                                    title={supplier?.city}
                                                >
                                                    {supplier?.city}, {supplier?.state}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${supplier?.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                            {supplier?.status}
                                                        </div>
                                                        <div className="flex gap-1.5">
                                                            {supplier?.isVerified && (
                                                                <div className="flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shadow-sm border border-blue-100">
                                                                    <ShieldCheck className="w-2.5 h-2.5" /> VERIFIED
                                                                </div>
                                                            )}
                                                            {supplier?.isPaid ? (
                                                                <div className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded shadow-sm border border-emerald-100 uppercase">
                                                                    Paid
                                                                </div>
                                                            ) : (
                                                                <div className="text-[9px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded shadow-sm border border-rose-100 uppercase">
                                                                    Unpaid
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-card-foreground">
                                                    <div className="text-sm font-medium">{supplier?.category?.name}</div>
                                                    <div className="text-[10px] text-muted-foreground">{supplier?.subCategory?.name}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-muted-foreground hover:text-card-foreground"
                                                            onClick={() => {
                                                                setIsEditSupplier(true);
                                                                  setEditSupplier({
                                                                    id: supplier?.id,
                                                                    name: supplier?.name,
                                                                    email: supplier?.email,
                                                                    cnic: supplier?.cnic,
                                                                    country: supplier?.country,
                                                                    state: supplier?.state,
                                                                    city: supplier?.city,
                                                                    status: supplier?.status,
                                                                    nationalId: supplier?.nationalId,
                                                                    businessRegistration: supplier?.businessRegistration,
                                                                    taxId: supplier?.taxId,
                                                                    productCatalog: supplier?.productCatalog,
                                                                    insurance: supplier?.insurance,
                                                                    isVerified: supplier?.isVerified,
                                                                    isPaid: supplier?.isPaid
                                                                });
                                                                setCategoryId(supplier?.category?.id);
                                                                setSubCategoryId(supplier?.subCategory?.id)
                                                            }}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive"
                                                            onClick={() => delSupplier(supplier?.id)}
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
                        {filteredSuppliers?.length === 0 && !loading && (
                            <div className="p-6">
                                <p className="text-lg font-medium text-gray-500 text-center">
                                    No Supplier Found
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <Dialog open={isEditSupplier} onOpenChange={setIsEditSupplier}>
                <DialogContent className="sm:max-w-3xl rounded-3xl overflow-y-auto max-h-[90vh] bg-white/95 backdrop-blur-md border-pink-100 shadow-2xl">
                    <DialogHeader className="pb-4 border-b">
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            Edit Professional Supplier
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-6 space-y-8">
                        {/* Section 1: Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-pink-500 rounded-full" />
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium ml-1">Full Name</Label>
                                    <Input
                                        placeholder="Enter full name"
                                        className="rounded-xl border-gray-200 focus:ring-pink-500"
                                        value={editSupplier.name}
                                        onChange={(e) => setEditSupplier({ ...editSupplier, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium ml-1">Email Address</Label>
                                    <Input
                                        placeholder="email@example.com"
                                        className="rounded-xl border-gray-200 focus:ring-pink-500"
                                        value={editSupplier.email}
                                        onChange={(e) => setEditSupplier({ ...editSupplier, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium ml-1">CNIC / ID Number</Label>
                                    <Input
                                        placeholder="12345-6789012-3"
                                        className="rounded-xl border-gray-200 focus:ring-pink-500"
                                        value={editSupplier.cnic}
                                        onChange={(e) => setEditSupplier({ ...editSupplier, cnic: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium ml-1">Account Status</Label>
                                    <Select
                                        value={editSupplier.status}
                                        onValueChange={(value) => setEditSupplier({ ...editSupplier, status: value })}
                                    >
                                        <SelectTrigger className="rounded-xl border-gray-200">
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                                            <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Localization */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                                Location & Category
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium ml-1">Category</Label>
                                    <Select value={categoryId} onValueChange={setCategoryId}>
                                        <SelectTrigger className="rounded-xl border-gray-200">
                                            <SelectValue placeholder="Product Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories?.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium ml-1">Sub Category</Label>
                                    <Select value={subCategoryId} onValueChange={setSubCategoryId} disabled={!categoryId}>
                                        <SelectTrigger className="rounded-xl border-gray-200">
                                            <SelectValue placeholder="Specific Specialty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedCategory?.subCategories?.map(sub => (
                                                <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium ml-1">Country</Label>
                                    <Input
                                        placeholder="Country"
                                        className="rounded-xl border-gray-200"
                                        value={editSupplier.country}
                                        onChange={(e) => setEditSupplier({ ...editSupplier, country: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium ml-1">State</Label>
                                        <Input
                                            placeholder="State"
                                            className="rounded-xl border-gray-200"
                                            value={editSupplier.state}
                                            onChange={(e) => setEditSupplier({ ...editSupplier, state: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium ml-1">City</Label>
                                        <Input
                                            placeholder="City"
                                            className="rounded-xl border-gray-200"
                                            value={editSupplier.city}
                                            onChange={(e) => setEditSupplier({ ...editSupplier, city: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Professional Documents */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                                Professional Verification Documents
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { id: 'nationalId', label: 'National ID / Passport' },
                                    { id: 'businessRegistration', label: 'Business Registration' },
                                    { id: 'taxId', label: 'Tax ID Certificate' },
                                    { id: 'productCatalog', label: 'Product Catalog' },
                                    { id: 'insurance', label: 'Professional Insurance' }
                                ].map((doc) => (
                                    <div key={doc.id} className="relative p-4 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{doc.label}</Label>
                                        <div className="flex items-center gap-3">
                                            {editSupplier[doc.id] ? (
                                                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-xs font-medium">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Document Linked
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-gray-400 text-xs italic">
                                                    <FileText className="w-4 h-4" />
                                                    No file selected
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                id={`edit-${doc.id}`}
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(e, doc.id, true)}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="ml-auto rounded-full h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
                                                onClick={() => document.getElementById(`edit-${doc.id}`).click()}
                                                disabled={uploading[doc.id]}
                                            >
                                                {uploading[doc.id] ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-pink-500 border-t-transparent" />
                                                ) : (
                                                    <CloudUpload className="w-4 h-4 text-pink-500" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-2xl h-12 border-gray-200 hover:bg-gray-50 font-medium"
                                onClick={() => setIsEditSupplier(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 rounded-2xl h-12 bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 transition-opacity font-bold text-white shadow-lg shadow-pink-200"
                                onClick={handleEditSupplier}
                                disabled={Object.values(uploading).some(v => v)}
                            >
                                {loading ? "Saving Changes..." : "Update Supplier Profile"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isCreateSupplier} onOpenChange={setIsCreateSupplier}>
                <DialogContent className="sm:max-w-3xl rounded-3xl overflow-y-auto max-h-[90vh] bg-white border-pink-100 shadow-2xl">
                    <DialogHeader className="pb-4 border-b">
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            Onboard New Professional Supplier
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-6 space-y-8">
                        {/* Section 1: Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-pink-500 rounded-full" />
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium ml-1">Full Name</Label>
                                    <Input
                                        placeholder="Enter full name"
                                        className="rounded-xl border-gray-200 focus:ring-pink-500"
                                        value={newSupplier.name}
                                        onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium ml-1">Email Address</Label>
                                    <Input
                                        placeholder="email@example.com"
                                        className="rounded-xl border-gray-200 focus:ring-pink-500"
                                        value={newSupplier.email}
                                        onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium ml-1">CNIC / ID Number</Label>
                                    <Input
                                        placeholder="12345-6789012-3"
                                        className="rounded-xl border-gray-200 focus:ring-pink-500"
                                        value={newSupplier.cnic}
                                        onChange={(e) => setNewSupplier({ ...newSupplier, cnic: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium ml-1">Initial Status</Label>
                                    <Select
                                        value={newSupplier.status}
                                        onValueChange={(value) => setNewSupplier({ ...newSupplier, status: value })}
                                    >
                                        <SelectTrigger className="rounded-xl border-gray-200">
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                                            <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Localization */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                                Location & Category
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium ml-1">Category</Label>
                                    <Select value={categoryId} onValueChange={setCategoryId}>
                                        <SelectTrigger className="rounded-xl border-gray-200">
                                            <SelectValue placeholder="Product Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories?.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium ml-1">Sub Category</Label>
                                    <Select value={subCategoryId} onValueChange={setSubCategoryId} disabled={!categoryId}>
                                        <SelectTrigger className="rounded-xl border-gray-200">
                                            <SelectValue placeholder="Specific Specialty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedCategory?.subCategories?.map(sub => (
                                                <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium ml-1">Country</Label>
                                    <Input
                                        placeholder="Country"
                                        className="rounded-xl border-gray-200"
                                        value={newSupplier.country}
                                        onChange={(e) => setNewSupplier({ ...newSupplier, country: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium ml-1">State</Label>
                                        <Input
                                            placeholder="State"
                                            className="rounded-xl border-gray-200"
                                            value={newSupplier.state}
                                            onChange={(e) => setNewSupplier({ ...newSupplier, state: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium ml-1">City</Label>
                                        <Input
                                            placeholder="City"
                                            className="rounded-xl border-gray-200"
                                            value={newSupplier.city}
                                            onChange={(e) => setNewSupplier({ ...newSupplier, city: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Professional Documents */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                                Professional Verification Documents
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { id: 'nationalId', label: 'National ID / Passport' },
                                    { id: 'businessRegistration', label: 'Business Registration' },
                                    { id: 'taxId', label: 'Tax ID Certificate' },
                                    { id: 'productCatalog', label: 'Product Catalog' },
                                    { id: 'insurance', label: 'Professional Insurance' }
                                ].map((doc) => (
                                    <div key={doc.id} className="relative p-4 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{doc.label}</Label>
                                        <div className="flex items-center gap-3">
                                            {newSupplier[doc.id] ? (
                                                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-xs font-medium">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Uploaded
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-gray-400 text-xs italic">
                                                    <FileText className="w-4 h-4" />
                                                    No file uploaded
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                id={`new-${doc.id}`}
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(e, doc.id, false)}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="ml-auto rounded-full h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
                                                onClick={() => document.getElementById(`new-${doc.id}`).click()}
                                                disabled={uploading[doc.id]}
                                            >
                                                {uploading[doc.id] ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-pink-500 border-t-transparent" />
                                                ) : (
                                                    <CloudUpload className="w-4 h-4 text-pink-500" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-2xl h-12 border-gray-200 hover:bg-gray-50 font-medium"
                                onClick={() => setIsCreateSupplier(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 rounded-2xl h-12 bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 transition-opacity font-bold text-white shadow-lg shadow-pink-200"
                                onClick={handleCreateSupplier}
                                disabled={Object.values(uploading).some(v => v)}
                            >
                                {loading ? "Creating..." : "Onboard Supplier"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
