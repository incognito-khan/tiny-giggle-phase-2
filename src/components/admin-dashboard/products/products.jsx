"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { getAllProducts, createProduct, delProduct, updateProduct, getAllParentProducts } from "@/store/slices/productSlice"
import { getAllCategories } from "@/store/slices/categorySlice"
import { uploadImage } from "@/store/slices/mediaSlice"
import { useDispatch, useSelector } from "react-redux"
import Loading from "@/components/loading"
import { toast } from "react-toastify"
import AdminHeader from "@/components/layout/header/admin-header"

export function Products() {
  const user = useSelector((state) => state.auth.user);
  const categories = useSelector((state) => state.category.categories);
  console.log("categories", categories);
  const products = useSelector((state) => state.product.products);
  console.log("products", products);
  const [isCreateProduct, setIsCreateProduct] = useState(false)
  const [isEditProduct, setIsEditProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    slug: "",
    costPrice: "",
    salePrice: "",
    quantity: "",
    taxPercent: "",
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
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [categoryId, setCategoryId] = useState(undefined);
  const [subCategoryId, setSubCategoryId] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState(undefined);
  const dispatch = useDispatch();

  const selectedCategory = categories?.find(cat => cat.id === categoryId);

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

  const handleCreateProduct = async () => {
    if (!file) {
      toast.error("Please select an image file");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }

    if (!subCategoryId) {
      toast.error("Please select a sub category");
      return;
    }

    if (!newProduct.name || !newProduct.slug || !newProduct.costPrice || !newProduct.salePrice || !newProduct.quantity || !newProduct.taxPercent) {
      toast.error("Please fill all the fields");
      return;
    }

    const url = await dispatch(uploadImage({ setLoading, file, parentId: user?.id })).unwrap();

    const body = {
      ...newProduct,
      costPrice: newProduct.costPrice ? parseFloat(newProduct.costPrice) : 0,
      salePrice: newProduct.salePrice ? parseFloat(newProduct.salePrice) : 0,
      quantity: newProduct.quantity ? parseInt(newProduct.quantity) : 0,
      taxPercent: newProduct.taxPercent ? parseFloat(newProduct.taxPercent) : 0,
      image: url,
      listedBy: user?.id
    }

    dispatch(createProduct({ setLoading, categoryId, body, subCategoryId }))
    setIsCreateProduct(false)
    setNewProduct({
      name: "",
      code: "",
      category: "",
      quantity: "",
      date: ""
    })
  }

  const handleEditProduct = async () => {
    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }
    if (!subCategoryId) {
      toast.error("Please select a category");
      return;
    }

    console.log("editProduct", editProduct);
    if (!editProduct.name || !editProduct.slug || !editProduct.salePrice || !editProduct.quantity) {
      toast.error("Please fill all the fields");
      return;
    }

    if (preview && file) {
      const url = await dispatch(uploadImage({ setLoading, file, parentId: user?.id })).unwrap();
      editProduct.image = url;
    }

    const formData = {
      ...editProduct,
      costPrice: editProduct.costPrice ? parseFloat(editProduct.costPrice) : 0,
      salePrice: editProduct.salePrice ? parseFloat(editProduct.salePrice) : 0,
      quantity: editProduct.quantity ? parseInt(editProduct.quantity) : 0,
      taxPercent: editProduct.taxPercent ? parseFloat(editProduct.taxPercent) : 0,
      categoryId,
      subCategoryId
    }

    dispatch(updateProduct({ setLoading, categoryId, formData, productId: editProduct.id }))
    setIsEditProduct(false)
    setEditProduct({
      name: "",
      slug: "",
      costPrice: "",
      salePrice: "",
      quantity: "",
      taxPercent: "",
    })
    setFile(null);
    setPreview(null);
  }

  const gettingAllProducts = () => {
    if (user?.role === 'supplier') {
      dispatch(getAllParentProducts({ setLoading, search, parentId: user?.id }))
    } else {
      dispatch(getAllProducts({ setLoading, search }))
    }
  }

  const gettingAllCategories = () => {
    dispatch(getAllCategories({ setLoading }))
  }

  useEffect(() => {
    gettingAllProducts();
    gettingAllCategories();
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      gettingAllProducts();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  const deleteProduct = (categoryId, productId) => {
    if (!categoryId || !productId) {
      toast.error("Category ID and Product ID are required to delete a product");
      return;
    }
    dispatch(delProduct({ setLoading, categoryId, productId }))
  }

  return (
    <div className="flex h-screen bg-background w-full">
      {loading && <Loading />}
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4">
          <AdminHeader title="Products" subTitle="Manage Products" />
        </div>

        {/* Content */}
        <main className="flex-1 p-6">
          <div className="bg-card rounded-lg border border-border">
            {/* Category List Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-card-foreground">Products List</h2>
                {user?.role === 'supplier' && (
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setIsCreateProduct(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                )}
              </div>

              {/* Filters */}
              <div className="grid grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Product Name</label>
                  <Input placeholder="Enter product name" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                {/* <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Status</label>
                  <Select value={filters.status} onValueChange={(e) => handleChange("status", e)}>
                    <SelectTrigger className={`w-[100%]`}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}
                <div>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full mt-7" onClick={clearFilters}>
                    Clear
                  </Button>
                </div>
              </div>
            </div>

            {/* Table */}
            {products?.length !== 0 && filteredProducts?.length !== 0 && !loading && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">NAME</th>
                      <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">CODE</th>
                      <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">CATEGORY</th>
                      <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">SUB CATEGORY</th>
                      <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">QUANTITY</th>
                      <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">PRICE</th>
                      <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts?.map((product, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                              {/* <Package className="w-4 h-4 text-muted-foreground" /> */}
                              <img src={product?.image} alt={product?.name} />
                            </div>
                            <span className="font-medium text-card-foreground">{product?.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-card-foreground">{product?.slug}</td>
                        <td className="p-4 text-card-foreground">{product?.category?.name}</td>
                        <td className="p-4 text-card-foreground">{product?.subCategory?.name}</td>
                        <td className="p-4 text-card-foreground">{product?.quantity}</td>
                        <td className="p-4 text-card-foreground">{product?.salePrice}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-card-foreground"
                              onClick={() => {
                                setEditProduct({
                                  id: product?.id,
                                  name: product?.name,
                                  slug: product?.slug,
                                  costPrice: product?.costPrice,
                                  salePrice: product?.salePrice,
                                  quantity: product?.quantity,
                                  taxPercent: product?.taxPercent,
                                });
                                setIsEditProduct(true);
                                setPreview(product?.image);
                                setCategoryId(product?.category?.id);
                                setSubCategoryId(product?.subCategory?.id)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive"
                              onClick={() => deleteProduct(product?.category?.id, product?.id)}
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
            {filteredProducts?.length === 0 && !loading && (
              <div className="p-6">
                <p className="text-lg font-medium text-gray-500 text-center">
                  No Products Found
                </p>
              </div>
            )}
          </div>
        </main>
      </div>


      <Dialog open={isEditProduct} onOpenChange={setIsEditProduct}>
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
              <Label htmlFor="subCategory" className="text-sm font-medium text-gray-700">
                Sub Category
              </Label>
              <Select
                value={subCategoryId}
                onValueChange={(value) => setSubCategoryId(value)}
                disabled={!categoryId || !selectedCategory?.subCategories?.length}
                className="w-full"
              >
                <SelectTrigger className="mt-1 rounded-full w-full">
                  <SelectValue
                    placeholder={
                      !categoryId
                        ? "Select Category first"
                        : selectedCategory?.subCategories?.length
                          ? "Select Sub Category"
                          : "No Sub Categories Found"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategory?.subCategories?.length > 0 ? (
                    selectedCategory.subCategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No subcategories available
                    </div>
                  )}
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
      </Dialog>
      <Dialog open={isCreateProduct} onOpenChange={setIsCreateProduct}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">Create New Product</DialogTitle>
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
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
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
                value={newProduct.slug}
                onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="costPrice" className="text-sm font-medium text-gray-700">
                Category
              </Label>
              <Select
                value={categoryId}
                onValueChange={(value) => {
                  setCategoryId(value);
                  setSubCategoryId("")
                }}
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
              <Label htmlFor="subCategory" className="text-sm font-medium text-gray-700">
                Sub Category
              </Label>
              <Select
                value={subCategoryId}
                onValueChange={(value) => setSubCategoryId(value)}
                disabled={!categoryId || !selectedCategory?.subCategories?.length}
                className="w-full"
              >
                <SelectTrigger className="mt-1 rounded-full w-full">
                  <SelectValue
                    placeholder={
                      !categoryId
                        ? "Select Category first"
                        : selectedCategory?.subCategories?.length
                          ? "Select Sub Category"
                          : "No Sub Categories Found"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategory?.subCategories?.length > 0 ? (
                    selectedCategory.subCategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No subcategories available
                    </div>
                  )}
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
                value={newProduct.costPrice}
                onChange={(e) => setNewProduct({ ...newProduct, costPrice: e.target.value })}
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
                value={newProduct.salePrice}
                onChange={(e) => setNewProduct({ ...newProduct, salePrice: e.target.value })}
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
                value={newProduct.quantity}
                onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
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
                value={newProduct.taxPercent}
                onChange={(e) => setNewProduct({ ...newProduct, taxPercent: e.target.value })}
                className="mt-1 rounded-full"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 rounded-full bg-transparent"
                onClick={() => setIsCreateProduct(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-secondary rounded-full"
                onClick={handleCreateProduct}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
