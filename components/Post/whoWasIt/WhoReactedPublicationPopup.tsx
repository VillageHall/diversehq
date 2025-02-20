import React, { useEffect, useState } from 'react'
import PopUpWrapper from '../../Common/PopUpWrapper'
import {
  LimitType,
  Profile,
  useWhoReactedPublicationQuery
} from '../../../graphql/generated'
import InfiniteScroll from 'react-infinite-scroll-component'
import MobileLoader from '../../Common/UI/MobileLoader'
import WhoWasItProfileCard from './WhoWasItProfileCard'
import { useProfileStore } from '../../../store/profile'

interface profiles {
  profile: Profile
}

const WhoReactedPublicationPopup = ({
  publicationId
}: {
  publicationId: string
}) => {
  const [params, setParams] = useState<{
    profiles: profiles[]
    hasMore: boolean
    cursor: string | null
    nextCursor: string | null
  }>({
    profiles: [],
    hasMore: true,
    cursor: null,
    nextCursor: null
  })

  const addProfiles = useProfileStore((state) => state.addProfiles)

  const { data } = useWhoReactedPublicationQuery({
    request: {
      for: publicationId,
      cursor: params.cursor,
      limit: LimitType.Fifty
    }
  })

  useEffect(() => {
    if (data?.whoReactedPublication?.items) {
      setParams({
        ...params,
        // @ts-ignore
        profiles: data?.whoReactedPublication?.items.length
          ? // eslint-disable-next-line
            [...params.profiles, ...data?.whoReactedPublication?.items]
          : params.profiles,
        hasMore: Boolean(data?.whoReactedPublication?.items?.length),
        nextCursor: data?.whoReactedPublication?.pageInfo?.next
      })

      const newProfiles = new Map()
      // eslint-disable-next-line
      for (const profile of data?.whoReactedPublication?.items) {
        newProfiles.set(profile.profile.handle?.fullHandle, profile.profile)
      }
      addProfiles(newProfiles)
    }
  }, [data])

  const getMore = () => {
    if (params?.nextCursor) {
      setParams({
        ...params,
        cursor: params.nextCursor
      })
    }
  }

  console.log('params', params)

  return (
    <PopUpWrapper title="Upvoted by">
      <div
        className="h-full sm:h-[calc(100vh-200px)] overflow-y-auto"
        id="whoReactedPublicattionScrollbar"
      >
        <InfiniteScroll
          dataLength={params.profiles.length}
          next={getMore}
          hasMore={params.hasMore}
          loader={<MobileLoader />}
          scrollableTarget="whoReactedPublicattionScrollbar"
        >
          {params.profiles.map((profile, idx) => {
            return <WhoWasItProfileCard profile={profile.profile} key={idx} />
          })}
        </InfiniteScroll>
      </div>
    </PopUpWrapper>
  )
}

export default WhoReactedPublicationPopup
