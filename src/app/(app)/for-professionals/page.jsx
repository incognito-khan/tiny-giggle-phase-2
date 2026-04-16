import Banner from "@/components/layout/banner";
import Learning from "@/components/ui/about/learning";
import AdmissionSection from "@/components/ui/about/whyChooseUs/admission";
import GuideSection from "@/components/ui/about/whyChooseUs/guide";
import WhyChooseUs from "@/components/ui/about/whyChooseUs/whyChooseUs";
import React from "react";

const page = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Banner name="For Professionals" />
      <div
        className="bg-center bg-cover object-center"
        style={{
          backgroundImage: `url("https://html.vecurosoft.com/toddly/demo/assets/img/why/why-choose-us-bg.png)`,
        }}
      >
        <WhyChooseUs />
        <Learning />
      </div>
      <AdmissionSection />
      <GuideSection />
    </div>
  );
};

export default page;
