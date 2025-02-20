import { memo } from 'react'
import useSort from '../Common/Hook/useSort'
import LensAllLatestPublicationsColumn from './LensAllLatestPublicationsColumn'
import LensAllTopPublicationsColumn from './LensAllTopPublicationsColumn'

const LensPostsExplorePublicationsColumn = ({
  pathnameToShow
}: {
  pathnameToShow: string
}) => {
  const { isTop } = useSort()
  return (
    <>
      <div className={`${isTop ? 'block' : 'hidden'}`}>
        <LensAllTopPublicationsColumn />
      </div>
      <div className={`${isTop ? 'hidden' : 'block'}`}>
        <LensAllLatestPublicationsColumn pathnameToShow={pathnameToShow} />
      </div>
    </>
  )
}

export default memo(LensPostsExplorePublicationsColumn)
