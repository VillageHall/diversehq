import React, { useEffect, useState } from 'react'
import { BsCollection } from 'react-icons/bs'
import { RiUserFollowLine } from 'react-icons/ri'
import { useBalance } from 'wagmi'
import {
  CollectModule,
  Profile,
  Publication,
  useApprovedModuleAllowanceAmountQuery
} from '../../../graphql/generated'
import { useLensUserContext } from '../../../lib/LensUserContext'
import { useNotify } from '../../Common/NotifyContext'
import formatHandle from '../../User/lib/formatHandle'
// import PopUpWrapper from '../../Common/PopUpWrapper'
import useLensFollowButton from '../../User/useLensFollowButton'
import AllowanceButton from './AllowanceButton'
import Uniswap from './Uniswap'
import useCollectPublication from './useCollectPublication'
import { useDevice } from '../../Common/DeviceWrapper'

type Props = {
  setIsCollected: any
  setCollectCount: any
  collectModule: CollectModule
  publication: Publication
  author: Profile
  setIsDrawerOpen: any
  setShowOptionsModal: any
  setIsCollecting: any
}
const FeeCollectPopUp = ({
  setIsCollected,
  setCollectCount,
  collectModule,
  publication,
  author,
  setIsDrawerOpen,
  setShowOptionsModal,
  setIsCollecting
}: Props) => {
  if (collectModule.__typename !== 'FeeCollectModuleSettings') return null
  const { data: lensProfile } = useLensUserContext()
  const { collectPublication, isSuccess, loading, error } =
    useCollectPublication(collectModule)
  const { notifySuccess, notifyError }: any = useNotify()
  const [isAllowed, setIsAllowed] = useState(true)
  const { data: allowanceData, isLoading: allowanceLoading } =
    useApprovedModuleAllowanceAmountQuery({
      request: {
        currencies: collectModule.amount.asset.address,
        followModules: [],
        collectModules: [collectModule.type],
        referenceModules: []
      }
    })
  useEffect(() => {
    if (allowanceLoading) return
    if (!allowanceData) return
    setIsAllowed(
      allowanceData?.approvedModuleAllowanceAmount[0].allowance !== '0x00'
    )
  }, [allowanceData])
  useEffect(() => {
    if (!loading && isSuccess) {
      setIsCollected(true)
      setCollectCount((prev: number) => prev + 1)
      notifySuccess('Post has been collected, check your collection!')
      setIsDrawerOpen(false)
      setShowOptionsModal(false)
      setIsCollecting(false)
    }
  }, [loading, isSuccess])

  useEffect(() => {
    if (error) {
      notifyError(error)
      setIsDrawerOpen(false)
      setShowOptionsModal(false)
      setIsCollecting(false)
    }
  }, [error])

  const {
    isFollowedByMe,
    handleFollowProfile,
    loading: followLoading
  } = useLensFollowButton({ profileId: author.id })

  const [hasAmount, setHasAmount] = useState(false)

  const { data: balanceData } = useBalance({
    address: lensProfile?.defaultProfile?.ownedBy,
    token: collectModule?.amount?.asset?.address,
    formatUnits: collectModule?.amount?.asset?.decimals,
    watch: true
  })

  useEffect(() => {
    if (
      balanceData &&
      parseFloat(balanceData?.formatted) <
        parseFloat(collectModule?.amount?.value)
    ) {
      setHasAmount(false)
    } else {
      setHasAmount(true)
    }
  }, [balanceData])

  useEffect(() => {
    if (loading) {
      setIsCollecting(true)
    }
  }, [loading])

  const { isDesktop } = useDevice()
  return (
    <>
      {isDesktop ? (
        <div className="w-fit py-1 bg-s-bg px-3 h-full flex flex-row items-center justify-center space-x-6  border border-s-border rounded-xl shadow shadow-s-border">
          <div className="flex flex-col  justify-center items-center mt-2">
            {collectModule.followerOnly && !isFollowedByMe && (
              <div className="flex flex-row items-center justify-center space-x-6 py-3 ">
                <p className="font-medium text-base ml-3.5 ">
                  Follow to Collect
                </p>
                <button
                  onClick={() => {
                    handleFollowProfile(author.id)
                  }}
                  className="bg-p-btn text-p-btn-text rounded-md px-4 py-1 text-sm font-semibold"
                >
                  {followLoading ? (
                    <div className="flex flex-row justify-center items-center space-x-2">
                      <div className="h-4 w-4 border-p-text spinner" />
                      <p>Follow</p>
                    </div>
                  ) : author.isFollowing ? (
                    'Follow back'
                  ) : (
                    <div className="flex flex-row justify-center items-center space-x-1 ">
                      <RiUserFollowLine /> <p>Follow</p>
                    </div>
                  )}
                </button>
              </div>
            )}

            {allowanceLoading && (
              <div className="text-p-text flex flex-row space-x-1">
                <div className="h-4 w-4 border-p-text spinner" />
                <p>Loading Allowance</p>
              </div>
            )}

            {isAllowed && hasAmount ? (
              <>
                <div
                  className={`m-1 ${
                    collectModule.followerOnly && !isFollowedByMe && 'hidden'
                  }`}
                >
                  <p className="text-p-text font-medium text-base">
                    Required {' :'}{' '}
                    <span className="text-s-text">
                      {' '}
                      {collectModule?.amount?.value}{' '}
                      {collectModule.amount?.asset?.symbol}{' '}
                    </span>{' '}
                  </p>
                  <p className="text-p-text font-medium text-base">
                    In Wallet:{' '}
                    <span className="text-s-text">
                      {parseFloat(
                        balanceData?.formatted ? balanceData?.formatted : '0'
                      )}{' '}
                      {collectModule?.amount?.asset?.symbol}
                    </span>
                  </p>
                </div>
              </>
            ) : (
              <>
                {!isAllowed && (
                  <div className="space-x-6 flex flex-row justify-center items-center  ">
                    <p className="text-base font-medium ml-3.5">
                      {' '}
                      Allow to collect
                    </p>
                    <AllowanceButton
                      module={allowanceData?.approvedModuleAllowanceAmount[0]}
                      allowed={isAllowed}
                      setAllowed={setIsAllowed}
                    />
                  </div>
                )}
                {!hasAmount && isAllowed && (
                  <div className="text-p-text font-medium text-base space-y-1 flex flex-col py-1 px-3">
                    <p className="text-p-text font-medium text-base">
                      Required {' :'}{' '}
                      <span className="text-s-text">
                        {' '}
                        {collectModule?.amount?.value}{' '}
                        {collectModule.amount?.asset?.symbol}{' '}
                      </span>{' '}
                    </p>
                    <span className="">
                      In Wallet :{' '}
                      <span className="text-s-text">
                        {parseFloat(
                          balanceData?.formatted ? balanceData?.formatted : '0'
                        )}{' '}
                        {collectModule?.amount?.asset?.symbol}
                      </span>
                    </span>
                    <Uniswap module={collectModule} />
                  </div>
                )}
              </>
            )}
          </div>

          {isAllowed && hasAmount && (
            <button
              onClick={async (e) => {
                e.stopPropagation()
                await collectPublication(publication.id)
              }}
              disabled={
                loading ||
                (collectModule.__typename === 'FeeCollectModuleSettings' &&
                  collectModule.followerOnly &&
                  !isFollowedByMe)
              }
              className={`bg-p-btn text-p-btn-text rounded-md py-1.5 px-4 text-center flex font-semibold justify-center items-center h-10 self-center ${
                !isAllowed || (collectModule.followerOnly && !isFollowedByMe)
                  ? 'hidden'
                  : ''
              } `}
            >
              {loading ? (
                <div className="flex flex-row justify-center items-center space-x-2">
                  <div className="h-4 w-4 border-p-text spinner" />
                  <p>Collecting</p>
                </div>
              ) : (
                <div className="flex flex-row items-center space-x-2">
                  <BsCollection className="w-5 h-5" />
                  <p>Collect</p>
                </div>
              )}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center flex-col justify-center text-p-text  text-medium font-semibold ">
            {collectModule.followerOnly && !isFollowedByMe && (
              <>
                <div className="px-4 w-full  mb-1 mt-1 ">
                  <p className="ml-1">
                    {' '}
                    Follow u/{formatHandle(author.handle)} To Collect the Post
                  </p>
                  <button
                    onClick={() => {
                      handleFollowProfile(author.id)
                    }}
                    className="bg-p-btn rounded-full text-center flex font-semibold text-p-btn-text py-1 justify-center items-center w-full text-xl"
                  >
                    {followLoading ? (
                      <div className="flex flex-row justify-center items-center space-x-2 text-p-btn-text">
                        <div className="h-4 w-4 border-p-text spinner" />
                        <p>Following..</p>
                      </div>
                    ) : author.isFollowing ? (
                      'Follow back'
                    ) : (
                      <div className="flex flex-row justify-center items-center space-x-2 text-p-btn-text">
                        <RiUserFollowLine />{' '}
                        <p>Follow u/{formatHandle(author.handle)}</p>
                      </div>
                    )}
                  </button>
                </div>
              </>
            )}
            {allowanceLoading && (
              <div className="text-p-text flex flex-row Items-center">
                <div className="h-4 w-4 border-p-text spinner" />
                <p className="text-p-text ">Allowance loading</p>
              </div>
            )}

            {isAllowed && hasAmount ? (
              <div
                className={`text-p-text text-medium font-semibold mb-2 ${
                  collectModule.followerOnly && !isFollowedByMe && 'hidden'
                }`}
              >
                In Wallet: {parseFloat(balanceData?.formatted)}{' '}
                {collectModule?.amount?.asset?.symbol}
              </div>
            ) : (
              <>
                {!hasAmount && (
                  <>
                    <p className="mb-1">
                      Collect for {parseFloat(collectModule?.amount?.value)}
                      {''} {collectModule?.amount?.asset?.symbol}
                    </p>
                    <div className="text-p-text font-medium text-center justify-center mb-2">
                      In Wallet {parseFloat(balanceData?.formatted)}{' '}
                      {collectModule?.amount?.asset?.symbol}
                    </div>
                  </>
                )}
                {!isAllowed && (
                  <div className="px-4 w-full  mb-1 mt-1">
                    <AllowanceButton
                      module={allowanceData?.approvedModuleAllowanceAmount[0]}
                      allowed={isAllowed}
                      setAllowed={setIsAllowed}
                    />
                  </div>
                )}
              </>
            )}
            {isAllowed && hasAmount && (
              <div
                className={`px-4 w-full  mb-1 mt-1 ${
                  !isAllowed || (collectModule.followerOnly && !isFollowedByMe)
                    ? 'hidden'
                    : ''
                }`}
              >
                <button
                  onClick={async (e) => {
                    e.stopPropagation()
                    await collectPublication(publication.id)
                  }}
                  disabled={
                    loading ||
                    (collectModule.__typename === 'FeeCollectModuleSettings' &&
                      collectModule.followerOnly &&
                      !isFollowedByMe)
                  }
                  className={`bg-p-btn rounded-full text-center flex font-semibold text-p-text py-1 justify-center items-center w-full text-xl${
                    !isAllowed ||
                    (collectModule.followerOnly && !isFollowedByMe)
                      ? 'hidden'
                      : ''
                  }}`}
                >
                  <div className='className="flex flex-row justify-center items-center space-x-2"'>
                    {loading ? (
                      <div className="flex flex-row justify-center text-p-btn-text items-center space-x-2">
                        <div className="h-4 w-4 border-p-text spinner" />
                        <div>Collecting...</div>
                      </div>
                    ) : (
                      <div className="flex flex-row items-center space-x-2 text-p-btn-text">
                        <BsCollection className="w-5 h-5" />
                        <p>
                          Collect For {parseFloat(collectModule?.amount?.value)}
                          {''} {collectModule?.amount?.asset?.symbol}
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}

export default FeeCollectPopUp
