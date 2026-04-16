"use client"
import ProgramsDetailsPage from '@/components/parent-dashboard/programs/programsDetails/programsDetails'
import { useParams } from 'next/navigation'
import React from 'react'

const page = () => {
    const params = useParams()
  return (
    <div>
        <ProgramsDetailsPage />
    </div>
  )
}

export default page