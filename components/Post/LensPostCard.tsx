import Link from 'next/link'
import { useEffect, useState } from 'react'
import ReactTimeAgo from 'react-time-ago'
import {
  Comment,
  FeedItem,
  PublicationReactionType,
  useAddReactionMutation,
  useHidePublicationMutation,
  useRemoveReactionMutation
} from '../../graphql/generated'
// import { FaRegComment, FaRegCommentDots } from 'react-icons/fa'
import { useRouter } from 'next/router'
import { useLensUserContext } from '../../lib/LensUserContext'
import { appId, appLink, showNameForThisAppIds } from '../../utils/config'
import { useNotify } from '../Common/NotifyContext'
import ImageWithPulsingLoader from '../Common/UI/ImageWithPulsingLoader'
// import VideoWithAutoPause from '../Common/UI/VideoWithAutoPause'
import { Tooltip } from '@mui/material'
import clsx from 'clsx'
import { AiOutlineRetweet } from 'react-icons/ai'
import { HiOutlineTrash } from 'react-icons/hi'
import { IoIosFlag, IoIosShareAlt } from 'react-icons/io'
import { RiMore2Fill } from 'react-icons/ri'
import { TiArrowBack } from 'react-icons/ti'
import { deleteLensPublication } from '../../apiHelper/lensPublication'
import { postWithCommunityInfoType } from '../../types/post'
import { modalType, usePopUpModal } from '../Common/CustomPopUpProvider'
import { useDevice } from '../Common/DeviceWrapper'
import OptionsWrapper from '../Common/OptionsWrapper'
import CenteredDot from '../Common/UI/CenteredDot'
import VerifiedBadge from '../Common/UI/Icon/VerifiedBadge'
import MoreOptionsModal from '../Common/UI/MoreOptionsModal'
import useJoinCommunityButton from '../Community/hook/useJoinCommunityButton'
import Markup from '../Lexical/Markup'
import formatHandle from '../User/lib/formatHandle'
import getAvatar from '../User/lib/getAvatar'
import getIPFSLink from '../User/lib/getIPFSLink'
import useLensFollowButton from '../User/useLensFollowButton'
import Attachment from './Attachment'
// import LensCollectButton from './Collect/LensCollectButton'
import LensCommentCard from './LensComments/LensCommentCard'
import MirrorButton from './MirrorButton'
import { getAllMentionsHandlFromContent } from './PostPageMentionsColumn'
import PostShareButton from './PostShareButton'
import ReportPopUp from './Report/ReportPopUp'
import { getContent } from './getContent'
import WhoCollectedPublicationPopUp from './whoWasIt/WhoCollectedPublicationPopUp'
import WhoMirroredPublicatitonPopUp from './whoWasIt/WhoMirroredPublicatitonPopUp'
import WhoReactedPublicationPopup from './whoWasIt/WhoReactedPublicationPopup'
import getPublicationData from '../../lib/post/getPublicationData'

//sample url https://lens.infura-ipfs.io/ipfs/QmUrfgfcoa7yeHefGCsX9RoxbfpZ1eiASQwp5TnCSsguNA

interface Props {
  post: postWithCommunityInfoType
  isAlone?: boolean
  feedItem?: FeedItem
}

// post?.isLensCommunityPost makes sure that the post is a post from a lens community

