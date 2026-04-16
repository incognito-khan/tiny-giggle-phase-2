import Download from '@/components/download/download'
import Banner from '@/components/layout/banner'
import React from 'react'

const page = () => {
  return (
    <div className='min-h-screen bg-gray-50'>
        <Banner name="Download" />
        <Download />
    </div>
  )
}

export default page