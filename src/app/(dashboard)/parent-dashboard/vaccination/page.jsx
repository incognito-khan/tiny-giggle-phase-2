"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Calendar,
  MessageCircle,
  Search,
  Shield,
  Plus,
  ChevronRight,
  ChevronLeft,
  Upload,
  AlertTriangle,
  CheckCircle,
  Syringe,
  FileText,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
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
import { Calendar as UICalender } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useDispatch, useSelector } from "react-redux";
import {
  createVaccination,
  getAllChildVaccinations,
  changeChildVaccinationStatus,
} from "@/store/slices/vaccinationSlice";
import Loading from "@/components/loading";
import ParentHeader from "@/components/layout/header/parent-header";
import { format } from "date-fns";
import VaccinationCard from '@/components/vaccination/card';
import { uploadImage } from "@/store/slices/mediaSlice";

export default function VaccinationsPage() {
  const parent = useSelector((state) => state.auth.user);
  const parentId = parent.id;
  const childId = useSelector((state) => state.child.childId);
  console.log(childId, 'childId')
  const vaccinations = useSelector((state) => state.vaccination.vaccinations);
  console.log(vaccinations, "vaccinations");
  const [showAddVaccination, setShowAddVaccination] = useState(false);
  const [showVaccinationProcess, setShowVaccinationProcess] = useState(false);
  const [selectedVaccination, setSelectedVaccination] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState();
  const [newVaccination, setNewVaccination] = useState({
    title: "",
    dueDate: "",
  });
  const [statusForm, setStatusForm] = useState({
    status: "",
    note: "",
    date: "",
    time: ""
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [vaccinationId, setVaccinationId] = useState(null);
  const [isSubmitVaccinationOpen, setIsSubmitVaccinationOpen] = useState(false);
  const dispatch = useDispatch();

  // Step form data
  const [stepData, setStepData] = useState({
    step1: {
      vaccinationDate: "",
      doctorName: "",
      clinic: "",
      batchNumber: "",
      nextDueDate: "",
      notes: "",
    },
    step2: {
      sideEffects: [],
      severity: "",
      duration: "",
      additionalNotes: "",
    },
    step3: {
      beforePhoto: null,
      afterPhoto: null,
      notes: "",
    },
  });

  const commonSideEffects = [
    "Mild fever",
    "Redness at injection site",
    "Swelling",
    "Fussiness",
    "Loss of appetite",
    "Drowsiness",
    "Mild rash",
    "Irritability",
  ];

  const handleAddVaccination = (e) => {
    e.preventDefault();
    console.log(newVaccination, parentId, childId[0]);
    dispatch(
      createVaccination({
        setLoading,
        parentId,
        childId: childId[0],
        formData: newVaccination,
      })
    );
    gettingAllVaccination();
    setShowAddVaccination(false);
    setNewVaccination({
      title: "",
      dueDate: "",
    });
  };

  const gettingAllVaccination = () => {
    dispatch(getAllChildVaccinations({ parentId, childId: childId[0], setLoading }));
  };

  useEffect(() => {
    gettingAllVaccination();
  }, []);

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    console.log("Vaccination process completed:", stepData);
    setShowVaccinationProcess(false);
    setCurrentStep(1);
    setStepData({
      step1: {
        vaccinationDate: "",
        doctorName: "",
        clinic: "",
        batchNumber: "",
        nextDueDate: "",
        notes: "",
      },
      step2: {
        sideEffects: [],
        severity: "",
        duration: "",
        additionalNotes: "",
      },
      step3: {
        beforePhoto: null,
        afterPhoto: null,
        notes: "",
      },
    });
  };

  const handleSideEffectToggle = (effect) => {
    const currentEffects = stepData.step2.sideEffects;
    const newEffects = currentEffects.includes(effect)
      ? currentEffects.filter((e) => e !== effect)
      : [...currentEffects, effect];

    setStepData({
      ...stepData,
      step2: { ...stepData.step2, sideEffects: newEffects },
    });
  };

  const handleFileUpload = (file, type) => {
    setStepData({
      ...stepData,
      step3: { ...stepData.step3, [type]: file },
    });
  };

  const getProgressPercentage = () => {
    return (currentStep / 3) * 100;
  };

  const isStepComplete = (step) => {
    switch (step) {
      case 1:
        return (
          stepData.step1.vaccinationDate &&
          stepData.step1.doctorName &&
          stepData.step1.clinic
        );
      case 2:
        return stepData.step2.sideEffects.length > 0 || stepData.step2.severity;
      case 3:
        return stepData.step3.beforePhoto || stepData.step3.afterPhoto;
      default:
        return false;
    }
  };

  const handleShowVacStatus = (status, id) => {
    setStatusForm({ ...statusForm, status: status });
    setVaccinationId(id);
    setIsSubmitVaccinationOpen(true);
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  const handleChangeVaccinationStatus = async (e) => {
    e.preventDefault();
    if (file) {
      const image = await dispatch(uploadImage({ setLoading, parentId: parent?.id, file })).unwrap();
      statusForm.image = image
    }

    dispatch(changeChildVaccinationStatus({ setLoading, parentId: parent?.id, childId, body: statusForm, vaccinationId }))
    setIsSubmitVaccinationOpen(false);
    setStatusForm({
      status: "",
      note: "",
      date: "",
      time: "",
    });
    setPreview(null);
    setFile(null);
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
              <div className="w-full h-full bg-gradient-to-r from-blue-400 via-green-400 to-purple-400 flex items-center justify-center">
                <div className="text-center text-white">
                  <Shield className="w-16 h-16 mx-auto mb-4 opacity-80" />
                  <h2 className="text-2xl lg:text-4xl font-bold mb-2">
                    Vaccination Tracker
                  </h2>
                  <p className="text-lg opacity-90">
                    Protect Your Baby's Health with Timely Vaccinations
                  </p>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Vaccination Types */}
            <Card className="bg-white/80 backdrop-blur-sm border-pink-100 rounded-3xl">
              <CardHeader>
                <div className="flex items-center justify-between mt-2">
                  <CardTitle className="text-gray-800">
                    Available Vaccinations
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <VaccinationCard vaccinations={vaccinations} handleShowVacStatus={handleShowVacStatus} parent={true} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isSubmitVaccinationOpen} onOpenChange={setIsSubmitVaccinationOpen}>
        <DialogTrigger asChild>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Select date & time (Optional)</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              It's an optional step. You can simply click on submit to continue.
            </DialogDescription>
          </DialogHeader>


          <form className="grid gap-4 py-2">
            <div>
              <Label className="mb-2">Image</Label>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={statusForm.date}
                  onChange={(e) => setStatusForm({ ...statusForm, date: e.target.value })}
                />
              </div>


              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={statusForm.time}
                  onChange={(e) => setStatusForm({ ...statusForm, time: e.target.value })}
                  placeholder="--:--"
                />
              </div>
            </div>


            <div>
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={statusForm.note}
                onChange={(e) => setStatusForm({ ...statusForm, note: e.target.value })}
                placeholder="Add an optional note..."
                className="min-h-[88px]"
              />
            </div>


            <DialogFooter>
              <div className="flex w-full items-center justify-end gap-2">
                <Button variant="outline" className="cursor-pointer" onClick={() => setIsSubmitVaccinationOpen(false)} type="button">
                  Cancel
                </Button>
                <Button type="submit" className="cursor-pointer" onClick={handleChangeVaccinationStatus}>
                  Submit
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Vaccination Dialog */}
      <Dialog open={showAddVaccination} onOpenChange={setShowAddVaccination}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Add New Vaccination
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="title"
                className="text-sm font-medium text-gray-700"
              >
                Vaccination Name
              </Label>
              <Input
                id="title"
                placeholder="e.g., Rotavirus Vaccine"
                value={newVaccination.title}
                onChange={(e) =>
                  setNewVaccination({
                    ...newVaccination,
                    title: e.target.value,
                  })
                }
                className="mt-1 rounded-full"
              />
            </div>

            <div>
              <Label
                htmlFor="dueDate"
                className="text-sm font-medium text-gray-700"
              >
                Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="mt-1 w-full justify-start rounded-2xl text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {newVaccination.dueDate
                      ? new Date(newVaccination.dueDate).toLocaleDateString()
                      : "Select due date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <UICalender
                    mode="single"
                    selected={
                      newVaccination.dueDate
                        ? new Date(newVaccination.dueDate)
                        : undefined
                    }
                    onSelect={(date) =>
                      setNewVaccination({
                        ...newVaccination,
                        dueDate: date?.toISOString(),
                      })
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button
              onClick={handleAddVaccination}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full"
            >
              Add Vaccination
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 3-Step Vaccination Process Dialog */}
      <Dialog
        open={showVaccinationProcess}
        onOpenChange={setShowVaccinationProcess}
      >
        <DialogContent className="sm:max-w-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              {selectedVaccination?.name} - Step {currentStep} of 3
            </DialogTitle>
          </DialogHeader>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span
                className={currentStep >= 1 ? "text-pink-600 font-medium" : ""}
              >
                Vaccination Details
              </span>
              <span
                className={currentStep >= 2 ? "text-pink-600 font-medium" : ""}
              >
                Side Effects
              </span>
              <span
                className={currentStep >= 3 ? "text-pink-600 font-medium" : ""}
              >
                Photo Upload
              </span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
            <div className="flex justify-between">
              <div
                className={`w-3 h-3 rounded-full ${currentStep >= 1 ? "bg-pink-500" : "bg-gray-300"
                  }`}
              />
              <div
                className={`w-3 h-3 rounded-full ${currentStep >= 2 ? "bg-pink-500" : "bg-gray-300"
                  }`}
              />
              <div
                className={`w-3 h-3 rounded-full ${currentStep >= 3 ? "bg-pink-500" : "bg-gray-300"
                  }`}
              />
            </div>
          </div>

          <Separator />

          {/* Step 1: Vaccination Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <FileText className="w-12 h-12 text-pink-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Vaccination Details
                </h3>
                <p className="text-sm text-gray-600">
                  Enter the vaccination information
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="vaccinationDate"
                    className="text-sm font-medium text-gray-700"
                  >
                    Vaccination Date
                  </Label>
                  <Input
                    id="vaccinationDate"
                    type="date"
                    value={stepData.step1.vaccinationDate}
                    onChange={(e) =>
                      setStepData({
                        ...stepData,
                        step1: {
                          ...stepData.step1,
                          vaccinationDate: e.target.value,
                        },
                      })
                    }
                    className="mt-1 rounded-full"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="doctorName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Doctor Name
                  </Label>
                  <Input
                    id="doctorName"
                    placeholder="Dr. Smith"
                    value={stepData.step1.doctorName}
                    onChange={(e) =>
                      setStepData({
                        ...stepData,
                        step1: {
                          ...stepData.step1,
                          doctorName: e.target.value,
                        },
                      })
                    }
                    className="mt-1 rounded-full"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="clinic"
                    className="text-sm font-medium text-gray-700"
                  >
                    Clinic/Hospital
                  </Label>
                  <Input
                    id="clinic"
                    placeholder="City Medical Center"
                    value={stepData.step1.clinic}
                    onChange={(e) =>
                      setStepData({
                        ...stepData,
                        step1: { ...stepData.step1, clinic: e.target.value },
                      })
                    }
                    className="mt-1 rounded-full"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="batchNumber"
                    className="text-sm font-medium text-gray-700"
                  >
                    Batch Number
                  </Label>
                  <Input
                    id="batchNumber"
                    placeholder="ABC123"
                    value={stepData.step1.batchNumber}
                    onChange={(e) =>
                      setStepData({
                        ...stepData,
                        step1: {
                          ...stepData.step1,
                          batchNumber: e.target.value,
                        },
                      })
                    }
                    className="mt-1 rounded-full"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="nextDueDate"
                    className="text-sm font-medium text-gray-700"
                  >
                    Next Due Date
                  </Label>
                  <Input
                    id="nextDueDate"
                    type="date"
                    value={stepData.step1.nextDueDate}
                    onChange={(e) =>
                      setStepData({
                        ...stepData,
                        step1: {
                          ...stepData.step1,
                          nextDueDate: e.target.value,
                        },
                      })
                    }
                    className="mt-1 rounded-full"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="notes"
                  className="text-sm font-medium text-gray-700"
                >
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information..."
                  value={stepData.step1.notes}
                  onChange={(e) =>
                    setStepData({
                      ...stepData,
                      step1: { ...stepData.step1, notes: e.target.value },
                    })
                  }
                  className="mt-1 rounded-2xl"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 2: Side Effects */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Side Effects Monitoring
                </h3>
                <p className="text-sm text-gray-600">
                  Track any side effects experienced
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Select Side Effects (if any)
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {commonSideEffects.map((effect) => (
                    <Button
                      key={effect}
                      variant={
                        stepData.step2.sideEffects.includes(effect)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      className={`rounded-full text-xs ${stepData.step2.sideEffects.includes(effect)
                        ? "bg-pink-500 hover:bg-pink-600"
                        : "bg-transparent"
                        }`}
                      onClick={() => handleSideEffectToggle(effect)}
                    >
                      {effect}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label
                  htmlFor="severity"
                  className="text-sm font-medium text-gray-700"
                >
                  Severity Level
                </Label>
                <Select
                  value={stepData.step2.severity}
                  onValueChange={(value) =>
                    setStepData({
                      ...stepData,
                      step2: { ...stepData.step2, severity: value },
                    })
                  }
                >
                  <SelectTrigger className="mt-1 rounded-full">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Side Effects</SelectItem>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="duration"
                  className="text-sm font-medium text-gray-700"
                >
                  Duration
                </Label>
                <Input
                  id="duration"
                  placeholder="e.g., 2 days"
                  value={stepData.step2.duration}
                  onChange={(e) =>
                    setStepData({
                      ...stepData,
                      step2: { ...stepData.step2, duration: e.target.value },
                    })
                  }
                  className="mt-1 rounded-full"
                />
              </div>

              <div>
                <Label
                  htmlFor="additionalNotes"
                  className="text-sm font-medium text-gray-700"
                >
                  Additional Notes
                </Label>
                <Textarea
                  id="additionalNotes"
                  placeholder="Describe any other observations..."
                  value={stepData.step2.additionalNotes}
                  onChange={(e) =>
                    setStepData({
                      ...stepData,
                      step2: {
                        ...stepData.step2,
                        additionalNotes: e.target.value,
                      },
                    })
                  }
                  className="mt-1 rounded-2xl"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 3: Photo Upload */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <ImageIcon className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Photo Documentation
                </h3>
                <p className="text-sm text-gray-600">
                  Upload before and after vaccination photos
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Before Vaccination Photo
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-pink-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleFileUpload(e.target.files[0], "beforePhoto")
                      }
                      className="hidden"
                      id="before-photo"
                    />
                    <label htmlFor="before-photo" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload</p>
                      {stepData.step3.beforePhoto && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ {stepData.step3.beforePhoto.name}
                        </p>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    After Vaccination Photo
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-pink-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleFileUpload(e.target.files[0], "afterPhoto")
                      }
                      className="hidden"
                      id="after-photo"
                    />
                    <label htmlFor="after-photo" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload</p>
                      {stepData.step3.afterPhoto && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ {stepData.step3.afterPhoto.name}
                        </p>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <Label
                  htmlFor="photoNotes"
                  className="text-sm font-medium text-gray-700"
                >
                  Photo Notes
                </Label>
                <Textarea
                  id="photoNotes"
                  placeholder="Any observations about the photos..."
                  value={stepData.step3.notes}
                  onChange={(e) =>
                    setStepData({
                      ...stepData,
                      step3: { ...stepData.step3, notes: e.target.value },
                    })
                  }
                  className="mt-1 rounded-2xl"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              className="rounded-full bg-transparent"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < 3 ? (
              <Button
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full"
                onClick={handleNextStep}
                disabled={!isStepComplete(currentStep)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 rounded-full"
                onClick={handleFinish}
                disabled={!isStepComplete(currentStep)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
