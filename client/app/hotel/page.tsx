'use client'

import React, { Suspense } from 'react'
import HotelDetails from '@/components/HotelDetails'

const page = () => {
  return (
    <Suspense fallback={<div>Loading hotel details...</div>}>
      <HotelDetails/>
    </Suspense>
  )
}

export default page