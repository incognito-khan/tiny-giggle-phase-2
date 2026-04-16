import Banner from '@/components/layout/banner'
import ContactSection from '@/components/ui/contact/contact'
import React from 'react'

const page = () => {
  return (
    <div className='min-h-screen bg-gray-50'>
        <Banner name="Contact" />
        <ContactSection />
    </div>
  )
}

export default page