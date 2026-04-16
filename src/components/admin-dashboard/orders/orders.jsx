"use client"

import { useState, useEffect } from "react"
import { Search, Edit, Trash2, Eye, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { delOrder, getAllOrders, updateOrder, getAllSupplierOrders, getAllParentOrders, updateOrderForParent } from "@/store/slices/orderSlice"
import { getAllCategories } from "@/store/slices/categorySlice"
import { useDispatch, useSelector } from "react-redux"
import Loading from "@/components/loading"
import { toast } from "react-toastify"
import { format } from "date-fns/format"
import { useRouter } from "next/navigation"
import AdminHeader from "@/components/layout/header/admin-header"

export function Orders() {
    const user = useSelector((state) => state.auth.user);
    const orders = useSelector((state) => state.order.orders);
    console.log(orders, 'orders')
    const categories = useSelector((state) => state.category.categories);
    const [filteredProducts, setFilteredProducts] = useState();
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedFilterCategory, setSelectedFilterCategory] = useState(undefined);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editForm, setEditForm] = useState({
        orderStatus: "",
        paymentStatus: ""
    })
    const dispatch = useDispatch();
    const router = useRouter();

    const handleCategoryFilter = (categoryId) => {
        if (!categoryId) {
            setFilteredProducts(products);
            return;
        }
        if (categoryId === "all") {
            setFilteredProducts(products);
            return;
        }
        const filtered = products.filter(product => product?.category?.id === categoryId);
        setFilteredProducts(filtered);
    }

    const clearFilters = () => {
        setFilteredProducts(products);
        setSearch("");
        setSelectedFilterCategory("");
    }

    const handleEditOrder = async (orderId) => {
        if (!editForm.orderStatus || !editForm.paymentStatus) {
            toast.error("Please Select Valid Status")
            return;
        }

        dispatch(updateOrder({ setLoading, orderId, adminId: user?.id, formData: editForm }))
        setEditingIndex(null)
    }

    const gettingAllOrders = () => {
        if (user?.role === 'supplier') {
            dispatch(getAllSupplierOrders({ setLoading, search, adminId: user?.id, search }))
        } else if (user?.role === 'admin') {
            dispatch(getAllOrders({ setLoading, search, adminId: user?.id }))
        } else {
            dispatch(getAllParentOrders({ setLoading, parentId: user?.id }))
        }
    }

    const gettingAllCategories = () => {
        dispatch(getAllCategories({ setLoading }))
    }

    useEffect(() => {
        gettingAllOrders();
        gettingAllCategories();
    }, [])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            gettingAllOrders();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [search]);

    const deleteOrder = (orderId) => {
        if (!orderId) {
            toast.error("Order ID are required to delete a product");
            return;
        }
        dispatch(delOrder({ setLoading, orderId, adminId: user?.id }))
    }

    const handleUpdateOrderStatus = (orderId) => {
        // e.preventDefault();
        const formData = {
            orderStatus: 'CANCELLED'
        }

        dispatch(updateOrderForParent({ setLoading, orderId, parentId: user?.id, formData }))
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
                    <AdminHeader title="Orders" subTitle="Manage Orders" />
                </div>

                {/* Content */}
                <main className="flex-1 p-6">
                    <div className="bg-card rounded-lg border border-border">
                        {/* Category List Header */}
                        <div className="p-6 border-b border-border">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-card-foreground">Orders List</h2>
                            </div>

                            {/* Filters */}
                            <div className="grid grid-cols-4 gap-4 items-center">
                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">Tracing Number</label>
                                    <Input placeholder="Enter tracking number" value={search} onChange={(e) => setSearch(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">Category</label>
                                    <Select value={selectedFilterCategory} onValueChange={(value) => {
                                        handleCategoryFilter(value);
                                        setSelectedFilterCategory(value);
                                    }}>
                                        <SelectTrigger className={`w-[100%]`}>
                                            <SelectValue placeholder="Select category" />
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
                                    <label className="block text-sm font-medium text-card-foreground mb-2">Sub Category</label>
                                    <Select value={selectedFilterCategory} onValueChange={(value) => {
                                        handleCategoryFilter(value);
                                        setSelectedFilterCategory(value);
                                    }}>
                                        <SelectTrigger className={`w-[100%]`}>
                                            <SelectValue placeholder="Select sub category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            {categories?.map((cat, index) => (
                                                <SelectItem key={index} value={cat?.id}>{cat?.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">Supplier Name</label>
                                    <Input placeholder="Enter supplier name" value={search} onChange={(e) => setSearch(e.target.value)} />
                                </div> */}
                                <div>
                                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full mt-7 cursor-pointer" onClick={clearFilters}>
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        {orders?.length !== 0 && !loading && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">TRACKING NUMBER</th>
                                            <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">STATUS</th>
                                            <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">PAYMENT STATUS</th>
                                            <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">ADDRESS</th>
                                            <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">TOTAL PRICE</th>
                                            <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">CREATED AT</th>
                                            <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders?.map((order, index) => (
                                            <tr key={index} className="border-b border-border hover:bg-muted/50">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-medium text-card-foreground">{order?.trackingNumber}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-card-foreground">
                                                    {editingIndex === index ? (
                                                        <select
                                                            value={editForm.orderStatus}
                                                            onChange={(e) => setEditForm({ ...editForm, orderStatus: e.target.value })}
                                                            className="border border-border rounded-md px-2 py-1 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                                        >
                                                            <option value="PENDING">Pending</option>
                                                            <option value="CONFIRMED">Confirmed</option>
                                                            <option value="PROCESSING">Processing</option>
                                                            <option value="SHIPPED">Shipped</option>
                                                            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                                                            <option value="DELIVERED">Delivered</option>
                                                            <option value="CANCELLED">Cancelled</option>
                                                            <option value="RETURN_REQUESTED">Return Requested</option>
                                                            <option value="RETURNED">Returned</option>
                                                            <option value="REFUNDED">Refunded</option>
                                                            <option value="FAILED">Failed</option>
                                                        </select>
                                                    ) : (
                                                        <span>{order?.orderStatus}</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-card-foreground">
                                                    {editingIndex === index ? (
                                                        <select
                                                            value={editForm.paymentStatus}
                                                            onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value })}
                                                            className="border border-border rounded-md px-2 py-1 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                                        >
                                                            <option value="PENDING">Pending Payment</option>
                                                            <option value="PROCESSING">Processing</option>
                                                            <option value="COMPLETED">Completed</option>
                                                            <option value="FAILED">Failed</option>
                                                            <option value="DECLINED">Declined</option>
                                                            <option value="REFUNDED">Refunded</option>
                                                            <option value="PARTIALLY_REFUNDED">Partially Refunded</option>
                                                            <option value="CANCELLED">Cancelled</option>
                                                            <option value="EXPIRED">Expired</option>
                                                            <option value="AUTHORIZED">Authorized</option>
                                                            <option value="CHARGEBACK">Chargeback</option>
                                                        </select>
                                                    ) : (
                                                        <span>{order?.paymentStatus}</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-card-foreground">{order?.shippingAddress}</td>
                                                <td className="p-4 text-card-foreground">{order?.totalPrice}</td>
                                                <td className="p-4 text-card-foreground">{formatDate(order?.createdAt)}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        {(user?.role === 'admin' || user?.role === 'supplier') && (
                                                            editingIndex === index ? (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleEditOrder(order?.id)}
                                                                        className="bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                                                                    >
                                                                        Submit
                                                                    </Button>

                                                                    <Button
                                                                        className="bg-pink-500 hover:bg-pink-600 cursor-pointer"
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
                                                                    className="text-muted-foreground hover:text-card-foreground cursor-pointer"
                                                                    onClick={() => {
                                                                        setEditingIndex(index);
                                                                        setEditForm({
                                                                            paymentStatus: order?.paymentStatus,
                                                                            orderStatus: order?.orderStatus
                                                                        })
                                                                    }}
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </Button>
                                                            )
                                                        )}

                                                        {editingIndex !== index && (
                                                            <>
                                                                {(user?.role === 'admin' || user?.role === 'supplier') && (
                                                                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-card-foreground cursor-pointer"
                                                                        onClick={() => deleteOrder(order?.id)}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                )}
                                                                {user?.role === 'parent' && order?.orderStatus !== 'CANCELLED' && (
                                                                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-card-foreground cursor-pointer" title="Cancel Order"
                                                                        onClick={() => handleUpdateOrderStatus(order?.id)}
                                                                    >
                                                                        <XCircle className="w-4 h-4" />
                                                                    </Button>
                                                                )}
                                                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-card-foreground cursor-pointer"
                                                                    onClick={() => router.push(user?.role === 'admin' ? `/admin-dashboard/orders/${order?.id}` : `/parent-dashboard/orders/${order?.id}`)}
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {orders?.length === 0 && !loading && (
                            <div className="p-6">
                                <p className="text-lg font-medium text-gray-500 text-center">
                                    No Order Found
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>


            {/* <Dialog open={isEditProduct} onOpenChange={setIsEditProduct}>
                <DialogContent className="sm:max-w-md rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-800">Edit Product</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label className="mb-2">Product Image</Label>
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
                        <div>
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                Name
                            </Label>
                            <Input
                                id="name"
                                placeholder="Name"
                                className="mt-1 rounded-full"
                                value={editProduct.name}
                                onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <Label htmlFor="slug" className="text-sm font-medium text-gray-700">
                                Slug
                            </Label>
                            <Input
                                id="slug"
                                placeholder="Slug"
                                className="mt-1 rounded-full"
                                value={editProduct.slug}
                                onChange={(e) => setEditProduct({ ...editProduct, slug: e.target.value })}
                            />
                        </div>

                        <div>
                            <Label htmlFor="costPrice" className="text-sm font-medium text-gray-700">
                                Category
                            </Label>
                            <Select
                                value={categoryId}
                                onValueChange={(value) => setCategoryId(value)}
                                className="w-full"
                            >
                                <SelectTrigger className="mt-1 rounded-full w-full">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories?.map((cat, index) => (
                                        <SelectItem key={index} value={cat?.id}>{cat?.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="costPrice" className="text-sm font-medium text-gray-700">
                                Cost Price
                            </Label>
                            <Input
                                id="costPrice"
                                type="text"
                                placeholder="Cost Price"
                                value={editProduct.costPrice}
                                onChange={(e) => setEditProduct({ ...editProduct, costPrice: e.target.value })}
                                className="mt-1 rounded-full"
                            />
                        </div>

                        <div>
                            <Label htmlFor="salePrice" className="text-sm font-medium text-gray-700">
                                Sale Price
                            </Label>
                            <Input
                                id="salePrice"
                                type="text"
                                placeholder="Sale Price"
                                value={editProduct.salePrice}
                                onChange={(e) => setEditProduct({ ...editProduct, salePrice: e.target.value })}
                                className="mt-1 rounded-full"
                            />
                        </div>

                        <div>
                            <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                                Quantity
                            </Label>
                            <Input
                                id="quantity"
                                type="text"
                                placeholder="Quantity"
                                value={editProduct.quantity}
                                onChange={(e) => setEditProduct({ ...editProduct, quantity: e.target.value })}
                                className="mt-1 rounded-full"
                            />
                        </div>

                        <div>
                            <Label htmlFor="taxPercent" className="text-sm font-medium text-gray-700">
                                Tax Percent
                            </Label>
                            <Input
                                id="taxPercent"
                                type="text"
                                placeholder="Tax Percent"
                                value={editProduct.taxPercent}
                                onChange={(e) => setEditProduct({ ...editProduct, taxPercent: e.target.value })}
                                className="mt-1 rounded-full"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-full bg-transparent"
                                onClick={() => setIsEditProduct(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-secondary rounded-full"
                                onClick={handleEditProduct}
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Update Product
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog> */}
        </div>
    )
}
