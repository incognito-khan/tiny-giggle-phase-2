import Banner from '@/components/layout/banner'
import BlogSection from '@/components/ui/blogs/blogSection';
import React from 'react'

const page = () => {
    return (
        <div className="min-h-screen ">
            <Banner name="Blogs" />
            <BlogSection />
        </div>
    )
}

export default page;