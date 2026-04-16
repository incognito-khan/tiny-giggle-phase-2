"use client";
// import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import Blogs from "@/components/ui/home/blogs";
import CustomerFeedback from "@/components/ui/home/customer-feedback";
import EducationCards from "@/components/ui/home/educationCards";
import Gallery from "@/components/ui/home/gallery";
import GradePrograms from "@/components/ui/home/grade";
import LearningOpportunity from "@/components/ui/home/learning-opportunity";
import SchoolFacilities from "@/components/ui/home/school-facilities";
import Session from "@/components/ui/home/session";
import BannerSliderHome from "@/components/ui/home/bannerSliderHome";
import { Compliance } from "@/components/ui/home/compliance";
import { useSelector } from "react-redux";

export default function Home() {
  const user = useSelector((state) => state.auth.user);
  const userLoggedIn = useSelector((state) => state.auth.isUserLoggedIn);
  console.log(user, userLoggedIn, "user, userLoggedIn");
  return (
    <div className="min-h-screen bg-gray-50">
      <BannerSliderHome />
      <EducationCards />
      <LearningOpportunity />
      <Session />
      <Gallery />
      <GradePrograms />
      {/* <SchoolFacilities /> */}
      <CustomerFeedback />
      <Blogs />
      <Compliance />
    </div>
  );
}
