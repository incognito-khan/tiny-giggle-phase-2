import { Doctors } from "@/components/admin-dashboard/doctors/doctors";

export const metadata = {
  title: "Doctor Management | Tinny Giggle Admin",
  description: "Manage medical professionals and verify credentials.",
};

export default function DoctorsPage() {
  return <Doctors />;
}
