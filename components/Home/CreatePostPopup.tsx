import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { AiOutlineDown } from 'react-icons/ai'
import { IoIosArrowBack } from 'react-icons/io'
import { v4 as uuidv4 } from 'uuid'
import { getJoinedCommunitiesApi } from '../../apiHelper/community'
import {
  PublicationContentWarningType,
  PublicationReactionType,
  useAddReactionMutation,
  useCreateMomokaPostTypedDataMutation,
  useCreateMomokaQuoteTypedDataMutation,
  usePostOnMomokaMutation,
  useQuoteOnMomokaMutation
} from '../../graphql/generated'
import { useLensUserContext } from '../../lib/LensUserContext'
import useDASignTypedDataAndBroadcast from '../../lib/useDASignTypedDataAndBroadcast'
import { useCommunityStore } from '../../store/community'
import { usePublicationStore } from '../../store/publication'
import { SUPPORTED_AUDIO_TYPE } from '../../utils/config'
import { usePopUpModal } from '../Common/CustomPopUpProvider'
// import { useDevice } from '../Common/DeviceWrapper'
import { useNotify } from '../Common/NotifyContext'
import OptionsWrapper from '../Common/OptionsWrapper'
import PopUpWrapper from '../Common/PopUpWrapper'
import FilterListWithSearch from '../Common/UI/FilterListWithSearch'
import FormTextInput from '../Common/UI/FormTextInput'
import MoreOptionsModal from '../Common/UI/MoreOptionsModal'
import { useProfile } from '../Common/WalletContext'
import PublicationEditor from '../Lexical/PublicationEditor'
import Attachment from '../Post/Attachment'
import AttachmentRow from '../Post/Create/AttachmentRow'
import useUploadAttachments from '../Post/Create/useUploadAttachments'
import Giphy from '../Post/Giphy'
// import uploadToIPFS from '../../utils/uploadToIPFS'
import {
  getMostPostedLensCommunityIds,
  putAddLensPublication
} from '../../apiHelper/lensPublication'
import { uploadToIpfsInfuraAndGetPath } from '../../utils/utils'
import getIPFSLink from '../User/lib/getIPFSLink'
import usePublicationMetadata from './PostComposer/usePublicationMetadata'
import checkDispatcherPermissions from '../../lib/profile/checkPermission'

const MAX_TITLE_LENGTH = 200

