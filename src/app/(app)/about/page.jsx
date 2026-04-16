import Banner from '@/components/layout/banner'
import Footer from '@/components/layout/footer'
import Navbar from '@/components/layout/navbar'
import KidsActivities from '@/components/ui/about/kidsActivities'
import Learning from '@/components/ui/about/learning'
import PreschoolHero from '@/components/ui/about/preschool'
import SmallCards from '@/components/ui/about/smallCards'
import Testominal from '@/components/ui/about/testominal'
import React from 'react'

const page = () => {
  return (
    <div className="min-h-screen bg-gray-50">
        <Banner name="About Us" />
        <SmallCards />
        <Learning />
        <PreschoolHero />
        {/* <Testominal /> */}
        <KidsActivities />
    </div>
  )
}

export default page