"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  getAllMusics,
  createMusic,
  delMusic,
  updateMusic,
  getAllArtistMusics,
} from "@/store/slices/musicSlice";
import { getAllMusicCategories } from "@/store/slices/categorySlice";
import { uploadImage, uploadAudio } from "@/store/slices/mediaSlice";
import { useDispatch, useSelector } from "react-redux";
import Loading from "@/components/loading";
import { toast } from "react-toastify";
import AdminHeader from "@/components/layout/header/admin-header";

export function Music() {
  const user = useSelector((state) => state.auth.user);
  const categories = useSelector((state) => state.category.categories);
  console.log("categories", categories);
  const musics = useSelector((state) => state.music.musics);
  console.log("musics", musics);
  const [isCreateMusic, setIsCreateMusic] = useState(false);
  const [isEditMusic, setIsEditMusic] = useState(false);
  const [newMusic, setNewMusic] = useState({
    title: "",
    type: "",
    price: "",
  });
  const [editMusic, setEditMusic] = useState({
    id: "",
    title: "",
    type: "",
    price: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [musicFile, setMusicFile] = useState(null);
  const [musicPreview, setMusicPreview] = useState(null);
  const [categoryId, setCategoryId] = useState(undefined);
  const [subCategoryId, setSubCategoryId] = useState("");
  const [filteredMusics, setFilteredMusics] = useState(musics);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFilterCategory, setSelectedFilterCategory] =
    useState(undefined);
  const dispatch = useDispatch();

  const selectedCategory = categories?.find((cat) => cat.id === categoryId);

  const handleCategoryFilter = (categoryId) => {
    if (!categoryId) {
      setFilteredMusics(musics);
      return;
    }
    if (categoryId === "all") {
      setFilteredMusics(musics);
      return;
    }
    const filtered = musics.filter(
      (music) => music?.category?.id === categoryId,
    );
    setFilteredMusics(filtered);
  };

  const clearFilters = () => {
    setFilteredMusics(musics);
    setSearch("");
    setSelectedFilterCategory("");
  };

  const handleCreateMusic = async () => {
    // console.log(newMusic, categoryId, musicFile, file)
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

    if (!newMusic.title || !newMusic.type) {
      toast.error("Please fill all the fields");
      return;
    }

    if (newMusic.type === "FREE" && newMusic.price > 0) {
      toast.error("Please select PAID type for adding price");
      return;
    }

    if (
      newMusic.type === "PAID" &&
      (newMusic.price === 0 || newMusic.price === "" || newMusic.price === null)
    ) {
      toast.error("Price should be greater than 0");
      return;
    }

    const thumbnailUrl = await dispatch(
      uploadImage({ setLoading, file, parentId: user?.id }),
    ).unwrap();
    const uploadedMusic = await dispatch(
      uploadAudio({ setLoading, parentId: user?.id, file: musicFile }),
    ).unwrap();
    // console.log(uploadedMusic, 'uploadedMusic')

    const body = {
      ...newMusic,
      price: newMusic.price ? parseFloat(newMusic.price) : 0,
      thumbnail: thumbnailUrl,
      url: uploadedMusic?.url,
      mimeType: uploadedMusic?.mimeType,
      size: uploadedMusic?.size,
      uploadedBy: user?.id,
    };

    dispatch(
      createMusic({ setLoading, categoryId, subCategoryId, formData: body }),
    );
    setIsCreateMusic(false);
    setNewMusic({
      title: "",
      type: "",
      price: "",
    });
  };

  const handleEditMusic = async () => {
    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }
    // console.log("editMusic", editMusic);
    if (!editMusic.title || !editMusic.type || !editMusic.id) {
      toast.error("Please fill all the fields");
      return;
    }

    if (editMusic.type === "FREE" && editMusic.price > 0) {
      toast.error("Please select PAID type for adding price");
      return;
    }

    if (
      editMusic.type === "PAID" &&
      (editMusic.price === 0 ||
        editMusic.price === "" ||
        editMusic.price === null)
    ) {
      toast.error("Price should be greater than 0");
      return;
    }

    if (preview && file) {
      const url = await dispatch(
        uploadImage({ setLoading, file, parentId: user?.id }),
      ).unwrap();
      editMusic.thumbnail = url;
    }

    const body = {
      ...editMusic,
      price: editMusic.price ? parseFloat(editMusic.price) : 0,
      categoryId,
    };

    dispatch(updateMusic({ setLoading, body, musicId: editMusic.id }));
    setIsEditMusic(false);
    setEditMusic({
      id: "",
      title: "",
      type: "",
      price: "",
    });
    setFile(null);
    setPreview(null);
  };

  const gettingAllMusic = () => {
    if (user?.role === "artist") {
      dispatch(getAllArtistMusics({ setLoading, search, adminId: user?.id }));
    } else {
      dispatch(getAllMusics({ setLoading, search }));
    }
  };

  const gettingAllCategories = () => {
    dispatch(getAllMusicCategories({ setLoading }));
  };

  useEffect(() => {
    gettingAllMusic();
    gettingAllCategories();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      gettingAllMusic();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setFilteredMusics(musics);
  }, [musics]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  const handleMusicFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setMusicFile(selectedFile);
    if (selectedFile) {
      setMusicPreview(URL.createObjectURL(selectedFile));
      console.log("Selected file:", selectedFile);
      console.log(
        "Preview URL:",
        selectedFile && URL.createObjectURL(selectedFile),
      );
    } else {
      setMusicPreview(null);
    }
  };

  const deleteMusic = (musicId) => {
    if (!musicId) {
      toast.error("Music ID are required to delete a product");
      return;
    }
    dispatch(delMusic({ setLoading, musicId }));
  };

  return (
    <div className="flex h-screen bg-background w-full">
      {loading && <Loading />}
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4">
          <AdminHeader title="Music" subTitle="Manage Music" />
        </div>

        {/* Content */}
        <main className="flex-1 p-6">
          <div className="bg-card rounded-lg border border-border">
            {/* Category List Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-card-foreground">
                  Music List
                </h2>
                {user?.role === "artist" && (
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => setIsCreateMusic(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Music
                  </Button>
                )}
              </div>

              {/* Filters */}
              <div className="grid grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Music Title
                  </label>
                  <Input
                    placeholder="Enter music title"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Category
                  </label>
                  <Select
                    value={selectedFilterCategory}
                    onValueChange={(value) => {
                      handleCategoryFilter(value);
                      setSelectedFilterCategory(value);
                    }}
                  >
                    <SelectTrigger className={`w-[100%]`}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {categories?.map((cat, index) => (
                        <SelectItem key={index} value={cat?.id}>
                          {cat?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground w-full mt-7"
                    onClick={clearFilters}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>

            {/* Table */}
            {musics?.length !== 0 &&
              filteredMusics?.length !== 0 &&
              !loading && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">
                          TRACK
                        </th>
                        <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">
                          TITLE
                        </th>
                        <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">
                          PRICE
                        </th>
                        <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">
                          CATEGORY
                        </th>
                        <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">
                          SUB CATEGORY
                        </th>
                        <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">
                          ARTIST
                        </th>
                        <th className="text-left p-4 font-medium text-muted-foreground uppercase text-sm">
                          ACTION
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMusics?.map((music, index) => (
                        <tr
                          key={index}
                          className="border-b border-border hover:bg-muted/50"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                                <img
                                  src={music?.thumbnail}
                                  alt={music?.title}
                                />
                              </div>
                              <audio
                                controls
                                src={music?.url}
                                className="w-72 h-8"
                              >
                                Your browser does not support the audio element.
                              </audio>
                            </div>
                          </td>
                          <td className="p-4 text-card-foreground">
                            {music?.title}
                          </td>
                          <td className="p-4 text-card-foreground">
                            {music?.type !== "FREE"
                              ? music?.price
                              : music?.type}
                          </td>
                          <td className="p-4 text-card-foreground">
                            {music?.category?.name}
                          </td>
                          <td className="p-4 text-card-foreground">
                            {music?.subCategory?.name}
                          </td>
                          <td className="p-4 text-card-foreground">
                            {music?.uploadedBy?.name}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-card-foreground"
                                onClick={() => {
                                  setEditMusic({
                                    id: music?.id,
                                    title: music?.title,
                                    type: music?.type,
                                    price: music?.price,
                                  });
                                  setIsEditMusic(true);
                                  setPreview(music?.thumbnail);
                                  setCategoryId(music?.category?.id);
                                  setSubCategoryId(music?.subCategory?.id);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => deleteMusic(music?.id)}
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
            {filteredMusics?.length === 0 && !loading && (
              <div className="p-6">
                <p className="text-lg font-medium text-gray-500 text-center">
                  No Music Found
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      <Dialog open={isEditMusic} onOpenChange={setIsEditMusic}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Edit Music
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2">Music Thubmbail</Label>
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
              <Label
                htmlFor="title"
                className="text-sm font-medium text-gray-700"
              >
                Title
              </Label>
              <Input
                id="title"
                placeholder="Title"
                className="mt-1 rounded-full"
                value={editMusic.title}
                onChange={(e) =>
                  setEditMusic({ ...editMusic, title: e.target.value })
                }
              />
            </div>

            <div>
              <Label
                htmlFor="slug"
                className="text-sm font-medium text-gray-700"
              >
                Type
              </Label>
              <Select
                value={editMusic.type}
                onValueChange={(value) =>
                  setEditMusic({ ...editMusic, type: value })
                }
                className="w-full"
              >
                <SelectTrigger className="mt-1 rounded-full w-full">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">FREE</SelectItem>
                  <SelectItem value="PAID">PAID</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor="price"
                className="text-sm font-medium text-gray-700"
              >
                Price
              </Label>
              <Input
                id="price"
                type="text"
                placeholder="Price"
                value={editMusic.price}
                onChange={(e) =>
                  setEditMusic({ ...editMusic, price: e.target.value })
                }
                className="mt-1 rounded-full"
              />
            </div>

            <div>
              <Label
                htmlFor="category"
                className="text-sm font-medium text-gray-700"
              >
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
                    <SelectItem key={index} value={cat?.id}>
                      {cat?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor="subCategory"
                className="text-sm font-medium text-gray-700"
              >
                Sub Category
              </Label>
              <Select
                value={subCategoryId}
                onValueChange={(value) => setSubCategoryId(value)}
                disabled={
                  !categoryId || !selectedCategory?.subCategories?.length
                }
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

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 rounded-full bg-transparent"
                onClick={() => setIsEditMusic(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-secondary rounded-full"
                onClick={handleEditMusic}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Update Music
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isCreateMusic} onOpenChange={setIsCreateMusic}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Upload New Music
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2">Music Thumbnail</Label>
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
              <Label className="mb-2">Select Music</Label>
              <div className="flex items-center justify-between w-full border rounded-lg px-3 py-2">
                <label
                  htmlFor="music-file-upload"
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm px-4 py-2 rounded cursor-pointer"
                >
                  Choose File
                </label>
                <span className="text-gray-500 text-sm truncate">
                  {musicFile ? musicFile.name : "No file chosen"}
                </span>
                <input
                  id="music-file-upload"
                  type="file"
                  accept="audio/*,audio/mpeg,audio/wav,audio/ogg,audio/x-m4a"
                  onChange={handleMusicFileChange}
                  className="hidden"
                />
              </div>
              {musicPreview && (
                <div className="mt-2">
                  <audio
                    controls
                    src={musicPreview}
                    className="w-full h-20 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
            <div>
              <Label
                htmlFor="title"
                className="text-sm font-medium text-gray-700"
              >
                Name
              </Label>
              <Input
                id="title"
                placeholder="Name"
                className="mt-1 rounded-full"
                value={newMusic.title}
                onChange={(e) =>
                  setNewMusic({ ...newMusic, title: e.target.value })
                }
              />
            </div>

            <div>
              <Label
                htmlFor="slug"
                className="text-sm font-medium text-gray-700"
              >
                Type
              </Label>
              <Select
                value={newMusic.type}
                onValueChange={(value) =>
                  setNewMusic({ ...newMusic, type: value })
                }
                className="w-full"
              >
                <SelectTrigger className="mt-1 rounded-full w-full">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">FREE</SelectItem>
                  <SelectItem value="PAID">PAID</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor="costPrice"
                className="text-sm font-medium text-gray-700"
              >
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
                    <SelectItem key={index} value={cat?.id}>
                      {cat?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor="subCategory"
                className="text-sm font-medium text-gray-700"
              >
                Sub Category
              </Label>
              <Select
                value={subCategoryId}
                onValueChange={(value) => setSubCategoryId(value)}
                disabled={
                  !categoryId || !selectedCategory?.subCategories?.length
                }
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
              <Label
                htmlFor="price"
                className="text-sm font-medium text-gray-700"
              >
                Price
              </Label>
              <Input
                id="price"
                type="text"
                placeholder="Price"
                value={newMusic.price}
                onChange={(e) =>
                  setNewMusic({ ...newMusic, price: e.target.value })
                }
                className="mt-1 rounded-full"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 rounded-full bg-transparent"
                onClick={() => setIsCreateMusic(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-secondary rounded-full"
                onClick={handleCreateMusic}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create Music
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
