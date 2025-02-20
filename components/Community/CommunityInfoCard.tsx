import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { isCreatorOrModeratorOfCommunity } from '../../apiHelper/community'
import { useNotify } from '../Common/NotifyContext'
import { useProfile } from '../Common/WalletContext'
import BottomDrawerWrapper from '../Common/BottomDrawerWrapper'
import { RiMore2Fill } from 'react-icons/ri'
import { IoIosShareAlt } from 'react-icons/io'
import MoreOptionsModal from '../Common/UI/MoreOptionsModal'
import OptionsWrapper from '../Common/OptionsWrapper'
import ImageWithFullScreenZoom from '../Common/UI/ImageWithFullScreenZoom'
import { Tooltip } from '@mui/material'
import { getLevelAndThresholdXP } from '../../lib/helpers'
import { xpPerMember } from '../../utils/config'
import Link from 'next/link'
import formatHandle from '../User/lib/formatHandle'
import { CommunityWithCreatorProfile } from '../../types/community'
import { FiInfo, FiSettings } from 'react-icons/fi'
import ExploreCommunityCard from './ExploreCommunityCard'
import { BsPeopleFill } from 'react-icons/bs'
import { useDevice } from '../Common/DeviceWrapper'
// import { useCommunityStore } from '../../store/community'
// import CreatePostPopup from '../Home/CreatePostPopup'
// import { modalType, usePopUpModal } from '../Common/CustomPopUpProvider'
import useJoinCommunityButton from './hook/useJoinCommunityButton'
import VerifiedBadge from '../Common/UI/Icon/VerifiedBadge'
import getIPFSLink from '../User/lib/getIPFSLink'
import { modalType, usePopUpModal } from '../Common/CustomPopUpProvider'
import WhoIsMemeberOfCommunity from '../Post/whoWasIt/WhoIsMemeberOfCommunity'
// import CreatePostBar from '../Home/CreatePostBar'

interface Props {
  _community: CommunityWithCreatorProfile
}

