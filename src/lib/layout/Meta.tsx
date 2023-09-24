import React, { memo } from 'react'
import { Helmet } from 'react-helmet'

const Thumb = 'https://remote-image.decentralized-content.com/image?url=https%3A%2F%2Fipfs.decentralized-content.com%2Fipfs%2Fbafkreidxxr42k6sff4ppctl4l3xvh52rf2m7vzdrjmyqhoijveevwafkau&w=3840&q=75'

type SeoProps = {
  title?: string
  description?: string
  type?: string
  name?: string
}

export const Meta: React.FC<SeoProps> = memo(
  ({
    title,
    description = 'Skatehive | The portal for skateboarding in web3',
    type = 'website',
    name = 'Skatehive',
  }) => {
    const publicUrl = window.location.origin
    return (
      <Helmet>
        {/* Standard metadata tags */}
        <title>{title ? `${title} | SkateHive` : 'SkateHive'}</title>
        <meta name='description' content={description} />
        {/* End standard metadata tags */}
        {/* Facebook tags */}
        <meta property='og:image' content={`${publicUrl}${Thumb}`} />
        <meta property='og:type' content={type} />
        <meta property='og:title' content={title} />
        <meta property='og:description' content={description} />
        {/* End Facebook tags */}
        {/* Twitter tags */}
        <meta name='twitter:creator' content={name} />
        <meta name='twitter:card' content={type} />
        <meta name='twitter:title' content={title} />
        <meta name='twitter:description' content={description} />
        {/* End Twitter tags */}
      </Helmet>
    )
  },
)