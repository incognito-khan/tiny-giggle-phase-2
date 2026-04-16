"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Calendar,
  MessageCircle,
  Search,
  User,
  Baby,
  Heart,
  Camera,
  Clock,
  Smile,
  Moon,
  Utensils,
  Bath,
  BookOpen,
  Music,
  Upload,
  Plus,
  ImageIcon,
  FolderPlus,
  Edit,
  Trash2,
  MoreVertical,
  X,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { getAllFolders, createFolder, uploadImageToFolder, updateFolder, deleteFolder } from "@/store/slices/folderSlice";
import Loading from "../../../../components/loading/index";
import ParentHeader from "@/components/layout/header/parent-header";

export default function AlbumsPage() {
  const user = useSelector((state) => state.auth.user);
  const folders = useSelector((state) => state.folder.folders);
  console.log(folders, "folders");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUploadImage, setShowUploadImage] = useState(false);
  const [mode, setMode] = useState("create");
  const [folderId, setFolderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newAlbum, setNewAlbum] = useState({
    name: "",
    type: "",
  });
  const dispatch = useDispatch();

  // Sample albums data
  const albums = [
    {
      id: 1,
      title: "Emma's First Year",
      description: "Precious moments from Emma's first 12 months",
      coverImage: "/placeholder.svg?height=200&width=300",
      imageCount: 247,
      createdDate: "2024-01-15",
      category: "Milestones",
      privacy: "private",
      babyName: "Emma Johnson",
      ageRange: "0-12 months",
    },
    {
      id: 2,
      title: "Liam's Tummy Time Adventures",
      description: "Building strength and having fun during tummy time",
      coverImage: "/placeholder.svg?height=200&width=300",
      imageCount: 89,
      createdDate: "2024-02-20",
      category: "Activities",
      privacy: "family",
      babyName: "Liam Smith",
      ageRange: "3-8 months",
    },
    {
      id: 3,
      title: "Mia's Sensory Play",
      description: "Exploring textures, colors, and new experiences",
      coverImage: "/placeholder.svg?height=200&width=300",
      imageCount: 156,
      createdDate: "2024-03-10",
      category: "Development",
      privacy: "private",
      babyName: "Mia Larson",
      ageRange: "6-10 months",
    },
    {
      id: 4,
      title: "Noah's First Foods",
      description: "The messy and wonderful journey of starting solids",
      coverImage: "/placeholder.svg?height=200&width=300",
      imageCount: 134,
      createdDate: "2024-03-25",
      category: "Feeding",
      privacy: "private",
      babyName: "Noah Green",
      ageRange: "4-8 months",
    },
    {
      id: 5,
      title: "Ava's Bath Time Fun",
      description: "Splashing, giggling, and getting clean",
      coverImage: "/placeholder.svg?height=200&width=300",
      imageCount: 78,
      createdDate: "2024-04-05",
      category: "Daily Care",
      privacy: "family",
      babyName: "Ava Turner",
      ageRange: "2-6 months",
    },
    {
      id: 6,
      title: "Oliver's Sleep Journey",
      description: "Peaceful moments and sweet dreams",
      coverImage: "/placeholder.svg?height=200&width=300",
      imageCount: 92,
      createdDate: "2024-04-18",
      category: "Sleep",
      privacy: "private",
      babyName: "Oliver Davis",
      ageRange: "0-4 months",
    },
  ];

  const gettingAllFolders = () => {
    dispatch(getAllFolders({ setLoading, ownerId: user?.id }));
  };

  useEffect(() => {
    gettingAllFolders();
  }, []);

  const handleCreateAlbum = async () => {
    console.log("Creating album:", newAlbum);
    await dispatch(
      createFolder({
        setLoading,
        parentId: null,
        ownerId: user?.id,
        name: newAlbum?.name,
      })
    ).unwrap();
    gettingAllFolders();
    setShowCreateForm(false);
    setNewAlbum({
      title: "",
      description: "",
      category: "",
      privacy: "private",
    });
  };

  const handleBannerUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedBanner(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      PERSONAL: "bg-pink-100 text-pink-700 border-pink-200",
      SHARED: "bg-purple-100 text-purple-700 border-purple-200",
    };
    return colors[category] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const formatDate = (date) => {
    return format(date, "MMM dd, yyyy");
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    } else {
      setPreview(null);
    }
  };

  const handleShowUploadImageOpen = (folderId) => {
    setFolderId(folderId);
    setShowUploadImage(true);
  }

  const handleUploadImage = () => {
    dispatch(uploadImageToFolder({ setLoading, ownerId: user?.id, file, folderId }))
    setFile(null);
    setPreview(null);
    setFolderId(null);
  }

  const handleShowEditAlbum = (album) => {
    setNewAlbum({
      name: album?.name,
      type: album?.type
    });
    setFolderId(album?.id)
    setMode("edit");
    setShowCreateForm(true);
  }

  const handleAlbumUpdate = () => {
    const formData = {
      name: newAlbum.name,
      type: newAlbum.type
    };

    dispatch(updateFolder({ setLoading, formData, parentId: user?.id, folderId }));
    setMode("create");
    setNewAlbum({
      name: "",
      type: ""
    });
    setShowCreateForm(false);
  }

  const handleDeleteFolder = (folderId) => {
    dispatch(deleteFolder({ setLoading, parentId: user?.id, folderId }))
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {loading && <Loading />}
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 lg:ml-0 ml-64">
          {/* Header */}
          <ParentHeader />

          {/* Page Content */}
          <div className="p-4 lg:p-6 space-y-6">
            {/* Main Banner */}
            <div className="relative h-64 lg:h-80 rounded-3xl overflow-hidden">
              {selectedBanner ? (
                <img
                  src={selectedBanner || "/placeholder.svg"}
                  alt="Custom Banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-80" />
                    <h2 className="text-2xl lg:text-4xl font-bold mb-2">
                      Your Baby's Memory Cloud
                    </h2>
                    <p className="text-lg opacity-90">
                      Capture, Store, and Cherish Every Precious Moment
                    </p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">Cloud Albums</h3>
                <p className="text-sm opacity-90">
                  {albums.length} Albums •{" "}
                  {albums.reduce((sum, album) => sum + album.imageCount, 0)}{" "}
                  Photos
                </p>
              </div>
            </div>

            {/* Custom Banner Upload */}
            <Card className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Customize Your Banner
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Upload your baby's photo to personalize your album banner
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                      id="banner-upload"
                    />
                    <label htmlFor="banner-upload">
                      <Button
                        variant="outline"
                        className="rounded-full border-pink-300 hover:bg-pink-50 bg-transparent"
                        asChild
                      >
                        <span className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Banner
                        </span>
                      </Button>
                    </label>
                    {selectedBanner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-red-50"
                        onClick={() => setSelectedBanner(null)}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Albums Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Your Baby Albums
                </h2>
                {user?.role === 'parent' && (
                  <div className="flex items-center gap-3">
                    <Button
                      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full"
                      onClick={() => setShowCreateForm(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Album
                    </Button>
                  </div>
                )}
              </div>

              {folders?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {folders?.map((album) => (
                    <Card className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-3xl overflow-hidden hover:shadow-lg transition-all cursor-pointer transform" onClick={() => (window.location.href = `/parent-dashboard/cloud-albums/${album?.id}`)}>
                      <div className="relative h-48">
                        <img
                          src={
                            album?.images?.[0]?.url ||
                            "https://html.vecurosoft.com/toddly/demo/assets/img/service/s-1-4.jpg"
                          }
                          alt={album?.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute top-4 right-4">
                          <Badge
                            className={`${getCategoryColor(album?.type)} border rounded-full text-xs`}
                          >
                            {album?.type}
                          </Badge>
                        </div>
                        <div className="absolute bottom-4 left-4 text-white">
                          <div className="flex items-center gap-2 text-sm">
                            <ImageIcon className="w-4 h-4" />
                            <span>{album?.imageCount} photos</span>
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-800 text-lg">
                            {album?.name}
                          </h3>
                          {user?.role === 'parent' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-6 h-6 rounded-full hover:bg-pink-100"
                                >
                                  <MoreVertical className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="rounded-xl"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DropdownMenuItem className="rounded-lg"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShowEditAlbum(album);
                                  }}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Album
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShowUploadImageOpen(album?.id);
                                  }}>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Add Photos
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 rounded-lg"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteFolder(album?.id)
                                  }}>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Album
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>

                        {/* <p className="text-gray-600 text-sm mb-3 line-clamp-2">{album.description}</p> */}

                        <div className="space-y-2">
                          {/* <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Baby: {album.babyName}</span>
                            <span>{album.ageRange}</span>
                          </div> */}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Created: {formatDate(album?.createdAt)}</span>
                            <Badge variant="outline" className="text-xs">
                              {album?.type}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center">
                  <h2>No Album Found</h2>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>


      <Dialog open={showUploadImage} onOpenChange={setShowUploadImage}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Upload Image
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              <div className="mt-2 w-full">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-32 object-center rounded-md border"
                />
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 cursor-pointer"
              onClick={handleUploadImage}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Album Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Create New Album
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Album Title
              </Label>
              <Input
                id="name"
                placeholder="e.g., Emma's First Steps"
                value={newAlbum.name}
                onChange={(e) =>
                  setNewAlbum({ ...newAlbum, name: e.target.value })
                }
                className="mt-1 rounded-full"
              />
            </div>

            <div>
              <Label
                htmlFor="type"
                className="text-sm font-medium text-gray-700"
              >
                Category
              </Label>
              <Select
                value={newAlbum.type}
                onValueChange={(value) =>
                  setNewAlbum({ ...newAlbum, type: value })
                }
              >
                <SelectTrigger className="mt-1 rounded-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERSONAL">Personal</SelectItem>
                  <SelectItem value="SHARED">Shared</SelectItem>
                </SelectContent>
              </Select>
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
                onClick={mode === 'create' ? handleCreateAlbum : handleAlbumUpdate}
              >
                <Save className="w-4 h-4 mr-2" />
                {mode === 'create' ? "Create" : "Update"} Album
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
