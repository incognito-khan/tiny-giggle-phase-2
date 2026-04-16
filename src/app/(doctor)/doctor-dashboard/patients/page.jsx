import PatientsList from "@/components/doctor-dashboard/patients-list";

export const metadata = {
  title: "My Patients",
  description: "View and manage your patients",
};

export default function PatientsPage() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <PatientsList />
    </div>
  );
}
