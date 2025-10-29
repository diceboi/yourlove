"use client"

import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function GyikAnimation() {
  return (
    <DotLottieReact
        src="animations/gyik.lottie"
        loop
        autoplay
        style={{ height: 800, width: 800 }}
        className='overflow-hidden'
    />
  )
}
