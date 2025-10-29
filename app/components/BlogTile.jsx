import Image from 'next/image'
import Link from 'next/link'
import BlogTitleText from '@/app/components/UI/Texts/BlogTitleText'
import Label from '@/app/components/UI/Texts/Label'

export default function BlogTile({ post }) {
  const href = post.slug ? `/blog/${post.slug}` : '#'
  return (
    <Link href={href} className="flex flex-col gap-2 w-full h-[300px]">
      <div className="relative w-full h-[200px] rounded-xl overflow-hidden">
        {post.kep ? (
          <Image
            src={post.kep}
            alt={post.kep_alt || post.cim || 'blog kép'}
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
        ) : (
          <div className="w-full h-full bg-[var(--grey-bg)]" />
        )}
      </div>
      <BlogTitleText classname="font-bold line-clamp-2">{post.cim || 'Cím nélkül'}</BlogTitleText>
      <Label className="line-clamp-2">{post.bevezeto || ''}</Label>
    </Link>
  )
}
