"use client";

import { useState, useEffect } from "react";
import {
  Baby,
  Camera,
  ArrowLeft,
  Download,
  Share2,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  ZoomIn,
  X,
  ImageIcon,
  Upload,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams } from "next/navigation";
import Link from "next/link";
import Loading from "../../../../../components/loading/index";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllSubFoldersAndImages,
  createFolder,
  uploadImageToFolder,
} from "@/store/slices/folderSlice";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import ParentHeader from "@/components/layout/header/parent-header";

export default function AlbumDetailPage() {
  const user = useSelector((state) => state.auth.user);
  const folder = useSelector((state) => state.folder.folder);
  console.log(folder, "folder");
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUploadImage, setShowUploadImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newAlbum, setNewAlbum] = useState({
    name: "",
    type: "",
  });
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const dispatch = useDispatch();

  const gettingAllFolderInfo = () => {
    dispatch(
      getAllSubFoldersAndImages({ setLoading, ownerId: user?.id, folderId: id })
    );
  };

  useEffect(() => {
    gettingAllFolderInfo();
  }, []);

  const handleCreateAlbum = async () => {
    console.log(newAlbum);
    await dispatch(
      createFolder({
        setLoading,
        ownerId: user?.id,
        parentId: id,
        name: newAlbum?.name,
      })
    ).unwrap();
    gettingAllFolderInfo();
    setShowCreateForm(false);
    setNewAlbum({
      title: "",
      description: "",
      category: "",
      privacy: "private",
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setImagePreview(URL.createObjectURL(selectedFile));
    } else {
      setImagePreview(null);
    }
  };

  const handleUploadImage = async () => {
    if (!file) {
      return toast.error("Please Select Image Before Uploading");
    }
    await dispatch(
      uploadImageToFolder({ setLoading, ownerId: user?.id, folderId: id, file })
    ).unwrap();
    gettingAllFolderInfo();
    setShowUploadImage(false);
  };

  const formatDate = (date) => {
    return format(date, "MMM dd, yyyy");
  };

  const getCategoryColor = (category) => {
    const colors = {
      PERSONAL: "bg-pink-100 text-pink-700 border-pink-200",
      SHARED: "bg-purple-100 text-purple-700 border-purple-200",
    };
    return colors[category] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 w-full">
      {loading && <Loading />}
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 lg:ml-0 ml-64">
          {/* Header */}
          <ParentHeader />

          {/* Album Content */}
          <div className="p-4 lg:p-6 space-y-6">
            {/* Album Info */}
            <Card className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-2xl flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        {folder?.name}
                      </h2>
                      <p className="text-gray-600">
                        {folder?.images?.length} photos
                      </p>
                      <p className="text-sm text-gray-500">
                        Created on{" "}
                        {new Date(folder?.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={`${getCategoryColor(folder?.type)} border rounded-full`}
                    >
                      {folder?.type}
                    </Badge>
                    {user?.role === 'parent' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-pink-100"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem className="rounded-lg">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Album
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 rounded-lg">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Album
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {user?.role === 'parent' && (
              <div className="flex justify-end items-center gap-3">
                <Button
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full"
                  onClick={() => setShowUploadImage(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
                <Button
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Album
                </Button>
              </div>
            )}

            {/* Photos Grid */}
            {folder?.images?.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-2 mt-5">Images</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {folder?.images?.map((image) => (
                    <Card
                      key={image?.id}
                      className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer transform w-full"
                      onClick={() => setSelectedImage(image)}
                    >
                      <div className="relative pb-[100%] w-full">
                        <img
                          src={
                            image?.url ||
                            "https://html.vecurosoft.com/toddly/demo/assets/img/service/s-1-4.jpg"
                          }
                          alt={image?.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-2 left-2 text-white">
                            <p className="text-sm font-medium">{image?.name}</p>
                            {/* <p className="text-xs opacity-90">{image.ageAtPhoto}</p> */}
                          </div>
                          <div className="absolute top-2 right-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30"
                            >
                              <ZoomIn className="w-3 h-3 text-white" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-medium text-gray-800 text-sm mb-1">
                          {image?.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2">
                          {formatDate(image?.createdAt)}
                        </p>
                        {/* <div className="flex flex-wrap gap-1">
                      {image.tags.slice(0, 2).map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs px-2 py-0"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {image.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs px-2 py-0">
                          +{image.tags.length - 2}
                        </Badge>
                      )}
                    </div> */}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {folder?.subfolders?.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-2 mt-5">Folders</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {folder?.subfolders?.map((album) => (
                    <Link
                      key={album.id}
                      href={`/parent-dashboard/cloud-albums/${album?.id}`}
                    >
                      <Card className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-3xl overflow-hidden hover:shadow-lg transition-all cursor-pointer transform">
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
                                <DropdownMenuTrigger asChild>
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
                                >
                                  <DropdownMenuItem className="rounded-lg">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Album
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="rounded-lg">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Add Photos
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600 rounded-lg">
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
                              <span>
                                Created: {formatDate(album?.createdAt)}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {album?.type}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
                onClick={handleCreateAlbum}
              >
                <Save className="w-4 h-4 mr-2" />
                Create Album
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showUploadImage} onOpenChange={setShowUploadImage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="image"
                className="text-sm font-medium text-gray-700"
              >
                Upload Image
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                className="w-full mt-2"
                onChange={handleFileChange}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 rounded-full bg-transparent"
                onClick={() => setShowUploadImage(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full"
                onClick={handleUploadImage}
              >
                <Save className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Detail Modal */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0 rounded-3xl overflow-hidden">
          {selectedImage && (
            <div className="flex h-full">
              {/* Image */}
              <div className="flex-1 relative bg-black">
                <img
                  src={selectedImage?.url || "/placeholder.svg"}
                  alt={selectedImage?.name}
                  className="w-full h-full object-contain"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Details Sidebar */}
              <div className="w-80 bg-white p-6 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {selectedImage?.name}
                    </h3>
                    {/* <p className="text-gray-600 text-sm">
                      {selectedImage.description}
                    </p> */}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Date Taken:</span>
                      <span className="font-medium">
                        {formatDate(selectedImage?.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Age at Photo:</span>
                      <span className="font-medium">
                        {formatDistanceToNow(
                          new Date(selectedImage?.createdAt),
                          { addSuffix: true }
                        )}
                      </span>
                    </div>
                    {/* <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Baby:</span>
                      <span className="font-medium">{album.babyName}</span>
                    </div> */}
                  </div>

                  {/* <div>
                    <p className="text-sm text-gray-500 mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedImage.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div> */}

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-full bg-transparent"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 rounded-full bg-transparent"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
