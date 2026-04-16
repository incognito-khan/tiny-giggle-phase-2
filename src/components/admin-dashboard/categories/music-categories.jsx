"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Home,
  Package,
  ShoppingCart,
  Archive,
  Users,
  Settings,
  LogOut,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import { addMusicCategory, getAllMusicCategories, delCategory, updateCategory, addSubMusicCategory, updateSubCategory, delSubCategory } from "@/store/slices/categorySlice";
import Loading from "@/components/loading";
import { format } from "date-fns";
import { toast } from "react-toastify";
import AdminHeader from "@/components/layout/header/admin-header";

export function MusicCategory() {
  const user = useSelector((state) => state.auth.user);
  const categories = useSelector((state) => state.category.categories);
  console.log(categories, "categories");
  const [filteredCategories, setFilteredCategories] = useState(categories);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showCreateSubCategory, setShowCreateSubCategory] = useState(false);
  const [showEditSubForm, setShowEditSubForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    status: "",
  });
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
  });
  const [editCategory, setEditCategory] = useState({
    id: "",
    name: "",
    slug: "",
  })
  const [newSubCategory, setNewSubCategory] = useState({
    name: "",
    slug: "",
    status: "",
    parentId: ""
  })
  const [editSubCategory, setEditSubCategory] = useState({
    id: "",
    name: "",
    slug: "",
    status: "",
    parentId: ""
  })
  const dispatch = useDispatch();

  const gettingAllCategories = () => {
    dispatch(getAllMusicCategories({ setLoading }));
  };

  useEffect(() => {
    gettingAllCategories();
  }, []);

  const fileredData = (category, status) => {
    const data = categories.filter((cat) => {
      const matchesName = category ? cat.name === category : true;
      const matchesStatus = status ? cat.status === status : true;

      return matchesName && matchesStatus;
    });

    setFilteredCategories(data);
  };

  const handleChange = (type, value) => {
    const updatedState = {
      ...filters,
      [type]: value,
    };

    setFilters(updatedState);

    fileredData(updatedState.category, updatedState.status);
  };

  const handleCreateCategory = () => {
    const formData = {
      ...newCategory,
      adminId: user?.id,
      status: "ACTIVE"
    }
    dispatch(addMusicCategory({ setLoading, formData }));
    setShowCreateForm(false);
    setNewCategory({
      name: "",
      slug: ""
    })
  };



  const formatDate = (date) => {
    return format(date, "MMM dd, yyyy");
  };

  const deleteCategory = (categoryId) => {
    if (!categoryId) return;
    dispatch(delCategory({ setLoading, categoryId }));
  }

  const deleteSubCategory = (subCategoryId, parentId) => {
    if (!subCategoryId || !parentId) return;
    dispatch(delSubCategory({ setLoading, categoryId: parentId, subCategoryId }));
  }

  const handleUpdateCategory = () => {
    if (!editCategory.id) return;

    if (editCategory.name.trim() === "" || editCategory.slug.trim() === "") {
      toast.error("Please fill in all fields");
      return;
    }

    const formData = {
      name: editCategory.name,
      slug: editCategory.slug
    }
    dispatch(updateCategory({ setLoading, categoryId: editCategory.id, formData }));
    setShowEditForm(false);
    setEditCategory({
      name: "",
      slug: ""
    })
  }

  const handleCreateSubCategory = () => {
    const formData = {
      ...newSubCategory,
      adminId: user?.id
    }

    dispatch(addSubMusicCategory({ setLoading, formData, categoryId: formData.parentId }))
    setShowCreateSubCategory(false);
    setNewSubCategory({
      name: "",
      slug: "",
      status: "",
      parentId: ""
    })
  }

  const handleUpdateSubCategory = () => {
    if (!editSubCategory.id) return;

    if (editSubCategory.name.trim() === "" || editSubCategory.slug.trim() === "") {
      toast.error("Please fill in all fields");
      return;
    }

    const formData = {
      name: editSubCategory.name,
      slug: editSubCategory.slug,
      status: editSubCategory.status
    }

    dispatch(updateSubCategory({ setLoading, subCategoryId: editSubCategory.id, formData, categoryId: editSubCategory.parentId }))
    setShowEditSubForm(false);
    setEditSubCategory({
      id: "",
      name: "",
      slug: "",
      status: "",
      parentId: ""
    })
  }

  return (
    <div className="flex h-screen bg-background w-full">
      {loading && <Loading />}
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4">
          <AdminHeader title="Category" subTitle="Manage Categories and sub categories" />
        </div>

        {/* Content */}
        <main className="flex-1 p-6">
          <div className="bg-card rounded-lg border border-border">
            {/* Category List Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-card-foreground">
                  Category List
                </h2>
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add category
                </Button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Category
                  </label>
                  <Select onValueChange={(e) => handleChange("category", e)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat, index) => (
                        <SelectItem key={index} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Status
                  </label>
                  <Select onValueChange={(e) => handleChange("status", e)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">
                      NAME
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">
                      Music
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">
                      DATE
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">
                      SLUG
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories?.map((cat, index) => (
                    <React.Fragment key={index}>
                      <tr
                        onClick={() =>
                          setExpandedCategory(expandedCategory === cat.id ? null : cat.id)
                        }
                        className="border-b border-border hover:bg-muted/50"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                              <Package className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <span className="font-medium text-card-foreground">
                              {cat?.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-card-foreground">
                          {cat?._count?.musics}
                        </td>
                        <td className="p-4 text-card-foreground">
                          {cat?.createdAt && formatDate(cat?.createdAt)}
                        </td>
                        <td className="p-4 text-card-foreground">{cat?.slug}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-card-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowCreateSubCategory(true);
                                setNewSubCategory({ ...newSubCategory, parentId: cat?.id })
                              }}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-card-foreground"
                              onClick={() => {
                                setShowEditForm(true);
                                setEditCategory({
                                  id: cat?.id,
                                  name: cat?.name,
                                  slug: cat?.slug
                                })
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => deleteCategory(cat?.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {expandedCategory === cat.id && (
                        <tr className="bg-muted/10">
                          <td colSpan="6" className="p-4">
                            {cat?.subCategories?.length > 0 ? (
                              <div className="border rounded-lg overflow-hidden shadow-sm bg-card">
                                {/* Header */}
                                <div className="grid grid-cols-6 bg-muted text-xs font-semibold uppercase text-muted-foreground px-4 py-2">
                                  <span>Name</span>
                                  <span>Slug</span>
                                  <span>Music</span>
                                  <span>Status</span>
                                  <span>Date</span>
                                  <span className="text-right">Actions</span>
                                </div>

                                {/* Subcategory rows */}
                                <div className="divide-y divide-border">
                                  {cat.subCategories.map((sub, subIndex) => {
                                    const parentId = cat.id;
                                    return (
                                      <div
                                        key={subIndex}
                                        className="grid grid-cols-6 items-center px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
                                      >
                                        <span className="font-medium text-card-foreground truncate">
                                          {sub.name}
                                        </span>

                                        <span className="text-muted-foreground truncate">
                                          {sub.slug}
                                        </span>

                                        <span className="text-muted-foreground truncate">
                                          {sub._count?.music || 0}
                                        </span>

                                        <span
                                          className={`font-semibold ${sub.status === "ACTIVE"
                                            ? "text-green-600"
                                            : "text-red-500"
                                            }`}
                                        >
                                          {sub.status}
                                        </span>

                                        <span className="text-muted-foreground truncate">
                                          {formatDate(sub.createdAt)}
                                        </span>

                                        {/* Actions */}
                                        <div className="flex justify-end gap-2">
                                          <button
                                            className="px-3 py-2 flex items-center gap-3 text-xs rounded-md bg-pink-500 hover:bg-pink-600 text-white transition-all"
                                            onClick={(e) => {
                                              e.stopPropagation(); // Prevent row click toggle
                                              setShowEditSubForm(true);
                                              setEditSubCategory({
                                                id: sub?.id,
                                                name: sub?.name,
                                                slug: sub?.slug,
                                                status: sub?.status,
                                                parentId
                                              });
                                            }}
                                          >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                          </button>
                                          <button
                                            className="px-3 py-2 flex items-center gap-3 text-xs rounded-md bg-purple-500 hover:bg-purple-600 text-white transition-all"
                                            onClick={() => deleteSubCategory(sub?.id, parentId)}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                          </button>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground pl-2 py-2 italic">
                                No subcategories found.
                              </p>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      <Dialog open={showCreateSubCategory} onOpenChange={setShowCreateSubCategory}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Add Sub Category
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Sub Category Name
              </Label>
              <Input
                id="name"
                placeholder="e.g., Video Games"
                value={newSubCategory.name}
                onChange={(e) =>
                  setNewSubCategory({ ...newSubCategory, name: e.target.value })
                }
                className="mt-1 rounded-full"
              />
            </div>

            <div>
              <Label
                htmlFor="slug"
                className="text-sm font-medium text-gray-700"
              >
                Slug
              </Label>
              <Input
                id="slug"
                placeholder="e.g., video-games"
                value={newSubCategory.slug}
                onChange={(e) =>
                  setNewSubCategory({ ...newSubCategory, slug: e.target.value })
                }
                className="mt-1 rounded-full"
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Status
              </label>
              <Select className="w-full" value={newSubCategory.status} onValueChange={(value) => setNewSubCategory({ ...newSubCategory, status: value })}>
                <SelectTrigger className="mt-1 rounded-full w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">
                    ACTIVE
                  </SelectItem>
                  <SelectItem value="INACTIVE">
                    INACTIVE
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 rounded-full bg-transparent"
                onClick={() => setShowCreateSubCategory(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full"
                onClick={handleCreateSubCategory}
              >
                <Save className="w-4 h-4 mr-2" />
                Create Sub Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showEditSubForm} onOpenChange={setShowEditSubForm}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Edit Sub Category
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Sub Category Name
              </Label>
              <Input
                id="name"
                placeholder="e.g., Video Games"
                value={editSubCategory.name}
                onChange={(e) =>
                  setEditSubCategory({ ...editSubCategory, name: e.target.value })
                }
                className="mt-1 rounded-full"
              />
            </div>

            <div>
              <Label
                htmlFor="slug"
                className="text-sm font-medium text-gray-700"
              >
                Slug
              </Label>
              <Input
                id="slug"
                placeholder="e.g., video-games"
                value={editSubCategory.slug}
                onChange={(e) =>
                  setEditSubCategory({ ...editSubCategory, slug: e.target.value })
                }
                className="mt-1 rounded-full"
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Status
              </label>
              <Select className="w-full" value={editSubCategory.status} onValueChange={(value) => setEditSubCategory({ ...editSubCategory, status: value })}>
                <SelectTrigger className="mt-1 rounded-full w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">
                    ACTIVE
                  </SelectItem>
                  <SelectItem value="INACTIVE">
                    INACTIVE
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 rounded-full bg-transparent"
                onClick={() => setShowEditSubForm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full"
                onClick={handleUpdateSubCategory}
              >
                <Save className="w-4 h-4 mr-2" />
                Update Sub Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showEditForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Edit Category
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Category Name
              </Label>
              <Input
                id="name"
                placeholder="e.g., Video Games"
                value={editCategory.name}
                onChange={(e) =>
                  setEditCategory({ ...editCategory, name: e.target.value })
                }
                className="mt-1 rounded-full"
              />
            </div>

            <div>
              <Label
                htmlFor="slug"
                className="text-sm font-medium text-gray-700"
              >
                Slug
              </Label>
              <Input
                id="slug"
                placeholder="e.g., video-games"
                value={editCategory.slug}
                onChange={(e) =>
                  setEditCategory({ ...editCategory, slug: e.target.value })
                }
                className="mt-1 rounded-full"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 rounded-full bg-transparent"
                onClick={() => setShowEditForm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full"
                onClick={handleUpdateCategory}
              >
                <Save className="w-4 h-4 mr-2" />
                Update Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Create New Category
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Category Name
              </Label>
              <Input
                id="name"
                placeholder="e.g., Video Games"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                className="mt-1 rounded-full"
              />
            </div>

            <div>
              <Label
                htmlFor="slug"
                className="text-sm font-medium text-gray-700"
              >
                Slug
              </Label>
              <Input
                id="slug"
                placeholder="e.g., video-games"
                value={newCategory.slug}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, slug: e.target.value })
                }
                className="mt-1 rounded-full"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 rounded-full bg-transparent"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full"
                onClick={handleCreateCategory}
              >
                <Save className="w-4 h-4 mr-2" />
                Create Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