const LensPostCard = ({ post, isAlone = false, feedItem }: Props) => {
  const { isMobile } = useDevice()
  const { notifyInfo } = useNotify()
  const { showModal } = usePopUpModal()
  const [reaction, setReaction] = useState(post?.operations?.hasReacted)
  // const [upvoteCount, setUpvoteCount] = useState(post?.stats.reactions)
  // const [downvoteCount, setDownvoteCount] = useState(post?.stats.totalDownvotes)
  const [voteCount, setVoteCount] = useState(post?.stats?.reactions)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [showOptionsModal, setShowOptionsModal] = useState(false)
  const [postInfo, setPostInfo] = useState<postWithCommunityInfoType>(post)
  const { JoinCommunityButton } = useJoinCommunityButton({
    id: postInfo?.communityInfo?._id,
    showJoined: false
  })
  const filteredAttachments =
    getPublicationData(post?.metadata)?.attachments || []

  //update stats if post is updated
  useEffect(() => {
    setPostInfo(post)
    setReaction(post?.operations?.hasReacted)
  }, [post])

  const { mutateAsync: addReaction } = useAddReactionMutation()
  const { mutateAsync: removeReaction } = useRemoveReactionMutation()
  const { isSignedIn, hasProfile, data: lensProfile } = useLensUserContext()
  const [isAuthor, setIsAuthor] = useState(
    lensProfile?.defaultProfile?.id === post?.by?.id
  )

  useEffect(() => {
    if (!post || !lensProfile) return
    setIsAuthor(lensProfile?.defaultProfile?.id === post?.by?.id)
  }, [post, lensProfile])

  const { mutateAsync: removePost } = useHidePublicationMutation()
  const { FollowButton } = useLensFollowButton(
    {
      forProfileId: post?.by?.id
    },
    'join'
  )

  const handleUpvote = async () => {
    if (reaction) {
      try {
        if (!isSignedIn || !hasProfile) {
          notifyInfo('How about loging in lens, first?')
          return
        }

        await removeReaction({
          request: {
            for: post.id,
            reaction: PublicationReactionType.Upvote
          }
        })
        setReaction(null)
        setVoteCount(voteCount - 1)
        return
      } catch (error) {
        console.log(error)
      }
    }
    try {
      if (!isSignedIn || !hasProfile) {
        notifyInfo('How about loging in lens, first?')
        return
      }

      setReaction(true)
      // if (reaction === ReactionTypes.Downvote) {
      //   setDownvoteCount(downvoteCount - 1)
      //   setUpvoteCount(upvoteCount + 1)
      // } else {
      setVoteCount(voteCount + 1)
      // }
      await addReaction({
        request: {
          for: post.id,
          reaction: PublicationReactionType.Upvote
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  // const handleDownvote = async () => {
  //   if (reaction) {
  //     try {
  //       if (!isSignedIn || !hasProfile) {
  //         notifyInfo('How about loging in lens, first?')
  //         return
  //       }
  //       await removeReaction({
  //         request: {
  //           for: post.id,
  //           reaction: PublicationReactionType.Upvote
  //         }
  //       })
  //       setReaction(null)
  //       setVoteCount(voteCount - 2)
  //       return
  //     } catch (error) {
  //       console.log(error)
  //     }
  //   }
  //   try {
  //     if (!isSignedIn || !hasProfile) {
  //       notifyInfo('How about loging in lens, first?')
  //       return
  //     }
  //     setReaction(false)
  //     if (reaction === ReactionTypes.Upvote) {
  //       setUpvoteCount(upvoteCount - 1)
  //       setDownvoteCount(downvoteCount + 1)
  //     } else {
  //       setDownvoteCount(downvoteCount + 1)
  //     }
  //     await addReaction({
  //       request: {
  //         profileId: lensProfile.defaultProfile.id,
  //         publicationId: post.id,
  //         reaction: ReactionTypes.Downvote
  //       }
  //     })
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }
  const router = useRouter()
  const [showMore, setShowMore] = useState(
    postInfo?.metadata?.content?.length > 400 && router.pathname !== '/p/[id]'
  )

  useEffect(() => {
    setShowMore(
      postInfo?.metadata?.content?.length > 400 && router.pathname !== '/p/[id]'
    )
  }, [postInfo])

  const handleDeletePost = async () => {
    try {
      await removePost({
        request: {
          for: post?.id
        }
      })
      await deleteLensPublication(post?.id)
    } catch (error) {
      console.log(error)
      window.location.reload()
    } finally {
      window.location.reload()
    }
  }

  const isBlur =
    !router.pathname.startsWith('/p') && postInfo?.metadata?.contentWarning

  const sharePost = () => {
    if (navigator.share) {
      navigator.share({
        url: `${appLink}/p/${postInfo.id}`
      })
    } else {
      notifyInfo('Sharing is not supported on your device')
    }
  }

  const handleReportPost = () => {
    if (!isSignedIn) {
      notifyInfo('How about loging in lens, first?')
      return
    }
    showModal({
      component: (
        <ReportPopUp
          publicationId={postInfo?.id}
          communityId={postInfo?.metadata?.tags[0]}
        />
      ),
      type: modalType.normal
    })
  }

  const showReactedByPopUp = () => {
    showModal({
      component: <WhoReactedPublicationPopup publicationId={postInfo?.id} />,
      type: modalType.normal
    })
  }

  const showCollectedByPopUp = () => {
    showModal({
      component: <WhoCollectedPublicationPopUp publicationId={postInfo?.id} />,
      type: modalType.normal
    })
  }

  const showMirroredByPopUp = () => {
    showModal({
      component: <WhoMirroredPublicatitonPopUp publicationId={postInfo?.id} />,
      type: modalType.normal
    })
  }

  let content = getContent(postInfo)

  if (postInfo?.originalMirrorPublication?.isHidden) {
    return <div>Mirror is hidden</div>
  }

  if (!postInfo) return null

  const getCommentsToShow = () => {
    let comments = []

    const isProfileAlreadyAdded = (comment: Comment) => {
      return comments.find((c) => c.by.id === comment.by.id)
    }

    for (const comment of feedItem?.comments || []) {
      if (comments.length >= 3) break
      if (isProfileAlreadyAdded(comment)) continue
      comments.push(comment)
    }

    if (comments.length === 1 && comments[0].by.id === postInfo?.by?.id) {
      comments = []
    }
    return comments
  }

  const commentsToShow = getCommentsToShow()

  const filteredAsset = getPublicationData(postInfo?.metadata)?.asset

  return (
    <>
      <div
        className={clsx(
          'sm:px-5 noSelect flex flex-col w-full pt-4 pb-2 sm:pb-0 sm:pt-3 bg-s-bg hover:bg-s-bg-hover sm:pb-2 border-b-[1px] border-[#eee] dark:border-p-border cursor-pointer',
          (router.pathname.startsWith('/p') || isAlone) &&
            `${
              isAlone
                ? 'rounded-2xl border-[1px] border-s-border overflow-hidden mb-1.5'
                : 'sm:my-3 sm:mb-3'
            } sm:rounded-2xl sm:border-[1px] sm:border-s-border`
        )}
        onClick={() => {
          if (isAlone || !router.pathname.startsWith('/p')) {
            router.push(`/p/${postInfo.id}`)
            return
          }
        }}
      >
        {/* top row */}
        {postInfo?.mirroredBy ? (
          <div
            className="flex flex-row w-full space-x-1 items-center pl-4 md:pl-1 mb-1 text-xs text-s-text"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <AiOutlineRetweet className="w-4 h-4 pr-0.5" />
            <Link href={`/u/${formatHandle(postInfo?.mirroredBy?.handle)}`}>
              <div className="hover:underline">
                {`u/${formatHandle(postInfo?.mirroredBy?.handle)}`}{' '}
              </div>
            </Link>
            <span className="pl-0.5">{'mirrored'}</span>
          </div>
        ) : (
          <>
            {feedItem?.mirrors.length > 0 && commentsToShow?.length === 0 && (
              <div
                className="flex flex-row w-full space-x-1 items-center pl-4 md:pl-1 mb-1 text-xs text-s-text"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <AiOutlineRetweet className="w-4 h-4 pr-0.5" />
                <Link
                  href={`/u/${formatHandle(feedItem?.mirrors[0]?.by?.handle)}`}
                >
                  <div className="hover:underline">
                    {`u/${formatHandle(feedItem?.mirrors[0]?.by?.handle)}`}{' '}
                  </div>
                </Link>
                {feedItem?.mirrors?.length - 1 > 0 && (
                  <span className="pl-0.5">{`& ${
                    feedItem?.mirrors?.length - 1
                  } other${
                    feedItem?.mirrors?.length - 1 > 1 ? 's' : ''
                  } you know`}</span>
                )}
                <span className="pl-0.5">{'mirrored'}</span>
              </div>
            )}
          </>
        )}

        {
          // @ts-ignore
          postInfo?.__typename === 'Comment' && (
            <span
              onClick={(e) => {
                e.stopPropagation()
              }}
              className="sm:pl-0 pl-3"
            >
              <Link
                // @ts-ignore
                href={`/p/${postInfo?.commentOn?.id}`}
                className="bg-s-hover rounded-md px-2 py-0.5 text-xs w-fit mb-1.5 start-row"
              >
                <TiArrowBack className="w-3 h-3 mr-1" />
                <span className="">Go to main post</span>
              </Link>
            </span>
          )
        }
        <div className="px-3 sm:px-0 flex flex-row items-center justify-between mb-1  w-full">
          <>
            <div className="flex flex-row w-full items-center">
              <div onClick={(e) => e.stopPropagation()} className="sm:pr-0.5">
                <Link
                  href={
                    postInfo?.communityInfo?._id
                      ? postInfo?.isLensCommunityPost
                        ? `/l/${formatHandle(postInfo?.by?.handle)}`
                        : `/c/${postInfo?.communityInfo?.name}`
                      : `/u/${formatHandle(postInfo?.by?.handle)}`
                  }
                >
                  <ImageWithPulsingLoader
                    src={
                      postInfo?.isLensCommunityPost || !postInfo?.communityInfo
                        ? getAvatar(postInfo?.by)
                        : getIPFSLink(postInfo?.communityInfo?.logoImageUrl) ??
                          '/defaultBanner.png'
                    }
                    className={clsx(
                      'h-10 w-10 object-cover',
                      postInfo?.isLensCommunityPost ||
                        postInfo?.communityInfo?.logoImageUrl
                        ? 'rounded-lg'
                        : 'rounded-full'
                    )}
                  />
                </Link>
              </div>
              <div className="flex flex-col justify-between items-start text-p-text h-full">
                <div onClick={(e) => e.stopPropagation()} className="start-row">
                  <Link
                    href={
                      postInfo?.communityInfo?._id
                        ? postInfo?.isLensCommunityPost
                          ? `/l/${formatHandle(postInfo?.by?.handle)}`
                          : `/c/${postInfo?.communityInfo?.name}`
                        : `/u/${formatHandle(postInfo?.by?.handle)}`
                    }
                  >
                    <div className="pl-2 max-w-[300px] sm:max-w-lg font-bold text-sm sm:text-base hover:cursor-pointer hover:underline truncate">
                      {postInfo?.isLensCommunityPost
                        ? `l/${formatHandle(postInfo?.by?.handle)}`
                        : postInfo?.communityInfo?.name ??
                          postInfo?.by?.metadata?.displayName}
                    </div>
                  </Link>
                  {postInfo?.communityInfo?.verified && (
                    <VerifiedBadge className="w-3 h-3 sm:w-4 sm:h-4  ml-1" />
                  )}
                </div>
                <div className="flex flex-row items-center justify-start pl-2">
                  <div onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-row items-center justify-center text-s-text text-xs sm:text-sm">
                      {/* {postInfo?.communityInfo && (
                          <p className="pl-1.5 font-normal">{' posted by '}</p>
                        )} */}
                      {postInfo?.communityInfo &&
                        !postInfo?.isLensCommunityPost && (
                          <div className="pr-1.5">
                            <ImageWithPulsingLoader
                              src={getAvatar(postInfo?.by)}
                              className="h-4 w-4 rounded-full object-cover"
                            />
                          </div>
                        )}
                      <Link
                        href={
                          postInfo?.isLensCommunityPost
                            ? // @ts-ignore
                              `/u/${formatHandle({
                                // @ts-ignore
                                fullHandle: getAllMentionsHandlFromContent(
                                  postInfo?.metadata?.content
                                )[0]
                              })}`
                            : `/u/${formatHandle(postInfo?.by?.handle)}`
                        }
                        passHref
                      >
                        <div className="font-normal hover:cursor-pointer hover:underline">
                          {postInfo?.isLensCommunityPost
                            ? // @ts-ignore
                              `/u/${formatHandle({
                                // @ts-ignore
                                fullHandle: getAllMentionsHandlFromContent(
                                  postInfo?.metadata?.content
                                )[0]
                              })}`
                            : `u/${formatHandle(postInfo?.by?.handle)}`}
                        </div>
                      </Link>
                    </div>
                  </div>
                  <div className="mx-1">
                    <CenteredDot />
                  </div>
                  <div>
                    {postInfo?.createdAt && (
                      <div className="text-xs sm:text-sm text-s-text">
                        <ReactTimeAgo
                          timeStyle="twitter"
                          date={new Date(postInfo.createdAt)}
                          locale="en-US"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
          {/* )} */}
          <span onClick={(e) => e.stopPropagation()}>
            <div className="sm:mr-5 flex flex-row items-center">
              {!router.pathname.startsWith('/c/') &&
                !router.pathname.startsWith('/l/') &&
                postInfo?.communityInfo?._id && (
                  <>
                    {postInfo?.isLensCommunityPost ? (
                      <FollowButton hideIfFollow={true} />
                    ) : (
                      <JoinCommunityButton />
                    )}
                  </>
                )}
              <OptionsWrapper
                OptionPopUpModal={() => (
                  <MoreOptionsModal
                    className="z-50"
                    list={[
                      {
                        label: 'Share Post',
                        onClick: async () => {
                          sharePost()
                          setShowOptionsModal(false)
                          setIsDrawerOpen(false)
                        },
                        icon: () => (
                          <IoIosShareAlt className="mr-1.5 w-6 h-6" />
                        ),
                        hidden: !isMobile
                      },
                      {
                        label: 'Delete Post',
                        onClick: async () => {
                          await handleDeletePost()
                          setShowOptionsModal(false)
                          setIsDrawerOpen(false)
                        },
                        icon: () => (
                          <HiOutlineTrash className="mr-1.5 w-6 h-6" />
                        ),
                        hidden: !isAuthor
                      },
                      {
                        label: 'Report',
                        onClick: async () => {
                          handleReportPost()
                          setShowOptionsModal(false)
                          setIsDrawerOpen(false)
                        },
                        icon: () => <IoIosFlag className="mr-1.5 w-6 h-6" />
                      }
                    ]}
                  />
                )}
                position="left"
                showOptionsModal={showOptionsModal}
                setShowOptionsModal={setShowOptionsModal}
                isDrawerOpen={isDrawerOpen}
                setIsDrawerOpen={setIsDrawerOpen}
              >
                <Tooltip enterDelay={1000} leaveDelay={200} title="More" arrow>
                  <div className="active:bg-s-hover sm:hover:bg-s-hover rounded-md p-1 cursor-pointer">
                    <RiMore2Fill className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </Tooltip>
              </OptionsWrapper>
            </div>
          </span>
        </div>

        <div className="flex flex-row w-full">
          <>
            {!isMobile && !isAlone && (
              <div className="flex flex-col items-center w-[42px] pt-2 shrink-0" />
              // <div className="flex flex-col items-center w-[40px] pt-2 shrink-0">
              //   <Tooltip
              //     enterDelay={1000}
              //     leaveDelay={200}
              //     title="Upvote"
              //     arrow
              //     placement="left"
              //   >
              //     <button
              //       onClick={(e) => {
              //         e.stopPropagation()
              //         handleUpvote()
              //       }}
              //       className="active:bg-s-hover sm:hover:bg-s-hover rounded-md py-1 cursor-pointer"
              //     >
              //       <img
              //         //  onClick={liked ? handleUnLike : handleLike}
              //         src={reaction ? '/UpvotedFilled.svg' : '/upvoteGray.svg'}
              //         className="w-5 h-5"
              //       />
              //     </button>
              //   </Tooltip>
              //   <div className="font-bold leading-5 text-sm">{voteCount}</div>
              //   {/* <Tooltip
              //   enterDelay={1000}
              //   leaveDelay={200}
              //   title="Downvote"
              //   arrow
              //   placement="left"
              // >
              //   <button
              //     onClick={(e) => {
              //       e.stopPropagation()
              //       handleDownvote()
              //     }}
              //     className="active:bg-s-hover sm:hover:bg-s-hover rounded-md py-1 cursor-pointer"
              //   >
              //     <img
              //       src={
              //         reaction === ReactionTypes.Downvote
              //           ? '/DownvotedFilled.svg'
              //           : '/downvoteGray.svg'
              //       }
              //       className="w-4 h-4"
              //     />
              //   </button>
              // </Tooltip> */}
              // </div>
            )}
          </>

          {/* main content */}
          <div
            className={clsx(
              'flex flex-col w-full justify-between ',
              !isAlone && 'min-h-[76px]'
            )}
          >
            <div className="flex flex-col">
              <div className="mb-2 px-4 sm:pl-2 ">
                {!router.pathname.startsWith('/p') ? (
                  <>
                    <div className="flex flex-row">
                      {postInfo?.metadata?.marketplace?.name &&
                        showNameForThisAppIds.includes(
                          postInfo?.metadata?.appId
                        ) &&
                        // @ts-ignore
                        postInfo?.__typename !== 'Comment' && (
                          <Markup
                            className={`whitespace-pre-wrap break-words text-base sm:text-lg font-semibold w-full`}
                          >
                            {/* remove title text from content */}

                            {postInfo?.metadata?.marketplace?.name}
                          </Markup>
                        )}
                      {postInfo?.metadata?.contentWarning && (
                        <div
                          className={`border ${
                            postInfo?.metadata?.contentWarning === 'NSFW'
                              ? 'border-red-500 text-red-500'
                              : postInfo?.metadata?.contentWarning ===
                                'SENSITIVE'
                              ? 'border-yellow-500 text-yellow-500'
                              : 'border-blue-500 text-blue-500'
                          } rounded-full px-2 py-0.5 h-fit text-xs`}
                        >
                          {postInfo?.metadata?.contentWarning}
                        </div>
                      )}
                    </div>
                    {(!!content || postInfo?.metadata?.appId !== appId) && (
                      <div
                        className={`${
                          showMore ? 'h-[100px] sm:h-[150px]' : ''
                        } sm:max-w-[550px] overflow-hidden break-words`}
                      >
                        <Markup
                          className={`${
                            showMore ? 'line-clamp-5' : ''
                          } linkify whitespace-pre-wrap break-words text-sm sm:text-base`}
                        >
                          {content}
                        </Markup>
                      </div>
                    )}
                    {showMore && (
                      <Link href={`/p/${postInfo?.id}`}>
                        <div className="text-blue-400 text-sm sm:text-base">
                          Show more
                        </div>
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex flex-row">
                      {postInfo?.metadata?.marketplace?.name &&
                        // @ts-ignore
                        postInfo?.__typename !== 'Comment' &&
                        showNameForThisAppIds.includes(
                          postInfo?.metadata.appId
                        ) && (
                          <Markup
                            className={`whitespace-pre-wrap break-words font-semibold text-base sm:text-lg w-full`}
                          >
                            {/* remove title text from content */}

                            {postInfo?.metadata?.marketplace?.name}
                          </Markup>
                        )}
                      {postInfo?.metadata?.contentWarning && (
                        <div
                          className={`border ${
                            postInfo?.metadata?.contentWarning === 'NSFW'
                              ? 'border-red-500 text-red-500'
                              : postInfo?.metadata?.contentWarning ===
                                'SENSITIVE'
                              ? 'border-yellow-500 text-yellow-500'
                              : 'border-blue-500 text-blue-500'
                          } rounded-full px-2 py-0.5 h-fit text-xs `}
                        >
                          {postInfo?.metadata?.contentWarning}
                        </div>
                      )}
                    </div>
                    {(!!content || postInfo?.metadata.appId !== appId) && (
                      <div
                        className={`${
                          showMore ? 'h-[150px]' : ''
                        } sm:max-w-[550px] overflow-hidden break-words`}
                      >
                        <Markup
                          className={`${
                            showMore ? 'line-clamp-5' : ''
                          } linkify whitespace-pre-wrap break-words text sm:text-base`}
                        >
                          {content}
                        </Markup>
                      </div>
                    )}
                    {showMore && (
                      <span onClick={(e) => e.stopPropagation()}>
                        <Link href={`/p/${postInfo?.id}`}>
                          <div className="text-blue-400 text-sm sm:text-base">
                            Show more
                          </div>
                        </Link>
                      </span>
                    )}
                  </>
                )}
              </div>
              <div
                className={`w-full sm:px-2.5 sm:pb-1 ${
                  isBlur ? 'blur-xl' : ''
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                <Attachment
                  publication={postInfo}
                  isAlone={isAlone}
                  attachments={filteredAttachments}
                  className={clsx(
                    router.pathname.startsWith('/p')
                      ? 'max-h-screen'
                      : 'max-h-[600px]',
                    'w-full'
                  )}
                  asset={filteredAsset}
                />
              </div>
            </div>

            {/* bottom row */}
            {!isAlone && (
              <>
                {router.pathname.startsWith('/p') && (
                  <div className="flex flex-row text-sm items-center text-p-text px-3 sm:mx-2 sm:px-2 py-2 justify-between sm:justify-start sm:space-x-12 border-t-[1px] border-b-[1px] border-[#eee] sm:mt-2 sm:mb-2 dark:border-p-border">
                    <div
                      className="flex flex-row gap-1 text-s-text cursor-pointer"
                      onClick={showReactedByPopUp}
                    >
                      <span className="font-semibold text-p-text">
                        {voteCount}
                      </span>
                      <span>upvotes</span>
                    </div>
                    <div className="flex flex-row gap-1 text-s-text ">
                      <span className="font-semibold text-p-text">
                        {postInfo?.stats?.comments}
                      </span>
                      <span>comments</span>
                    </div>
                    <div
                      onClick={showCollectedByPopUp}
                      className="flex flex-row gap-1 text-s-text cursor-pointer"
                    >
                      <span className="font-semibold text-p-text ">
                        {postInfo?.stats?.countOpenActions}
                      </span>
                      <span>collects</span>
                    </div>
                    <div
                      onClick={showMirroredByPopUp}
                      className="flex flex-row gap-1 text-s-text cursor-pointer"
                    >
                      <span className="font-semibold text-p-text">
                        {postInfo?.stats?.mirrors}
                      </span>
                      <span>mirrors</span>
                    </div>
                  </div>
                )}

                <div
                  className={clsx(
                    'text-p-text flex flex-row items-center px-3 sm:px-2 pt-1 justify-between sm:justify-start sm:space-x-12 sm:pb-2'
                    // isMobile
                    //   ? ' justify-between'
                    //   : clsx(
                    //       postInfo?.collectModule?.__typename ===
                    //         'FreeCollectModuleSettings' ||
                    //         postInfo?.collectModule?.__typename ===
                    //           'FeeCollectModuleSettings'
                    //         ? 'justify-between'
                    //         : 'justify-start space-x-24'
                    //     )
                  )}
                >
                  <Tooltip
                    enterDelay={1000}
                    leaveDelay={200}
                    title="Upvote"
                    arrow
                  >
                    <div
                      className="flex flex-row items-center gap-x-2 active:bg-s-hover sm:hover:bg-s-hover active:bg-s-hover cursor-pointer rounded-md py-1 px-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUpvote()
                      }}
                    >
                      <img
                        src={
                          reaction ? '/UpvotedFilled.svg' : '/upvoteGray.svg'
                        }
                        className="w-4 h-4"
                      />
                      <div className="font-medium text-[#687684]">
                        {voteCount}
                      </div>
                      {/* <Tooltip
                        enterDelay={1000}
                        leaveDelay={200}
                        title="Downvote"
                        arrow
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownvote()
                          }}
                          className="active:bg-s-hover sm:hover:bg-s-hover active:bg-s-hover rounded-md py-1.5 cursor-pointer"
                        >
                          <img
                            src={
                              reaction === PublicationReactionType.Downvote
                                ? '/DownvotedFilled.svg'
                                : '/downvoteGray.svg'
                            }
                            className="w-4 h-4"
                          />
                        </button>
                      </Tooltip> */}
                    </div>
                  </Tooltip>

                  <Tooltip
                    enterDelay={1000}
                    leaveDelay={200}
                    title="Comment"
                    arrow
                  >
                    <span onClick={(e) => e.stopPropagation()}>
                      <Link href={`/p/${postInfo.id}`} passHref>
                        <div className="flex flex-row items-center cursor-pointer active:bg-s-hover sm:hover:bg-s-hover active:bg-s-hover rounded-md px-2 py-1.5 font-medium">
                          <img
                            src="/comment.svg"
                            alt="Comment"
                            className="w-4 h-4 mr-2"
                          />
                          {(!router.pathname.startsWith('/p') || isAlone) && (
                            <span className="text-[#687684]">
                              {postInfo?.stats?.comments}
                            </span>
                          )}
                        </div>
                      </Link>
                    </span>
                  </Tooltip>

                  <span onClick={(e) => e.stopPropagation()}>
                    <MirrorButton postInfo={postInfo} isAlone={isAlone} />
                  </span>
                  {/* {postInfo?.collectModule?.__typename !==
                    'RevertCollectModuleSettings' && (
                    <span onClick={(e) => e.stopPropagation()}>
                      <LensCollectButton publication={postInfo} />
                    </span>
                  )} */}

                  {/* {(!isMobile ||
                    (isMobile &&
                      postInfo?.collectModule?.__typename ===
                        'RevertCollectModuleSettings')) && ( */}
                  <span onClick={(e) => e.stopPropagation()}>
                    <PostShareButton
                      url={`${appLink}/p/${postInfo?.id}`}
                      text={postInfo?.metadata?.marketplace?.name}
                    />
                  </span>
                  {/* )} */}
                </div>
              </>
            )}
            {commentsToShow.length > 0 && (
              <div className="sm:pl-0 pl-3">
                {commentsToShow.map((comment) => {
                  return (
                    <LensCommentCard
                      key={comment.id}
                      hideBottomRow
                      comment={comment}
                      level={isMobile ? 3 : 6}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default LensPostCard