const CreatePostPopup = ({
  startingContent = '',
  quotedPublicationId
}: {
  startingContent?: string
  quotedPublicationId?: string
}) => {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState(startingContent)
  const { user } = useProfile()
  const [loading, setLoading] = useState(false)
  const [joinedCommunities, setJoinedCommunities] = useState([])
  const [loadingJoinedCommunities, setLoadingJoinedCommunities] =
    useState(false)
  const [showCommunityOptions, setShowCommunityOptions] = useState(false)
  const [communityOptionsCoord, setCommunityOptionsCoord] = useState({
    left: '0px',
    top: '0px'
  })
  const { data: lensProfile } = useLensUserContext()
  const [showCollectSettings, setShowCollectSettings] = useState(false)
  const { notifyError, notifyInfo, notifySuccess } = useNotify()
  const { hideModal } = usePopUpModal()
  // const { isMobile } = useDevice()
  const [flair, setFlair] = useState(null)
  const { handleUploadAttachments } = useUploadAttachments()

  const { canUseLensManager } = checkDispatcherPermissions(
    lensProfile?.defaultProfile
  )

  // const { mutateAsync: createPostViaDispatcher } = usePostOnchainMutation()
  // const { mutateAsync: createPostViaSignedTx } =
  //   useCreateOnchainPostTypedDataMutation()
  // const { error, result, type, signTypedDataAndBroadcast } =
  //   useSignTypedDataAndBroadcast(false)
  const { mutateAsync: createPostDAViaDispatcher } = usePostOnMomokaMutation()
  const { mutateAsync: createDAPostTypedData } =
    useCreateMomokaPostTypedDataMutation()
  const { mutateAsync: createQuoteOnMomoka } = useQuoteOnMomokaMutation()
  const { mutateAsync: createQuoteOnMomokaTypedData } =
    useCreateMomokaQuoteTypedDataMutation()
  const { mutateAsync: addReaction } = useAddReactionMutation()
  const {
    loading: daLoading,
    type: daType,
    result: daResult,
    error: daError,
    signDATypedDataAndBroadcast
  } = useDASignTypedDataAndBroadcast()

  const [editor] = useLexicalComposerContext()

  const selectedCommunity = useCommunityStore(
    (state) => state.selectedCommunity
  )
  const selectCommunityForPost = useCommunityStore(
    (state) => state.selectCommunityForPost
  )
  // const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [flairDrawerOpen, setFlairDrawerOpen] = useState(false)
  const [showOptionsModal, setShowOptionsModal] = useState(false)

  const attachments = usePublicationStore((state) => state.attachments)
  const resetAttachments = usePublicationStore(
    (state) => state.resetAttachments
  )
  const addAttachments = usePublicationStore((state) => state.addAttachments)
  const setVideoThumbnail = usePublicationStore(
    (state) => state.setVideoThumbnail
  )
  const getMetadata = usePublicationMetadata()

  const isQuote = Boolean(quotedPublicationId)

  const isUploading = usePublicationStore((state) => state.isUploading)
  const isAudioPublication =
    attachments[0]?.type === 'Audio' ||
    SUPPORTED_AUDIO_TYPE.includes(attachments[0]?.type)

  const getAnimationUrl = () => {
    if (
      attachments.length > 0 &&
      (isAudioPublication || attachments[0]?.type === 'Video')
    ) {
      return attachments[0]?.item
    }
    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    if (!title || title?.trim() === '') {
      notifyError('Please enter a title')
      setLoading(false)
      return
    }
    // }
    try {
      await handleCreateLensPost()
    } catch (e) {
      console.log('error', e)
      notifyError('Error creating post, report to support')
      setLoading(false)
      return
    }
  }

  useEffect(() => {
    if (!editor) return
    if (startingContent) {
      console.log('startingContent', startingContent)

      editor?.update(() => {
        if ($getRoot().getTextContentSize() !== 0) return
        const paragraph = $createParagraphNode()
        const text = $createTextNode(startingContent)
        paragraph.append(text)
        $getRoot().append(paragraph)
      })
    }
  }, [])

  const handleCompletePost = () => {
    setLoading(false)
    resetAttachments()
    setVideoThumbnail({
      url: '',
      type: '',
      uploading: false
    })
    editor?.update(() => {
      $getRoot().clear()
    })
    hideModal()
  }

  // const isEligibleForMultiRecipient = (recipients: Receipient[]): boolean => {
  //   if (!recipients || recipients.length <= 1) return false

  //   // checking if every recipient.recipient is valid eth address
  //   const isValidRecipient = recipients.every((recipient) => {
  //     return isValidEthereumAddress(recipient.recipient)
  //   })

  //   if (!isValidRecipient) return false

  //   // checking if every recipient.split is valid number
  //   const isValidSplit = recipients.every((recipient) => {
  //     return (
  //       !isNaN(Number(recipient.split)) &&
  //       Number(recipient.split) > 0 &&
  //       Number(recipient.split) <= 100
  //     )
  //   })

  //   if (!isValidSplit) return false

  //   // checking if sum of all recipient.split is 100
  //   const sumOfSplit = recipients.reduce((acc, recipient) => {
  //     return acc + Number(recipient.split)
  //   }, 0)

  //   if (sumOfSplit !== 100) return false

  //   return true
  // }

  const handleCreateLensPost = async () => {
    let contentWarning = null

    //todo handle other file types and link content

    if (flair === 'SENSITIVE') {
      contentWarning = PublicationContentWarningType.Sensitive
    } else if (flair === 'NSFW') {
      contentWarning = PublicationContentWarningType.Nsfw
    } else if (flair === 'SPOILER') {
      contentWarning = PublicationContentWarningType.Spoiler
    } else {
      contentWarning = null
    }

    let animationUrl = getAnimationUrl()
    let marketplace = {
      name: title,
      description: title + content?.trim(),
      external_url: 'https://diversehq.xyz'
    }

    if (animationUrl) {
      marketplace['animation_url'] = animationUrl
    }

    const baseMetadata = {
      tags: selectedCommunity?._id ? [selectedCommunity?._id] : [],
      title,
      content:
        `${
          selectedCommunity?.isLensCommunity
            ? `Post by @${lensProfile.defaultProfile.handle} \n`
            : ``
        }` +
        `${title}` +
        '\n' +
        content?.trim(),
      // +
      // `${
      //   !selectedCommunity?.isLensCommunity &&
      //   selectedCommunity?.name &&
      //   (user?.preferences?.appendLink ?? true)
      //     ? `\n ${appLink}/c/${selectedCommunity?.name}`
      //     : ``
      // }${
      //   !selectedCommunity?.isLensCommunity &&
      //   selectedCommunity?.name &&
      //   (user?.preferences?.appendHashtags ?? true)
      //     ? `\n #${selectedCommunity?.name}`
      //     : ``
      // }`,
      marketplace: marketplace
    }

    if (contentWarning) {
      baseMetadata['contentWarning'] = contentWarning
    }

    console.log('baseMetadata', baseMetadata)

    const metadata = getMetadata({ baseMetadata })

    console.log('metadata', metadata)

    // const jsonFile = new File([JSON.stringify(metadata)], 'metadata.json', {
    //   type: 'application/json'
    // })
    // const { url } = await uploadToIPFS(jsonFile)
    const ifpsHash = await uploadToIpfsInfuraAndGetPath(metadata)
    const url = `ipfs://${ifpsHash}`

    console.log('url', url)

    // if (selectedCommunity?.isLensCommunity) {
    //   try {
    //     const res = await submitPostForReview(selectedCommunity?._id, url)
    //     if (res.status === 200) {
    //       notifySuccess('Post submitted for review, You will be tagged in post')
    //       handleCompletePost()
    //     } else if (res.status === 400) {
    //       const resJson = await res.json()
    //       notifyError(resJson.msg)
    //     }
    //     return
    //   } catch (error) {
    //     notifyError('Error submitting post for review')
    //   } finally {
    //     setLoading(false)
    //   }
    //   return
    // }

    // const postForIndexing = {
    //   tempId: metadataId,
    //   communityInfo: selectedCommunity?._id
    //     ? {
    //         _id: selectedCommunity?._id,
    //         name: selectedCommunity?.name,
    //         image: getIPFSLink(selectedCommunity.logoImageUrl)
    //       }
    //     : null,
    //   createdAt: new Date().toISOString(),
    //   hasCollectedByMe: false,
    //   hidden: false,
    //   isGated: false,
    //   metadata: {
    //     ...metadata,
    //     media: attachmentsInput.map((attachment) => ({
    //       original: {
    //         url: attachment.item,
    //         mimeType: attachment.type
    //       }
    //     }))
    //   },
    //   profile: lensProfile?.defaultProfile,
    //   reaction: 'UPVOTE',
    //   stats: {
    //     totalUpvotes: 1,
    //     totalAmountOfCollects: 0,
    //     totalAmountOfComments: 0,
    //     totalDownvotes: 0
    //   }
    // }

    // if no collection then make a data availablity post
    // if (!collectSettings) {
    // const momokaRequest: MomokaPostRequest | MomokaQuoteRequest = {
    //   ...(isQuote && { quoteOn: quotedPublicationId }),
    //   contentURI: url
    // }
    // post as data availability post
    if (canUseLensManager) {
      let dispatcherResult = null

      if (isQuote) {
        dispatcherResult = (
          await createQuoteOnMomoka({
            request: {
              contentURI: url,
              quoteOn: quotedPublicationId
            }
          })
        ).quoteOnMomoka
      } else {
        const createPostonMomoka = await createPostDAViaDispatcher({
          request: {
            contentURI: url
          }
        })
        console.log('createPostonMomoka', createPostonMomoka)
        dispatcherResult = createPostonMomoka.postOnMomoka
      }

      if (
        dispatcherResult.__typename === 'LensProfileManagerRelayError' ||
        !dispatcherResult.id
      ) {
        notifyError(
          dispatcherResult.__typename === 'LensProfileManagerRelayError'
            ? dispatcherResult?.reason
            : 'Something went wrong'
        )
      } else {
        try {
          await addReaction({
            request: {
              for: dispatcherResult.id,
              reaction: PublicationReactionType.Upvote
            }
          })

          if (selectedCommunity?._id) {
            console.log('adding lens publication')
            putAddLensPublication(selectedCommunity._id, dispatcherResult.id)
          }
        } catch (error) {
          console.log(error)
        }

        // // addPost({ txId: dispatcherResult. }, postForIndexing)
        console.log(dispatcherResult)
        router.push(`/p/${dispatcherResult.id}`)
        notifySuccess('Post has been created')
        handleCompletePost()
      }
    } else {
      let typedData = null

      if (isQuote) {
        typedData = (
          await createQuoteOnMomokaTypedData({
            request: {
              contentURI: url,
              quoteOn: quotedPublicationId
            }
          })
        ).createMomokaQuoteTypedData
      } else {
        typedData = (
          await createDAPostTypedData({
            request: {
              contentURI: url
            }
          })
        ).createMomokaPostTypedData
      }

      signDATypedDataAndBroadcast(typedData.typedData, {
        id: typedData.id,
        type: 'createDAPost'
      })
    }
    return
    // }

    // let collectModule = null

    // if (
    //   isEligibleForMultiRecipient(collectSettings?.recipients) &&
    //   collectSettings?.recipients &&
    //   collectSettings?.amount
    // ) {
    //   // create multi recipient collect
    //   collectModule = {
    //     multirecipientFeeCollectModule: {
    //       amount: collectSettings?.amount,
    //       recipients: collectSettings?.recipients,
    //       referralFee: collectSettings?.referralFee,
    //       followerOnly: collectSettings?.followerOnly,
    //       [collectSettings?.collectLimit ? 'collectLimit' : null]:
    //         collectSettings?.collectLimit ?? null,
    //       [collectSettings?.endTimestamp ? 'endTimestamp' : null]:
    //         collectSettings?.endTimestamp ?? null
    //     }
    //   }
    // } else {
    //   // create simple collect module
    //   collectModule = {
    //     simpleCollectModule: {
    //       [collectSettings?.collectLimit ? 'collectLimit' : null]:
    //         collectSettings?.collectLimit ?? null,
    //       followerOnly: collectSettings?.followerOnly,
    //       [collectSettings?.endTimestamp ? 'endTimestamp' : null]:
    //         collectSettings?.endTimestamp ?? null,
    //       [collectSettings?.amount ? 'fee' : null]: collectSettings?.amount
    //         ? {
    //             amount: collectSettings?.amount,
    //             referralFee: collectSettings?.referralFee,
    //             recipient: lensProfile?.defaultProfile?.ownedBy
    //           }
    //         : null
    //     }
    //   }
    // }

    // // Remove null values from the final object
    // collectModule = Object.fromEntries(
    //   Object.entries(collectModule).map(([key, value]) => [
    //     key,
    //     // eslint-disable-next-line
    //     Object.fromEntries(Object.entries(value).filter(([_, v]) => v !== null))
    //   ])
    // )

    // console.log('collectModule', collectModule)

    // const createPostRequest = {
    //   profileId: lensProfile?.defaultProfile?.id,
    //   contentURI: url,
    //   collectModule: collectModule,
    //   referenceModule: {
    //     followerOnlyReferenceModule: false
    //   }
    // }

    // setPostMetadataForIndexing(postForIndexing)

    // // dispatch or broadcast
    // try {
    //   if (lensProfile?.defaultProfile?.dispatcher?.canUseRelay) {
    //     //gasless using dispatcher
    //     const dispatcherResult = (
    //       await createPostViaDispatcher({
    //         request: createPostRequest
    //       })
    //     ).createPostViaDispatcher

    //     setLoading(false)
    //     if (dispatcherResult?.__typename === 'RelayError') {
    //       notifyError(dispatcherResult.reason)
    //     } else {
    //       addPost({ txId: dispatcherResult.txId }, postForIndexing)
    //       handleCompletePost()
    //     }
    //   } else {
    //     //gasless using signed broadcast
    //     const postTypedResult = (
    //       await createPostViaSignedTx({
    //         request: createPostRequest
    //       })
    //     ).createPostTypedData
    //     signTypedDataAndBroadcast(postTypedResult.typedData, {
    //       id: postTypedResult.id,
    //       type: 'createPost'
    //     })
    //   }
    // } catch (e) {
    //   setLoading(false)
    //   console.log('error', e)
    //   notifyError('Error creating post, report to support')
    //   return
    // }
  }

  // useEffect(() => {
  //   if (result && type === 'createPost') {
  //     addPost({ txId: result.txId }, postMetadataForIndexing)
  //     handleCompletePost()
  //   }
  // }, [result, type])

  useEffect(() => {
    const foo = async () => {
      if (daResult && daType === 'createDAPost') {
        await addReaction({
          request: {
            for: daResult.id,
            reaction: PublicationReactionType.Upvote
          }
        })
        if (selectedCommunity?._id) {
          console.log('adding lens publication')
          await putAddLensPublication(selectedCommunity._id, daResult.id)
        }
        notifySuccess('Post has been created')
        router.push(`/p/${daResult.id}`)
        handleCompletePost()
      }
    }

    foo()
  }, [daResult, daType])

  useEffect(() => {
    if (daError) {
      setLoading(false)
      notifyError(daError)
    }
  }, [daError])

  useEffect(() => {
    if (user) {
      getJoinedCommunities()
    }
  }, [user])

  const setGifAttachment = (gif) => {
    const attachment = {
      id: uuidv4(),
      item: gif.images.original.url,
      previewItem: gif.images.original.url,
      type: 'Image',
      mimeType: 'image/gif',
      altTag: gif.title
    }
    // @ts-ignore
    addAttachments([attachment])
  }

  const handleSelect = (community) => {
    setShowCommunityOptions(false)
    selectCommunityForPost(community)
  }

  const getJoinedCommunities = async () => {
    if (!user?.walletAddress) {
      notifyError('I think you are not logged in')
      return
    }
    setLoadingJoinedCommunities(true)
    const response = await getJoinedCommunitiesApi()

    console.log('response', response)

    let mostPostedCommunities = []

    try {
      const res = await getMostPostedLensCommunityIds()

      if (res.status === 200) {
        mostPostedCommunities = await res.json()
      }
    } catch (err) {
      console.log(err)
    }

    // setting the joinedCommunitites with mostPostedCommunities from the localStorage at the top
    // const myLensCommunity = []
    // if (LensCommunity) {
    //   myLensCommunity.push({
    //     _id: LensCommunity?._id,
    //     name: formatHandle(LensCommunity?.Profile?.handle),
    //     logoImageUrl: getAvatar(LensCommunity?.Profile),
    //     isLensCommunity: true
    //   })
    // }

    // const joinedCommunitiesArray = [
    //   ...joinedLensCommunities
    //     .map((community) => ({
    //       _id: community._id,
    //       name: formatHandle(community?.handle),
    //       // @ts-ignore
    //       logoImageUrl: getAvatar(community),
    //       isLensCommunity: true
    //     }))
    //     .filter(
    //       (community) => !myLensCommunity.some((c) => c?._id === community?._id)
    //     ),
    //   // removing the communities in the mostPostedCommunities from the joinedCommunities using communityId
    //   ...response
    // ]

    let sortedCommunities = []

    for (const communityId of mostPostedCommunities) {
      if (response.some((c) => c._id === communityId)) {
        sortedCommunities.push(response.find((c) => c._id === communityId))
      }
    }

    // for (const community of joinedCommunitiesArray) {
    //   if (!sortedCommunities.some((c) => c._id === community._id)) {
    //     sortedCommunities.push(community)
    //   }
    // }

    setJoinedCommunities(sortedCommunities)
    setLoadingJoinedCommunities(false)
  }

  const customOptions = () => {
    return (
      <div className="fixed flex flex-row justify-center items-center z-50 top-0 left-0 no-scrollbar w-full h-full">
        <div className="flex justify-center items-center relative w-full h-full">
          <div
            className={`w-full h-full absolute z-0`}
            onClick={() => {
              setShowCommunityOptions(false)
            }}
          ></div>

          <div
            className={`flex flex-col h-fit absolute z-10 ${
              showCommunityOptions
                ? 'enter-fade-animation'
                : 'exit-fade-animation '
            }`}
            style={communityOptionsCoord}
          >
            <div className="bg-white/50 dark:bg-black/50 backdrop-blur-lg rounded-2xl max-h-[450px] overflow-auto">
              {loadingJoinedCommunities ? (
                <div className="rounded-2xl">
                  <div className="flex flex-row items-center justify-center p-2 m-2">
                    <div className="animate-pulse rounded-full bg-p-bg dark:bg-s-bg w-9 h-9" />
                    <div className="animate-pulse rounded-full bg-p-bg dark:bg-s-bg w-32 h-4 ml-4" />
                  </div>
                  <div className="flex flex-row items-center justify-center p-2 m-2">
                    <div className="animate-pulse rounded-full bg-p-bg dark:bg-s-bg w-9 h-9" />
                    <div className="animate-pulse rounded-full bg-p-bg dark:bg-s-bg w-32 h-4 ml-4" />
                  </div>
                  <div className="flex flex-row items-center justify-center p-2 m-2">
                    <div className="animate-pulse rounded-full bg-p-bg dark:bg-s-bg w-9 h-9" />
                    <div className="animate-pulse rounded-full bg-p-bg dark:bg-s-bg w-32 h-4 ml-4" />
                  </div>
                </div>
              ) : (
                <FilterListWithSearch
                  list={joinedCommunities}
                  type="community"
                  filterParam="name"
                  handleSelect={handleSelect}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const showJoinedCommunities = (e) => {
    if (loading) return
    if (joinedCommunities?.length === 0 && !loadingJoinedCommunities) {
      notifyInfo('Hey, you ! Yes you ! Join some communities first')
      return
    }
    setShowCommunityOptions(true)
    setCommunityOptionsCoord({
      top: e.currentTarget.getBoundingClientRect().bottom + 10 + 'px',
      left: e.currentTarget.getBoundingClientRect().left + 'px'
    })
  }

  const closePopUp = async () => {
    if (loading) return
    handleCompletePost()
  }

  const PopUpModal = () => {
    return (
      // simple modal
      <PopUpWrapper
        title="Create Post"
        onClick={handleSubmit}
        label="POST"
        loading={loading || daLoading}
        isDisabled={title.length === 0 || isUploading}
        hideTopBar={showCollectSettings}
        closePopup={closePopUp}
      >
        <div className="flex flex-row items-center justify-between px-4 z-50">
          {showCollectSettings ? (
            <button
              className="flex flex-row space-x-1 items-center justify-center  hover:bg-s-hover p-1 rounded-full"
              onClick={() => setShowCollectSettings(false)}
            >
              <IoIosArrowBack className="w-6 h-6" />
              <p className="text-p-text ml-4 text-xl">Back</p>
            </button>
          ) : (
            <div className="flex justify-center items-center border border-s-border rounded-full text-p-text w-fit h-[45px] bg-s-bg">
              <button className="" onClick={showJoinedCommunities}>
                {selectedCommunity?._id ? (
                  <div className="flex justify-center items-center p-2">
                    <img
                      src={getIPFSLink(selectedCommunity.logoImageUrl)}
                      className="rounded-full w-10 h-10 object-cover"
                    />
                    <h1 className="ml-2">
                      {selectedCommunity?.isLensCommunity && 'l/'}
                      {selectedCommunity.name}
                    </h1>
                    <AiOutlineDown className="w-4 h-4 mx-1" />
                  </div>
                ) : (
                  <div className="flex flex-row items-center justify-center px-2">
                    <div>Select Community</div>
                    <AiOutlineDown className="w-4 h-4 mx-1" />
                  </div>
                )}
              </button>
            </div>
          )}

          <div
            className={`flex flex-row items-center jusitify-center  ${
              showCollectSettings ? 'hidden' : ''
            }`}
          >
            <OptionsWrapper
              OptionPopUpModal={() => (
                <MoreOptionsModal
                  className="z-50"
                  list={[
                    {
                      label: 'None',
                      onClick: () => {
                        setFlair('None')
                        setShowOptionsModal(false)
                        setFlairDrawerOpen(false)
                      }
                    },
                    {
                      label: 'NSFW',
                      onClick: () => {
                        setFlair(PublicationContentWarningType.Nsfw)
                        setShowOptionsModal(false)
                        setFlairDrawerOpen(false)
                      }
                    },
                    {
                      label: 'Sensitive',
                      onClick: () => {
                        setFlair(PublicationContentWarningType.Sensitive)
                        setShowOptionsModal(false)
                        setFlairDrawerOpen(false)
                      }
                    },
                    {
                      label: 'Spoiler',
                      onClick: () => {
                        setFlair(PublicationContentWarningType.Spoiler)
                        setShowOptionsModal(false)
                        setFlairDrawerOpen(false)
                      }
                    }
                  ]}
                />
              )}
              position="bottom"
              showOptionsModal={showOptionsModal}
              setShowOptionsModal={setShowOptionsModal}
              isDrawerOpen={flairDrawerOpen}
              setIsDrawerOpen={setFlairDrawerOpen}
            >
              <button className="flex items-center hover:cursor-pointer space-x-1 sm:space-x-2 py-1 px-2.5 sm:py-1 sm:px-2.5 rounded-full border border-s-border ">
                <p>{flair ? flair : 'None'}</p>
                <AiOutlineDown className="w-4 h-4 mx-1" />
              </button>
            </OptionsWrapper>
          </div>
        </div>

        {showCommunityOptions && customOptions()}
        {/* <!-- Modal body --> */}
        {!showCollectSettings && (
          <div>
            <FormTextInput
              label="Title"
              placeholder="gib me title"
              maxLength={MAX_TITLE_LENGTH}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
            {/* Rich text editor */}
            <PublicationEditor
              setContent={setContent}
              onPaste={(files) => {
                const file = files[0]
                if (!file) return
                handleUploadAttachments([file])
              }}
            />

            {/* <div className="text-base leading-relaxed m-4">
              {file || gifAttachment ? (
                showAddedFile()
              ) : (
                <label htmlFor="upload-file">
                  <div className="h-32 text-s-text flex flex-col justify-center items-center border border-s-border bg-s-bg rounded-xl">
                    <div>
                      <AiOutlineCamera className="h-8 w-8" />
                    </div>
                    <div>Add Image or Video</div>
                  </div>
                </label>
              )}
            </div> */}
            <div className="px-5">
              <Attachment
                className="w-full"
                publication={{
                  // @ts-ignore
                  quoteOn: {
                    id: quotedPublicationId
                  },
                  content: content
                }}
                newAttachments={attachments}
                isNew
              />
            </div>
            <div className="ml-6 mt-2 flex items-center">
              <AttachmentRow />

              <Giphy setGifAttachment={(gif) => setGifAttachment(gif)} />
              {/* {!selectedCommunity?.isLensCommunity && (
                <Tooltip
                  placement="bottom"
                  enterDelay={1000}
                  leaveDelay={200}
                  title="Collect Setting"
                  arrow
                >
                  <button
                    onClick={() => {
                      // if (!collectSettings) {
                      //   setCollectSettings({
                      //     freeCollectModule: { followerOnly: false }
                      //   })
                      // }
                      if (!isMobile) {
                        setShowCollectSettings(!showCollectSettings)
                        return
                      } else {
                        setIsDrawerOpen(true)
                      }
                    }}
                    disabled={loading}
                    className="rounded-full hover:bg-s-hover active:bg-s-hover p-2 cursor-pointer"
                  >
                    <BsCollection className="w-5 h-5" />
                  </button>
                </Tooltip>
              )} */}

              {/* <PostPreferenceButton disabled={loading} /> */}
            </div>
          </div>
        )}
        <>
          {/* {showCollectSettings && !isMobile ? (
            <CollectSettingsModel
              collectSettings={collectSettings}
              setCollectSettings={setCollectSettings}
            />
          ) : (
            <BottomDrawerWrapper
              isDrawerOpen={isDrawerOpen}
              setIsDrawerOpen={setIsDrawerOpen}
              showClose={true}
              position="bottom"
            >
              <CollectSettingsModel
                collectSettings={collectSettings}
                setCollectSettings={setCollectSettings}
              />
            </BottomDrawerWrapper>
          )} */}
        </>
      </PopUpWrapper>
    )
  }

  return <div className="">{PopUpModal()}</div>
}

export default CreatePostPopup
