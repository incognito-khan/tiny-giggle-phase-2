"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  CloudUpload,
  FileText,
  ShieldCheck,
  Loader2,
  Baby,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllBabysitters,
  createBabysitter,
  updateBabysitter,
  deleteBabysitter,
} from "@/store/slices/babysitterSlice";
import Loading from "@/components/loading";
import { toast } from "react-toastify";
import AdminHeader from "@/components/layout/header/admin-header";

export function Babysitters() {
  const user = useSelector((state) => state.auth.user);
  const babysitters = useSelector((state) => state.babysitter.babysitters);
  const pagination = useSelector((state) => state.babysitter.pagination || { total: 0, totalPages: 1, limit: 10 });
  const [isCreateModal, setIsCreateModal] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    zipCode: "",
    experience: "",
    ageGroups: [],
    languages: [],
    certifications: "",
    bio: "",
    hourlyRate: "",
    profilePictureUrl: "",
    nationalIdUrl: "",
    firstAidCertificateUrl: "",
    backgroundCheckUrl: "",
    childcareDiplomaUrl: "",
    referenceLettersUrl: "",
  });

  const [editTarget, setEditTarget] = useState(null);
  const [uploading, setUploading] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllBabysitters({ setLoading, adminId: user?.id, search, page: currentPage, limit: ITEMS_PER_PAGE }));
  }, [search, currentPage]);

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading((prev) => ({ ...prev, [field]: true }));
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch(`/api/v1/upload`, {
        method: "POST",
        body: uploadFormData,
      });

      const data = await response.json();
      if (data.url) {
        setFormData((prev) => ({ ...prev, [field]: data.url }));
        toast.success(
          `${field
            .replace(/Url$/, "")
            .replace(/([A-Z])/g, " $1")
            .trim()} uploaded`,
        );
      }
    } catch (err) {
      toast.error("File upload failed");
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.experience) {
      toast.error("Required fields are missing");
      return;
    }

    if (isEditModal) {
      dispatch(
        updateBabysitter({
          setLoading,
          adminId: user?.id,
          babysitterId: editTarget.id,
          formData,
        }),
      ).then((res) => {
        if (!res.error) setIsEditModal(false);
      });
    } else {
      dispatch(
        createBabysitter({ setLoading, adminId: user?.id, formData }),
      ).then((res) => {
        if (!res.error) setIsCreateModal(false);
      });
    }
  };

  const startEdit = (bs) => {
    setEditTarget(bs);
    setFormData(bs);
    setIsEditModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this babysitter?")) {
      dispatch(
        deleteBabysitter({ setLoading, adminId: user?.id, babysitterId: id }),
      );
    }
  };

  const { total, totalPages, limit } = pagination;

  return (
    <div className="flex flex-col h-screen bg-slate-50/50 w-full overflow-hidden">
      {loading && <Loading />}

      <div className="px-8 py-6">
        <AdminHeader
          title="Childcare Experts"
          subTitle="Manage verified babysitters and nannies"
        />
      </div>

      <main className="flex-1 p-8 pt-0 overflow-y-auto">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  Babysitter Directory
                </h2>
                <p className="text-slate-400 font-medium text-sm">
                  Review background checks and childcare experience
                </p>
              </div>
              <Button
                className="bg-rose-600 hover:bg-rose-700 text-white px-6 h-12 rounded-2xl font-bold shadow-lg shadow-rose-200 transition-all active:scale-95 border-0"
                onClick={() => {
                  setFormData({ ageGroups: [], languages: [] });
                  setIsCreateModal(true);
                }}
              >
                <Plus className="w-5 h-5 mr-2" />
                Onboard Babysitter
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="text-left p-6 font-black text-slate-400 uppercase text-xs tracking-widest">
                    Babysitter
                  </th>
                  <th className="text-left p-6 font-black text-slate-400 uppercase text-xs tracking-widest">
                    Rate
                  </th>
                  <th className="text-left p-6 font-black text-slate-400 uppercase text-xs tracking-widest">
                    Experience
                  </th>
                  <th className="text-left p-6 font-black text-slate-400 uppercase text-xs tracking-widest">
                    Status
                  </th>
                  <th className="text-left p-6 font-black text-slate-400 uppercase text-xs tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {babysitters?.map((bs) => (
                  <tr
                    key={bs.id}
                    className="hover:bg-slate-50/30 transition-colors group"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        {bs.profilePictureUrl ? (
                          <img src={bs.profilePictureUrl} alt={bs.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-100" />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 font-black text-lg border border-rose-100">
                            {bs.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-black text-slate-800">
                            {bs.name}
                          </div>
                          <div className="text-sm text-slate-400 font-medium">
                            {bs.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-slate-800 font-black tracking-tight">
                        ${bs.hourlyRate}/hr
                      </div>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-tight">
                        Service Rate
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-slate-600 font-bold">
                        {bs.experience} Years
                      </div>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-tight">
                        Childcare Time
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-2">
                        <div
                          className={`text-[10px] font-black px-3 py-1 rounded-full w-fit flex items-center gap-1.5 ${bs.isVerified ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"}`}
                        >
                          {bs.isVerified ? (
                            <ShieldCheck className="w-3 h-3" />
                          ) : null}
                          {bs.isVerified ? "VERIFIED" : "PENDING CHECKS"}
                        </div>
                        <div
                          className={`text-[9px] font-black px-3 py-1 rounded-full w-fit ${bs.isPaid ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-slate-100 text-slate-500 border border-slate-200"}`}
                        >
                          {bs.isPaid ? "SUBSCRIPTION ACTIVE" : "UNPAID"}
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl hover:bg-rose-50 hover:text-rose-600 text-slate-400"
                          onClick={() => startEdit(bs)}
                        >
                          <Edit className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl hover:bg-rose-50 hover:text-rose-600 text-slate-400"
                          onClick={() => handleDelete(bs.id)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!babysitters || babysitters.length === 0) && !loading && (
              <div className="p-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <Baby className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-800">
                  No babysitters found
                </h3>
                <p className="text-slate-400 font-medium">
                  Try adding a new professional to the directory.
                </p>
              </div>
            )}

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-8 py-5 border-t border-slate-50">
                <p className="text-xs font-bold text-slate-400">
                  Showing{" "}
                  <span className="text-slate-700">{(currentPage - 1) * limit + 1}</span>
                  –
                  <span className="text-slate-700">{Math.min(currentPage * limit, total)}</span>
                  {" "}of{" "}
                  <span className="text-slate-700">{total}</span> babysitters
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl h-9 w-9 text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-30"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-9 w-9 rounded-xl text-xs font-black transition-all ${
                        page === currentPage
                          ? 'bg-rose-600 text-white shadow-lg shadow-rose-200'
                          : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl h-9 w-9 text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-30"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <BabysitterModal
        isOpen={isCreateModal || isEditModal}
        setIsOpen={(val) => {
          setIsCreateModal(val);
          setIsEditModal(val);
        }}
        title={
          isEditModal
            ? "Update Professional Profile"
            : "Register Childcare Expert"
        }
        formData={formData}
        setFormData={setFormData}
        handleSave={handleSave}
        uploading={uploading}
        handleFileUpload={handleFileUpload}
        loading={loading}
      />
    </div>
  );
}

function BabysitterModal({
  isOpen,
  setIsOpen,
  title,
  formData,
  setFormData,
  handleSave,
  uploading,
  handleFileUpload,
  loading,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl rounded-[3rem] overflow-y-auto max-h-[90vh] bg-white border-0 shadow-2xl p-0">
        <div className="p-10 space-y-10">
          <div className="flex items-center justify-between border-b border-slate-50 pb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {title}
              </h2>
              <p className="text-slate-400 font-medium italic mt-1 font-serif">
                Security is priority. Validate background checks thoroughly.
              </p>
            </div>
            <div className="w-16 h-16 bg-rose-50 rounded-[2rem] flex items-center justify-center">
              <Baby className="w-8 h-8 text-rose-600" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12">
            {/* Section 1 */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs">
                  01
                </div>
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">
                  Personal Info
                </h3>
              </div>

              <div className="space-y-6">
                {/* Profile Picture Upload */}
                <div className="flex items-center gap-6 p-4 rounded-3xl bg-slate-50/50 border border-slate-100">
                  <div className="relative group">
                    {formData.profilePictureUrl ? (
                      <img src={formData.profilePictureUrl} className="w-20 h-20 rounded-[2rem] object-cover border-2 border-white shadow-md" alt="Profile" />
                    ) : (
                      <div className="w-20 h-20 rounded-[2rem] bg-rose-50 flex items-center justify-center border-2 border-white shadow-md">
                        <Baby className="w-8 h-8 text-rose-300" />
                      </div>
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <CloudUpload className="w-6 h-6 text-white" />
                      <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'profilePictureUrl')} />
                    </label>
                    {uploading['profilePictureUrl'] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-[2rem]">
                        <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm">Sitter Photo</h4>
                    <p className="text-xs text-slate-400 font-medium">Friendly photo for parent peace of mind</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-400 uppercase tracking-tighter ml-1">
                    Full Name
                  </Label>
                  <Input
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white font-bold"
                    placeholder="Jane Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-400 uppercase tracking-tighter ml-1">
                    Email Address
                  </Label>
                  <Input
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white font-bold"
                    placeholder="jane@example.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-slate-400 uppercase tracking-tighter ml-1">
                      Phone
                    </Label>
                    <Input
                      value={formData.phone || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white font-bold"
                      placeholder="+1..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-slate-400 uppercase tracking-tighter ml-1">
                      Experience (Years)
                    </Label>
                    <Input
                      type="number"
                      value={formData.experience || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, experience: e.target.value })
                      }
                      className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs">
                  02
                </div>
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">
                  Service Details
                </h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-400 uppercase tracking-tighter ml-1">
                    Hourly Rate ($)
                  </Label>
                  <Input
                    type="number"
                    value={formData.hourlyRate || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, hourlyRate: e.target.value })
                    }
                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-400 uppercase tracking-tighter ml-1">
                    City & State
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={formData.city || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white font-bold"
                      placeholder="City"
                    />
                    <Input
                      value={formData.state || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white font-bold"
                      placeholder="State"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-400 uppercase tracking-tighter ml-1">
                    Verification Status
                  </Label>
                  <Select
                    value={formData.isVerified ? "true" : "false"}
                    onValueChange={(val) =>
                      setFormData({ ...formData, isVerified: val === "true" })
                    }
                  >
                    <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">VERIFIED & APPROVED</SelectItem>
                      <SelectItem value="false">UNDER REVIEW</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs">
                03
              </div>
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">
                Childcare Certification Documents
              </h3>
            </div>

            <div className="grid grid-cols-5 gap-4">
              {[
                { id: "nationalIdUrl", label: "Identity" },
                { id: "backgroundCheckUrl", label: "B-Check" },
                { id: "firstAidCertificateUrl", label: "First Aid" },
                { id: "childcareDiplomaUrl", label: "Diploma" },
                { id: "referenceLettersUrl", label: "Reference" },
              ].map((doc) => (
                <div
                  key={doc.id}
                  className="group relative p-6 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/30 hover:bg-white hover:border-rose-200 transition-all text-center"
                >
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-4 block whitespace-nowrap overflow-hidden text-ellipsis">
                    {doc.label}
                  </Label>
                  {formData[doc.id] ? (
                    <div className="text-emerald-500 font-bold text-xs flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      OK
                    </div>
                  ) : (
                    <div className="text-slate-300 font-bold text-[10px] flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      NONE
                    </div>
                  )}
                  <input
                    type="file"
                    id={`upload-${doc.id}`}
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, doc.id)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 rounded-full w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() =>
                      document.getElementById(`upload-${doc.id}`).click()
                    }
                    disabled={uploading[doc.id]}
                  >
                    {uploading[doc.id] ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CloudUpload className="w-4 h-4 text-rose-500" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              className="flex-1 h-16 rounded-[2rem] border-slate-100 text-slate-400 font-black hover:bg-slate-50"
              onClick={() => setIsOpen(false)}
            >
              DISCARD
            </Button>
            <Button
              className="flex-[2] h-16 rounded-[2rem] bg-rose-600 text-white font-black hover:bg-rose-700 shadow-xl shadow-rose-200 transition-all active:scale-95 border-0"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-6 h-6 mr-2" />
              )}
              APPROVE PROFESSIONAL RECORD
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