const CommunityInfoCard = ({ _community }: Props) => {
  const [community, setCommunity] = useState(_community)
  const { user } = useProfile()
  const { notifyInfo } = useNotify()
  const [isAuth, setIsAuth] = useState(false)
  const router = useRouter()
  const { currentXP, level, thresholdXP } = getLevelAndThresholdXP(
    community?.membersCount * xpPerMember || 0
  )
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isExploreDrawerOpen, setIsExploreDrawerOpen] = useState(false)
  const [showOptionsModal, setShowOptionsModal] = useState(false)
  const name = community?.name
  const { isMobile } = useDevice()
  const { showModal } = usePopUpModal()
  const { JoinCommunityButton } = useJoinCommunityButton({
    id: community?._id,
    showJoined: true
  })

  // const selectCommunityForPost = useCommunityStore(
  //   (state) => state.selectCommunityForPost
  // )

  const redirectToCommunityPage = () => {
    if (name) router.push(`/c/${name}`)
  }

  const calculateBarPercentage = (currentXP, threshold) => {
    const percentage = Math.round((threshold * 100) / currentXP)
    return percentage
  }

  const shareCommunity = () => {
    if (navigator.share) {
      navigator.share({
        title: `Join c/${community?.name} on DiverseHQ`,
        text: `Join c/${community?.name} on DiverseHQ`,
        url: `https://diversehq.xyz/c/${community?.name}`
      })
    } else {
      notifyInfo('Sharing is not supported on your device')
    }
  }

  const checkIfCreatorOrModerator = async (name: string) => {
    try {
      const res = await isCreatorOrModeratorOfCommunity(name)
      if (res.status === 200) {
        setIsAuth(true)
      } else {
        setIsAuth(false)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const showMembersList = () => {
    showModal({
      component: (
        <WhoIsMemeberOfCommunity
          communityId={community?._id}
          totalMembers={community?.membersCount}
        />
      ),
      type: modalType.normal
    })
  }

  // const showCreatePostPopup = () => {
  //   showModal({
  //     component: <CreatePostPopup />,
  //     type: modalType.normal
  //   })
  // }

  useEffect(() => {
    if (community) {
      setCommunity(_community)
    }
  }, [_community])

  useEffect(() => {
    checkIfCreatorOrModerator(community?.name)
  }, [user?.walletAddress, community?.name])

  return (
    <>
      {community && (
        <>
          {router.pathname.startsWith('/explore') ? (
            <ExploreCommunityCard _community={community} />
          ) : (
            <div className="relative z-0 bg-s-bg text-p-text w-[calc(100vw-9px)]">
              <ImageWithFullScreenZoom
                className={`h-48 sm:h-72 w-full object-cover`}
                src={getIPFSLink(community.bannerImageUrl)}
              />
              <div className="md:w-[650px] lg:w-[950px] xl:w-[1000px] mx-auto">
                <div className="relative flex flex-row items-start justify-between">
                  <div
                    className={`flex flex-row gap-2 ${isMobile ? 'mx-4' : ''}`}
                  >
                    <div className="shrink-0 rounded-xl -translate-y-5  md:-translate-y-10 border-4 border-s-bg overflow-hidden">
                      <ImageWithFullScreenZoom
                        className="bg-s-bg w-[60px] h-[60px] md:w-[120px] md:h-[120px] object-cover"
                        src={getIPFSLink(community.logoImageUrl)}
                      />
                    </div>
                    {!isMobile ? (
                      <div className="flex flex-col mt-3">
                        <div
                          className="font-bold start-row gap-x-2 text-[18px] md:text-2xl tracking-wider truncate"
                          onClick={redirectToCommunityPage}
                        >
                          <span>{community?.label || community?.name}</span>
                        </div>
                        <div className="text-[14px] md:text-[16px] start-row space-x-2">
                          <div className="hover:underline cursor-pointer text-s-text">
                            c/{community.name}
                          </div>
                          {community?.verified && (
                            <VerifiedBadge className="w-4 h-4" />
                          )}
                        </div>
                        <div
                          className="flex flex-row items-center pt-0.5 cursor-pointer"
                          onClick={showMembersList}
                        >
                          <BsPeopleFill className="w-4 h-4 mr-1" />
                          <span>{community?.membersCount}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <div className="px-2 start-row gap-x-1 py-1">
                          <div className="hover:underline cursor-pointer text-s-text">
                            c/{community.name}
                          </div>
                          {community?.verified && (
                            <VerifiedBadge className="w-4 h-4" />
                          )}
                        </div>
                        <div
                          className="flex flex-row items-center gap-x-1 px-2 sm:px-4 rounded-[10px] cursor-pointer"
                          onClick={showMembersList}
                        >
                          <BsPeopleFill className="w-4 h-4 mr-1" />
                          <span className="font-bold">
                            {community?.membersCount || 0}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex justify-end items-center gap-1 sm:gap-2 pt-2 mt-2 md:mt-4">
                      <JoinCommunityButton />
                      <span onClick={(e) => e.stopPropagation()}>
                        <OptionsWrapper
                          OptionPopUpModal={() => (
                            <MoreOptionsModal
                              className="z-50"
                              list={[
                                {
                                  label: 'Setting',
                                  onClick: () => {
                                    router.push(`/c/${community.name}/settings`)
                                  },
                                  icon: () => (
                                    <FiSettings className="mr-1.5 w-6 h-6" />
                                  ),
                                  hidden: !isAuth
                                },
                                {
                                  label: 'More Info',
                                  onClick: () => {
                                    setIsDrawerOpen(true)
                                  },
                                  icon: () => (
                                    <FiInfo className="mr-1.5 w-6 h-6" />
                                  ),
                                  hidden: !isMobile
                                },
                                {
                                  label: 'Share',
                                  onClick: shareCommunity,
                                  icon: () => (
                                    <IoIosShareAlt className="mr-1.5 w-6 h-6" />
                                  )
                                }
                              ]}
                            />
                          )}
                          position="left"
                          showOptionsModal={showOptionsModal}
                          setShowOptionsModal={setShowOptionsModal}
                          isDrawerOpen={isExploreDrawerOpen}
                          setIsDrawerOpen={setIsExploreDrawerOpen}
                        >
                          <Tooltip
                            enterDelay={1000}
                            leaveDelay={200}
                            title="More"
                            arrow
                          >
                            <div className="hover:bg-p-btn-hover rounded-md p-1.5 cursor-pointer">
                              <RiMore2Fill className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                          </Tooltip>
                        </OptionsWrapper>
                      </span>
                    </div>
                    {/* create  post button */}
                    {/* {joined && (
                      <button
                        onClick={() => {
                          // select community and open create post pop up
                          selectCommunityForPost(community)
                          showCreatePostPopup()
                        }}
                        className={
                          'start-row w-fit space-x-1 py-1 mt-4 text-xs sm:text-base px-2 sm:px-3 rounded-md text-p-btn bg-s-bg hover:bg-p-btn hover:text-p-btn-text hover:border-bg-p-btn border-[1px] border-p-btn transition-all ease-in-out duration-300'
                        }
                      >
                        <AiOutlinePlus />
                        <div>Post</div>
                      </button>
                    )} */}
                  </div>
                </div>
              </div>

              {isMobile && (
                <>
                  {/* name and description row */}
                  <div className="flex flex-col px-3 mb-2">
                    <p
                      className="font-bold text-[18px] md:text-2xl tracking-wider hover:underline cursor-pointer"
                      onClick={redirectToCommunityPage}
                    >
                      {community?.label || community?.name}
                    </p>
                    <div className="text-[14px] md:text-[16px]">
                      {community.description}
                    </div>
                    {/* {joined && (
                      <CreatePostBar
                        title="Create Post"
                        beforeOpen={() => {
                          selectCommunityForPost(community)
                        }}
                        className="-mb-2 mt-2"
                      />
                    )} */}
                  </div>
                </>
              )}
              {/* bottom drawer for mobile */}
              <BottomDrawerWrapper
                isDrawerOpen={isDrawerOpen}
                setIsDrawerOpen={setIsDrawerOpen}
                showClose
                position="bottom"
              >
                <div className="flex flex-col gap-4 mx-4 mb-4">
                  <h3 className="font-bold text-[20px] self-center">
                    {community?.name}
                  </h3>
                  <div className="flex flex-row gap-1 w-full">
                    <div className="flex flex-col w-full">
                      <div className="relative bg-[#D7D7D7] h-[35px] rounded-[10px] flex flex-row">
                        <div className="flex z-10 self-center justify-self-center w-full justify-center text-white dark:text-p-text text-[14px]">
                          Level {level}
                        </div>
                        <div
                          className="absolute h-full bg-[#9378D8] rounded-[10px] "
                          style={{
                            width: `${calculateBarPercentage(
                              thresholdXP,
                              currentXP
                            )}%`,
                            maxWidth: '100%'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row gap-2 items-center justify-start text-[18px] text-[#687684]">
                    <img
                      src="/createdOnDate.svg"
                      alt="created on date"
                      className="w-5 h-5"
                    />
                    <span>
                      Created{' '}
                      {new Date(community.createdAt)
                        .toDateString()
                        .split(' ')
                        .slice(1)
                        .join(' ')}
                    </span>
                  </div>
                  <div className="flex flex-row gap-2 items-center justify-start text-[18px] text-[#687684]">
                    <img
                      src="/createdByUser.svg"
                      alt="created by user"
                      className="w-5 h-5"
                    />
                    <span>
                      Created by{' '}
                      <span>
                        <Link
                          href={`u/${formatHandle(
                            community?.creatorProfile?.handle
                          )}`}
                        >
                          <span>{`u/${formatHandle(
                            community?.creatorProfile?.handle
                          )}`}</span>
                        </Link>
                      </span>
                    </span>
                  </div>
                </div>
              </BottomDrawerWrapper>
            </div>
          )}
        </>
      )}
      {!community && <div>Loading...</div>}
    </>
  )
}

export default CommunityInfoCard
