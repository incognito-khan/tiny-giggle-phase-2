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
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  Filter,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { babiesData } from "@/components/data/parent-dashboard/children/childrenData";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { createChild, getSingleChild } from "@/store/slices/childSlice";
import { uploadImage } from "@/store/slices/mediaSlice";
import ParentHeader from '@/components/layout/header/parent-header';
import Loading from "@/components/loading";
import { format } from "date-fns";

export default function ChildrenPage() {
  const user = useSelector((state) => state.auth.user);
  const childId = useSelector((state) => state.child.childId);
  const child = useSelector((state) => state.child.child);
  // console.log(child, "child");
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    birthday: "",
    height: "",
    weight: "",
  });
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const dispatch = useDispatch();

  const filteredBabies = babiesData.filter(
    (baby) =>
      baby.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      baby.parent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      baby.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    dispatch(
      getSingleChild({ parentId: user.id, childId: childId, setLoading })
    );
  }, []);

  // const getStatusColor = (status) => {
  //   switch (status) {
  //     case "Healthy":
  //       return "bg-green-100 text-green-700";
  //     case "Check Due":
  //       return "bg-red-100 text-red-700";
  //     default:
  //       return "bg-gray-100 text-gray-700";
  //   }
  // };

  const getDaysLeftColor = (days) => {
    if (days <= 7) return "text-red-600 font-semibold";
    if (days <= 14) return "text-orange-600 font-semibold";
    return "text-gray-600";
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Utility to check ISO Date format
  const isValidISODate = (dateStr) => {
    const isoRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
    if (!isoRegex.test(dateStr)) return false;

    const date = new Date(dateStr);
    return !isNaN(date.getTime()); // valid date object
  };

  const handleAddBaby = async (e) => {
    e.preventDefault();

    const { name, type, birthday, height, weight } = formData;

    // 🔹 Validation
    if (!name || !type || !birthday || !height || !weight) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!isValidISODate(birthday)) {
      toast.error("Birthday must be in ISO format (YYYY-MM-DD).");
      return;
    }

    if (isNaN(Number(height)) || Number(height) <= 0) {
      toast.error("Height must be a valid positive number.");
      return;
    }

    if (isNaN(Number(weight)) || Number(weight) <= 0) {
      toast.error("Weight must be a valid positive number.");
      return;
    }

    // 🔹 If all validations pass → API call
    try {
      const imageUrl = await dispatch(
        uploadImage({ setLoading, parentId: user.id, file })
      ).unwrap();
      console.log(imageUrl, "imageUrl");
      const finalFormData = {
        ...formData,
        type: formData.type.toUpperCase(),
        avatar: imageUrl,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
      };
      dispatch(
        createChild({ setLoading, parentId: user.id, formData: finalFormData })
      );
      setOpen(false);
      setFormData({
        name: "",
        avatar: "",
        type: "",
        birthday: "",
        height: "",
        weight: "",
      });
      setFile(null);
      setPreview(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add baby.");
    }
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return format(date, "dd, MMM yyyy");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 w-[81vw]">
      {loading && <Loading />}
      <div className="flex">
        {/* Sidebar */}
        {/* Main Content */}
        <div className="flex-1 ">
          {/* Header */}
          <ParentHeader />

          {/* Page Content */}
          <div className="p-4 lg:p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card className="bg-gradient-to-br from-pink-100 to-pink-200 border-pink-200 rounded-3xl hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center">
                    <p className="text-pink-600 font-medium mb-1 text-sm">
                      Total Babies
                    </p>
                    <p className="text-2xl lg:text-3xl font-bold text-pink-800 mb-2">
                      6
                    </p>
                    <p className="text-xs text-pink-600">
                      +2 compared to last month
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-200 rounded-3xl hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center">
                    <p className="text-purple-600 font-medium mb-1 text-sm">
                      Milestones
                    </p>
                    <p className="text-2xl lg:text-3xl font-bold text-purple-800 mb-2">
                      47
                    </p>
                    <p className="text-xs text-purple-600">
                      +8 compared to last month
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-200 rounded-3xl hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center">
                    <p className="text-blue-600 font-medium mb-1 text-sm">
                      Caregivers
                    </p>
                    <p className="text-2xl lg:text-3xl font-bold text-blue-800 mb-2">
                      12
                    </p>
                    <p className="text-xs text-blue-600">
                      +1 compared to last month
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-100 to-green-200 border-green-200 rounded-3xl hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-4 lg:p-6">
                  <div className="text-center">
                    <p className="text-green-600 font-medium mb-1 text-sm">
                      Active Programs
                    </p>
                    <p className="text-2xl lg:text-3xl font-bold text-green-800 mb-2">
                      8
                    </p>
                    <p className="text-xs text-green-600">
                      +3 compared to last month
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Children List */}
            <Card className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-3xl">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Baby List</h2>

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search anything here"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64 bg-gray-50 border-gray-200 rounded-full text-sm"
                      />
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-gray-300"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-gray-300"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>

                    {/* <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Baby
                    </Button> */}
                    {user?.role === 'parent' && (
                      <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Baby
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rounded-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-gray-800">
                              Add New Baby
                            </DialogTitle>
                          </DialogHeader>
                          <form className="space-y-4">
                            <div>
                              <Label className="mb-2">Name</Label>
                              <Input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                              />
                            </div>
                            <div>
                              <Label className="mb-2">Type</Label>
                              <Input
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                placeholder="BOY, GIRL"
                              />
                            </div>
                            <div>
                              <Label className="mb-2">Birthday</Label>
                              <Input
                                type="date"
                                name="birthday"
                                value={formData.birthday}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="mb-2">Height (cm)</Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  name="height"
                                  value={formData.height}
                                  onChange={handleChange}
                                  placeholder="90.5"
                                />
                              </div>
                              <div>
                                <Label className="mb-2">Weight (kg)</Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  name="weight"
                                  value={formData.weight}
                                  onChange={handleChange}
                                  placeholder="14.2"
                                />
                              </div>
                            </div>
                            <div className="w-full">
                              <Label className="mb-2">Profile Image</Label>
                              {/* <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full"
                              /> */}
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
                            </div>
                            <Button
                              type="submit"
                              className="w-full bg-gradient-to-r from-pink-500 to-purple-500"
                              onClick={handleAddBaby}
                            >
                              Save
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-pink-100 hover:bg-transparent">
                        <TableHead className="text-gray-600 font-semibold">
                          Name
                        </TableHead>
                        <TableHead className="text-gray-600 font-semibold">
                          DOB
                        </TableHead>
                        <TableHead className="text-gray-600 font-semibold">
                          Program
                        </TableHead>
                        <TableHead className="text-gray-600 font-semibold">
                          Parent
                        </TableHead>
                        <TableHead className="text-gray-600 font-semibold">
                          Next Checkup
                        </TableHead>
                        <TableHead className="text-gray-600 font-semibold">
                          Status
                        </TableHead>
                        <TableHead className="text-gray-600 font-semibold">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-pink-50 hover:bg-pink-25 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage
                                src={child?.avatar}
                              />
                              <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white text-sm">
                                {child?.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-gray-800">
                                {child?.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {child?.currentAge?.years} • {child?.weight} •{" "}
                                {child?.height}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {formatDate(child?.birthday)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 rounded-full"
                          >
                            Dance
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {child?.type}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          2025-09-10
                        </TableCell>
                        <TableCell>{child.bmiStatus}</TableCell>
                        {/* <TableCell>
                            <Badge
                              className={`${getStatusColor(
                                baby.status
                              )} border-0 rounded-full`}
                            >
                              {baby.status}
                            </Badge>
                          </TableCell> */}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 rounded-full hover:bg-pink-100"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="rounded-xl"
                            >
                              {user?.role === 'parent' && (
                                <DropdownMenuItem className="rounded-lg">
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Profile
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="rounded-lg">
                                <Camera className="w-4 h-4 mr-2" />
                                View Memories
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-lg">
                                <Heart className="w-4 h-4 mr-2" />
                                Milestones
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-lg">
                                <Clock className="w-4 h-4 mr-2" />
                                Daily Routine
                              </DropdownMenuItem>
                              {user?.role === 'parent' && (
                                <DropdownMenuItem className="text-red-600 rounded-lg">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Remove
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {filteredBabies.length === 0 && (
                  <div className="text-center py-12">
                    <Baby className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No babies found matching your search.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
