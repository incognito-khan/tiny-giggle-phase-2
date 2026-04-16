"use client";

import { useState, useEffect } from "react";
import DaySelector from "@/components/ui/day-selector";
import FancyInput from "@/components/ui/fancy-input";
import { toast } from "react-toastify";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/slices/authSlice";

// ---- Document definitions per role ----
const ROLE_DOCS = {
  doctor: [
    {
      id: "nationalId",
      name: "National ID / Passport",
      hint: "Required for all professionals",
      required: true,
    },
    {
      id: "medicalLicense",
      name: "Medical license",
      hint: "Issued by your licensing board",
      required: true,
    },
    {
      id: "specialtyCertificate",
      name: "Specialty certificate",
      hint: "Relevant specialty certification",
      required: true,
    },
    {
      id: "malpracticeInsurance",
      name: "Malpractice insurance",
      hint: "Current policy document",
      required: false,
    },
    {
      id: "deaRegistration",
      name: "DEA registration",
      hint: "If applicable",
      required: false,
    },
  ],
  babysitter: [
    {
      id: "nationalId",
      name: "National ID / Passport",
      hint: "Required for all professionals",
      required: true,
    },
    {
      id: "firstAidCertificate",
      name: "CPR & First Aid certificate",
      hint: "Must be current",
      required: true,
    },
    {
      id: "backgroundCheck",
      name: "Background check report",
      hint: "Issued within last 12 months",
      required: true,
    },
    {
      id: "childcareDiploma",
      name: "Childcare diploma",
      hint: "Formal training certificate",
      required: false,
    },
    {
      id: "referenceLetters",
      name: "Reference letters",
      hint: "From previous families",
      required: false,
    },
  ],
  supplier: [
    {
      id: "nationalId",
      name: "National ID / Passport",
      hint: "Required for all professionals",
      required: true,
    },
    {
      id: "businessRegistration",
      name: "Business registration",
      hint: "Official company certificate",
      required: true,
    },
    {
      id: "taxId",
      name: "Tax ID / VAT certificate",
      hint: "For invoicing purposes",
      required: true,
    },
    {
      id: "productCatalog",
      name: "Product catalog",
      hint: "PDF or image of products",
      required: false,
    },
    {
      id: "insurance",
      name: "Insurance certificate",
      hint: "Liability coverage proof",
      required: false,
    },
  ],
  artist: [
    {
      id: "nationalId",
      name: "National ID / Passport",
      hint: "Required for all professionals",
      required: true,
    },
    {
      id: "portfolio",
      name: "Portfolio (PDF/Samples)",
      hint: "Work samples",
      required: true,
    },
    {
      id: "copyrightCertificates",
      name: "Copyright certificates",
      hint: "For original works",
      required: false,
    },
    {
      id: "exhibitionRecords",
      name: "Exhibition records",
      hint: "Past shows or features",
      required: false,
    },
    {
      id: "bankDetails",
      name: "Bank / payment details",
      hint: "For commission payouts",
      required: false,
    },
  ],
};

// ---- Profile Upload ----
function ProfileUpload({ image, setImage, isUploading }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-24 h-24">
        <img
          src={
            image ||
            "https://ui-avatars.com/api/?name=User&background=E9D5FF&color=7C3AED"
          }
          alt="profile"
          className="w-full h-full rounded-full object-cover border"
        />
        <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer text-xs">
          {isUploading ? <Loader2 className="animate-spin w-3 h-3" /> : "✎"}
          <input
            type="file"
            accept="image/*"
            disabled={isUploading}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const formData = new FormData();
              formData.append("file", file);

              try {
                setImage(null, true);
                const res = await fetch("/api/v1/upload/public", {
                  method: "POST",
                  body: formData,
                });
                const data = await res.json();
                if (data.data?.url) setImage(data.data.url, false);
                else toast.error("Upload failed");
              } catch (err) {
                toast.error("Upload failed");
              } finally {
                setImage(null, false);
              }
            }}
            className="hidden"
          />
        </label>
      </div>
      <p className="text-sm text-gray-500">Upload profile picture</p>
    </div>
  );
}

