import H1 from '@/app/components/UI/Texts/H1'
import Paragraph from '@/app/components/UI/Texts/Paragraph'
import { Suspense } from 'react'
import BlogCategoryFilterBar from './BlogCategoryFilterBar'

export default function BlogHero({ categories }) {
  return (
    <div className="flex flex-col items-center justify-center relative w-full xl:h-[50vh] h-[50vh] rounded-2xl">
      <div className="absolute top-0 left-0 w-full h-full bg-[var(--grey-bg)] rounded-2xl" />
      <div className="w-full flex flex-col gap-8 items-start justify-between">
        <div className="flex flex-col items-center gap-8 z-10 w-full">
          <H1 classname="text-center text-[var(--pink)]">Blogok, tesztek, történetek.</H1>
          <Paragraph classname="text-center lg:w-1/3 w-full">
            Ha szeretnél többet megtudni termékekről, vagy csak olvasgatnál néhány pikáns történetet, jó helyen jársz.
          </Paragraph>
        </div>
      </div>
      <div className="absolute bottom-4 z-10 mx-4">
        <Suspense fallback={<div>Betöltés...</div>}>
          <BlogCategoryFilterBar categories={categories} />
        </Suspense>
      </div>
    </div>
  )
}
