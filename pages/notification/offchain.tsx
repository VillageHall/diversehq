import React from 'react'
import NotificationColumn from '../../components/Notification/NotificationColumn'
// import NotificationFilterNav from '../../components/Notification/NotificationFilterNav'
import NotificationSeo from '../../components/Notification/NotificationSeo'

const offchain = () => {
  return (
    <>
      <NotificationSeo />
      <div className="w-full flex justify-center">
        <div className="w-full md:w-[650px]">
          {/* filter nav */}
          {/* {isDesktop && <NotificationFilterNav />} */}

          {/* notifications */}
          <NotificationColumn />
        </div>
      </div>
    </>
  )
}

export default offchain
