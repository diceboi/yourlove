import Image from 'next/image'
import React from 'react'
import Paragraph from './UI/Texts/Paragraph'
import Label from './UI/Texts/Label'
import BlogTitleText from './UI/Texts/BlogTitleText'

export default function BlogTile() {
  return (
    <div className='flex flex-col gap-2 w-full h-[300px]'>
        <div className='relative w-full h-[200px]'>
            <Image src={"/heroimages/hero1.webp"} fill style={{objectFit: "cover", objectPosition: "center"}} alt='blogname'/>
        </div>
        <BlogTitleText classname={"font-bold"}>Blog cím</BlogTitleText>
        <Label>Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit explicabo sequi sit quibusdam ipsam. Animi ratione dolorem ducimus non praesentium deleniti.</Label>
    </div>
  )
}
