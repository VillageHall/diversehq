import React, { FC } from 'react'
import ImageWithFullScreenZoom from '../Common/UI/ImageWithFullScreenZoom'
import imageProxy from '../User/lib/imageProxy'
import {
  SUPPORTED_AUDIO_TYPE,
  SUPPORTED_IMAGE_TYPE,
  SUPPORTED_VIDEO_TYPE
} from '../../utils/config'
import AudioPlayer from './AudioPlayer'
import { Publication } from '../../graphql/generated'
import LivePeerVideoPlayback from '../Common/UI/LivePeerVideoPlayback'
import VideoWithAutoPause from '../Common/UI/VideoWithAutoPause'
import { stringToLength } from '../../utils/utils'

interface Props {
  type: string
  url: string
  publication: Publication
  className?: string
  coverUrl?: string
  isNew?: boolean
  hideDelete?: boolean
}

const AttachmentMedia: FC<Props> = ({
  type,
  url,
  coverUrl,
  publication,
  className
}) => {
  return (
    <>
      {type === 'image/svg+xml' ? (
        <button onClick={() => window.open(url, '_blank')}>
          Open Image in new tab
        </button>
      ) : SUPPORTED_VIDEO_TYPE.includes(type) ? (
        url.startsWith('https://firebasestorage.googleapis.com') ? (
          <VideoWithAutoPause
            src={imageProxy(url)}
            className={`image-unselectable object-contain sm:rounded-lg w-full ${className}`}
            controls
            muted
            autoPlay={false}
            poster={coverUrl || null}
          />
        ) : (
          <div
            className={`image-unselectable object-contain sm:rounded-lg w-full overflow-hidden ${className} flex items-center`}
          >
            <LivePeerVideoPlayback
              posterUrl={null}
              title={stringToLength(publication?.metadata?.content, 30)}
              url={url}
            />
          </div>
        )
      ) : SUPPORTED_AUDIO_TYPE.includes(type) ? (
        <AudioPlayer
          src={url}
          className={`${className}`}
          publication={publication}
        />
      ) : SUPPORTED_IMAGE_TYPE.includes(type) ? (
        <ImageWithFullScreenZoom
          src={imageProxy(url)}
          className={`image-unselectable object-cover sm:rounded-lg w-full ${className}`}
          alt={publication?.metadata?.content}
        />
      ) : (
        <></>
      )}
    </>
  )
}

export default AttachmentMedia