// ---- Document Upload Step ----
function DocumentUploadStep({ role, uploaded, setUploaded }) {
  const [uploading, setUploading] = useState({});
  const docs = ROLE_DOCS[role] || [];

  const handleUpload = async (id, file) => {
    const formData = new FormData();
    formData.append("file", file);

    setUploading((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch("/api/v1/upload/public", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.data?.url) {
        setUploaded((prev) => ({ ...prev, [id]: data.data.url }));
        toast.success("File uploaded");
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Required documents are marked. Accepted formats: PDF, JPG, PNG.
      </p>

      {docs.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-3 rounded-xl border bg-gray-50"
        >
          <div className="flex-1 min-w-0 mr-3">
            <p className="text-sm font-medium text-gray-800 truncate">
              {doc.name}
            </p>
            <p className="text-xs text-gray-400">{doc.hint}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                doc.required
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {doc.required ? "Required" : "Optional"}
            </span>

            <label className="cursor-pointer">
              <span
                className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
                  uploaded[doc.id]
                    ? "bg-green-50 border-green-300 text-green-700"
                    : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {uploading[doc.id] ? (
                  <Loader2 className="animate-spin w-3 h-3" />
                ) : uploaded[doc.id] ? (
                  "✓ Uploaded"
                ) : (
                  "Upload"
                )}
              </span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                disabled={uploading[doc.id]}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(doc.id, file);
                }}
              />
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Main ----
export default function JoinPage() {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    cnic: "",
    specialty: "",
    licenseNumber: "",
    yearsOfExperience: "",
    consultationFee: "",
    school: "",
    experience: "",
    ageGroups: [],
    languages: [],
    certifications: "",
    bio: "",
    businessName: "",
    businessRegistration: "",
    taxId: "",
    website: "",
    stageName: "",
    medium: "",
    yearsActive: "",
    portfolioUrl: "",
    categoryId: "",
    subCategoryId: "",
    serviceMode: "CLINIC",
    clinicName: "",
    clinicAddress: "",
    zipCode: "",
    profilePicture: "",
  });

  const [uploadedDocs, setUploadedDocs] = useState({});
  const [availability, setAvailability] = useState({
    days: [],
    start: "",
    end: "",
  });

  // Dynamic Categories
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  useEffect(() => {
    if (role === "artist") {
      fetch("/api/v1/categories/music")
        .then((res) => res.json())
        .then((data) => setCategories(data.data || []))
        .catch(() => toast.error("Failed to fetch music categories"));
    } else if (role === "supplier") {
      fetch("/api/v1/categories")
        .then((res) => res.json())
        .then((data) => setCategories(data.data || []))
        .catch(() => toast.error("Failed to fetch categories"));
    }
  }, [role]);

  const handleCategoryChange = (catId) => {
    setFormData({ ...formData, categoryId: catId, subCategoryId: "" });
    const selected = categories.find((c) => c.id === catId);
    setSubCategories(selected?.subCategories || []);
  };

  const updateForm = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const totalSteps = role === "doctor" ? 7 : 6;

  const next = async () => {
    if (step === 1 && !role) return;

    if (step === totalSteps) {
      await handleSubmit();
      return;
    }

    setStep((s) => s + 1);
  };

  const back = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        role,
        ...formData,
        ...uploadedDocs,
        ageGroups:
          typeof formData.ageGroups === "string"
            ? formData.ageGroups.split(",").map((s) => s.trim())
            : formData.ageGroups,
        languages:
          typeof formData.languages === "string"
            ? formData.languages.split(",").map((s) => s.trim())
            : formData.languages,
        days: availability.days,
        startTime: availability.start,
        endTime: availability.end,
      };

      const res = await fetch("/api/v1/auth/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Account created successfully!");
        localStorage.setItem("token", result.data.tokens.accessToken);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        dispatch(setCredentials({ user: result.data.user }));

        if (role === "parent") {
          window.location.href = "/dashboard";
        } else {
          // Initialize Payment
          const payRes = await fetch(`/api/v1/auth/${role}/payment/init`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${result.data.tokens.accessToken}`,
            },
          });
          const payData = await payRes.json();
          if (payData.data?.url) window.location.href = payData.data.url;
          else
            window.location.href = "/admin-dashboard/settings?tab=activation";
        }
      } else {
        toast.error(result.message || "Registration failed");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-600 to-orange-400 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-8">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-purple-600 rounded-full transition-all"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-bold">
            Step {step} of {totalSteps}
          </p>
        </div>

        {/* ── STEP 1: Role selection ── */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-black mb-2 text-gray-800">
              Choose your path
            </h2>
            <p className="text-gray-500 mb-8">
              Join the TinyGiggle community in the role that fits you best.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  key: "doctor",
                  label: "Doctor",
                  sub: "Provide medical advice",
                  accent: "purple",
                },
                {
                  key: "babysitter",
                  label: "Babysitter",
                  sub: "Professional childcare",
                  accent: "orange",
                },
                {
                  key: "supplier",
                  label: "Supplier",
                  sub: "Goods & services",
                  accent: "teal",
                },
                {
                  key: "artist",
                  label: "Artist",
                  sub: "Creative works & music",
                  accent: "pink",
                },
              ].map(({ key, label, sub, accent }) => (
                <button
                  key={key}
                  onClick={() => setRole(key)}
                  className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 transform hover:scale-[1.02] ${
                    role === key
                      ? `border-${accent}-500 bg-${accent}-50/50 ring-4 ring-${accent}-100`
                      : "border-gray-100 bg-gray-50/30 hover:border-purple-200"
                  }`}
                >
                  <h3 className="font-bold text-lg text-gray-800">{label}</h3>
                  <p className="text-sm text-gray-500">{sub}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: Personal info ── */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Create your profile</h2>
            <ProfileUpload
              image={formData.profilePicture}
              setImage={(url, isUploading) => updateForm("profilePicture", url)}
            />
            <div className="grid gap-4">
              <FancyInput
                label="Full Name"
                value={formData.name}
                onChange={(e) => updateForm("name", e.target.value)}
              />
              <FancyInput
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => updateForm("email", e.target.value)}
              />
              <FancyInput
                label="Create Password"
                type="password"
                value={formData.password}
                onChange={(e) => updateForm("password", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <FancyInput
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                />
                <FancyInput
                  label="CNIC / National ID Number"
                  value={formData.cnic}
                  onChange={(e) => updateForm("cnic", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FancyInput
                  label="City"
                  value={formData.city}
                  onChange={(e) => updateForm("city", e.target.value)}
                />
                <FancyInput
                  label="State"
                  value={formData.state}
                  onChange={(e) => updateForm("state", e.target.value)}
                />
                <FancyInput
                  label="Country"
                  value={formData.country}
                  onChange={(e) => updateForm("country", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Role-specific professional details ── */}
        {step === 3 && role === "doctor" && (
          <div className="grid gap-4">
            <h2 className="text-2xl font-bold">Medical Credentials</h2>
            <FancyInput
              label="Specialty (e.g., Pediatrician)"
              value={formData.specialty}
              onChange={(e) => updateForm("specialty", e.target.value)}
            />
            <FancyInput
              label="Medical License Number"
              value={formData.licenseNumber}
              onChange={(e) => updateForm("licenseNumber", e.target.value)}
            />
            <FancyInput
              label="Years of Experience"
              type="number"
              value={formData.yearsOfExperience}
              onChange={(e) => updateForm("yearsOfExperience", e.target.value)}
            />
            <FancyInput
              label="Consultation Fee (USD)"
              type="number"
              value={formData.consultationFee}
              onChange={(e) => updateForm("consultationFee", e.target.value)}
            />
            <FancyInput
              label="Medical School / Institute"
              value={formData.school}
              onChange={(e) => updateForm("school", e.target.value)}
            />
          </div>
        )}

        {step === 3 && role === "babysitter" && (
          <div className="grid gap-4">
            <h2 className="text-2xl font-bold">Childcare Experience</h2>
            <FancyInput
              label="Years of Professional Experience"
              type="number"
              value={formData.experience}
              onChange={(e) => updateForm("experience", e.target.value)}
            />
            <FancyInput
              label="Preferred Age Groups (comma separated)"
              placeholder="0-2, 3-6"
              value={formData.ageGroups}
              onChange={(e) => updateForm("ageGroups", e.target.value)}
            />
            <FancyInput
              label="Languages (comma separated)"
              placeholder="English, Spanish"
              value={formData.languages}
              onChange={(e) => updateForm("languages", e.target.value)}
            />
            <FancyInput
              label="Relevant Certifications"
              value={formData.certifications}
              onChange={(e) => updateForm("certifications", e.target.value)}
            />
          </div>
        )}

        {step === 3 && role === "supplier" && (
          <div className="grid gap-4">
            <h2 className="text-2xl font-bold">Business Information</h2>
            <FancyInput
              label="Business / Company Name"
              value={formData.businessName}
              onChange={(e) => updateForm("businessName", e.target.value)}
            />
            <FancyInput
              label="Business Registration Number"
              value={formData.businessRegistration}
              onChange={(e) =>
                updateForm("businessRegistration", e.target.value)
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-gray-700">
                  Category
                </label>
                <select
                  className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm focus:border-purple-500 transition-all outline-none"
                  value={formData.categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-gray-700">
                  Sub Category
                </label>
                <select
                  className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm focus:border-purple-500 transition-all outline-none"
                  value={formData.subCategoryId}
                  onChange={(e) => updateForm("subCategoryId", e.target.value)}
                  disabled={!formData.categoryId}
                >
                  <option value="">Select Sub Category</option>
                  {subCategories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <FancyInput
              label="Tax ID / VAT Number"
              value={formData.taxId}
              onChange={(e) => updateForm("taxId", e.target.value)}
            />
            <FancyInput
              label="Website URL"
              value={formData.website}
              onChange={(e) => updateForm("website", e.target.value)}
            />
          </div>
        )}

        {step === 3 && role === "artist" && (
          <div className="grid gap-4">
            <h2 className="text-2xl font-bold">Artistic Profile</h2>
            <FancyInput
              label="Artist / Stage Name"
              value={formData.stageName}
              onChange={(e) => updateForm("stageName", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-gray-700">
                  Music Category
                </label>
                <select
                  className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm focus:border-purple-500 transition-all outline-none"
                  value={formData.categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-gray-700">
                  Music Style
                </label>
                <select
                  className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm focus:border-purple-500 transition-all outline-none"
                  value={formData.subCategoryId}
                  onChange={(e) => updateForm("subCategoryId", e.target.value)}
                  disabled={!formData.categoryId}
                >
                  <option value="">Select Sub Category</option>
                  {subCategories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <FancyInput
              label="Medium (e.g. Pop, Jazz)"
              value={formData.medium}
              onChange={(e) => updateForm("medium", e.target.value)}
            />
            <FancyInput
              label="Years Active"
              type="number"
              value={formData.yearsActive}
              onChange={(e) => updateForm("yearsActive", e.target.value)}
            />
          </div>
        )}

        {/* ── STEP 4 ── */}
        {step === 4 && role === "doctor" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Service Mode</h2>
            <p className="font-medium text-gray-600">
              Select your preferred consultation method:
            </p>
            <div className="grid grid-cols-3 gap-3">
              {["clinic", "home", "both"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => updateForm("serviceMode", mode)}
                  className={`p-4 rounded-xl border-2 capitalize transition-all ${
                    formData.serviceMode === mode
                      ? "border-purple-600 bg-purple-50 text-purple-700 font-bold"
                      : "border-gray-100"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            {(formData.serviceMode === "clinic" ||
              formData.serviceMode === "both") && (
              <div className="grid gap-4 pt-4 border-t mt-4">
                <FancyInput
                  label="Clinic Name"
                  value={formData.clinicName}
                  onChange={(e) => updateForm("clinicName", e.target.value)}
                />
                <FancyInput
                  label="Clinic Address"
                  value={formData.clinicAddress}
                  onChange={(e) => updateForm("clinicAddress", e.target.value)}
                />
                <FancyInput
                  label="ZIP Code"
                  value={formData.zipCode}
                  onChange={(e) => updateForm("zipCode", e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {step === 4 && role !== "doctor" && (
          <AvailabilityStep
            days={availability.days}
            setDays={(d) => {
              setAvailability((prev) => ({
                ...prev,
                days: typeof d === "function" ? d(prev.days) : d,
              }));
            }}
            time={{ start: availability.start, end: availability.end }}
            setTime={(t) => {
              setAvailability((prev) => ({
                ...prev,
                ...t,
              }));
            }}
            bio={formData.bio}
            setBio={(v) => updateForm("bio", v)}
          />
        )}

        {/* ── STEP 5 ── */}
        {step === 5 && role === "doctor" && (
          <AvailabilityStep
            days={availability.days}
            setDays={(d) => {
              setAvailability((prev) => ({
                ...prev,
                days: typeof d === "function" ? d(prev.days) : d,
              }));
            }}
            time={{ start: availability.start, end: availability.end }}
            setTime={(t) => {
              setAvailability((prev) => ({
                ...prev,
                ...t,
              }));
            }}
            bio={formData.bio}
            setBio={(v) => updateForm("bio", v)}
          />
        )}

        {step === 5 && role && role !== "doctor" && role !== "parent" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Verify Identity
            </h2>
            <DocumentUploadStep
              role={role}
              uploaded={uploadedDocs}
              setUploaded={setUploadedDocs}
            />
          </div>
        )}

        {/* ── STEP 6 ── */}
        {step === 6 && role === "doctor" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Upload Professional Documents
            </h2>
            <DocumentUploadStep
              role={role}
              uploaded={uploadedDocs}
              setUploaded={setUploadedDocs}
            />
          </div>
        )}

        {step === 6 && role !== "doctor" && role !== "parent" && (
          <div className="text-center py-10">
            <div className="mb-6 flex justify-center">
              <div className="bg-orange-100 p-6 rounded-full">
                <CheckCircle2 size={48} className="text-orange-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4">You're almost there!</h2>
            <p className="text-gray-500 mb-8">
              Click below to pay the annual membership fee and finalize your
              registration.
            </p>
            <div className="p-6 rounded-3xl bg-gray-50 border-2 border-gray-100 mb-8">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">
                Annual Membership Fee
              </p>
              <p className="text-5xl font-black text-gray-800">
                {role === "doctor" ? "$150.00" : 
                 role === "babysitter" ? "$50.00" :
                 role === "supplier" ? "$80.00" :
                 role === "artist" ? "$75.00" : "$0.00"}
              </p>
              <p className="text-xs text-gray-400 mt-2">Valid for 1 year</p>
            </div>
          </div>
        )}

        {/* ── STEP 7 (doctor only) ── */}
        {step === 7 && (
          <div className="text-center py-10">
            <div className="mb-6 flex justify-center">
              <div className="bg-orange-100 p-6 rounded-full">
                <CheckCircle2 size={48} className="text-orange-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4">Ready to Activate?</h2>
            <p className="text-gray-500 mb-8">
              Your profile has been saved. Pay your annual membership fee now to activate your account.
            </p>
            <div className="p-6 rounded-3xl bg-gray-50 border-2 border-gray-100 mb-8">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">
                Annual Membership Fee
              </p>
              <p className="text-5xl font-black text-gray-800">
                {role === "doctor" ? "$150.00" : 
                 role === "babysitter" ? "$50.00" :
                 role === "supplier" ? "$80.00" :
                 role === "artist" ? "$75.00" : "$0.00"}
              </p>
              <p className="text-xs text-gray-400 mt-2">Valid for 1 year</p>
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="flex justify-between mt-10">
          <button
            onClick={back}
            disabled={step === 1 || isSubmitting}
            className="text-gray-400 font-bold hover:text-gray-600 disabled:opacity-0 transition-all"
          >
            ← Back
          </button>
          <button
            onClick={next}
            disabled={(step === 1 && !role) || isSubmitting}
            className={`px-10 py-4 rounded-2xl text-white font-black shadow-xl transform transition-all active:scale-95 flex items-center gap-2 ${
              (step === 1 && !role) || isSubmitting
                ? "bg-gray-200 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 hover:shadow-purple-200"
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : step === totalSteps ? (
              role === "parent" ? (
                "Create Account"
              ) : (
                "Secure Payment"
              )
            ) : (
              "Next Step →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Shared sub-components ----

function AvailabilityStep({ days, setDays, time, setTime, bio, setBio }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Availability</h2>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-bold text-gray-700">
          Tell us about yourself (Bio)
        </label>
        <textarea
          className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm focus:border-purple-500 transition-all outline-none min-h-[100px]"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Share your expertise and experience..."
        />
      </div>
      <div>
        <p className="font-bold text-sm text-gray-700 mb-3">Available days</p>
        <DaySelector selected={days} setSelected={setDays} />
      </div>
      <div>
        <p className="font-bold text-sm text-gray-700 mb-3">Operating Hours</p>
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
              Start Time
            </label>
            <input
              type="time"
              className="w-full border-2 border-gray-100 rounded-xl px-3 py-3 text-sm focus:border-purple-500 outline-none"
              value={time.start}
              onChange={(e) => setTime({ start: e.target.value })}
            />
          </div>
          <span className="text-gray-300 font-bold mt-5">to</span>
          <div className="flex-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
              End Time
            </label>
            <input
              type="time"
              className="w-full border-2 border-gray-100 rounded-xl px-3 py-3 text-sm focus:border-purple-500 outline-none"
              value={time.end}
              onChange={(e) => setTime({ end: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
