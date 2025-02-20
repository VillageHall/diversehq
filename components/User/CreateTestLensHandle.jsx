import React, { useCallback } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import {
  useCreateProfileMutation,
  useCreateSetDefaultProfileTypedDataMutation
} from '../../graphql/generated'
import useSignTypedDataAndBroadcast from '../../lib/useSignTypedDataAndBroadcast'
import PopUpWrapper from '../Common/PopUpWrapper'
import FormTextInput from '../Common/UI/FormTextInput'
import { useNotify } from '../Common/NotifyContext'
import { pollUntilIndexed } from '../../lib/indexer/has-transaction-been-indexed'
import { BigNumber, utils } from 'ethers'
import { usePopUpModal } from '../Common/CustomPopUpProvider'
import { useQueryClient } from '@tanstack/react-query'
import { useLensUserContext } from '../../lib/LensUserContext'

const CreateTestLensHandle = () => {
  const { mutateAsync: createProfile } = useCreateProfileMutation()
  const { mutateAsync: setDefaultProfile } =
    useCreateSetDefaultProfileTypedDataMutation()
  const { error, result, type, signTypedDataAndBroadcast } =
    useSignTypedDataAndBroadcast()
  const { refetch } = useLensUserContext()

  const { notifyError, notifySuccess, notifyInfo } = useNotify()
  const { hideModal } = usePopUpModal()

  const [loading, setLoading] = useState(false)
  const [handle, setHandle] = useState('')

  const queryClient = useQueryClient()

  const profileIdFromResponseResult = async (result) => {
    const logs = result?.txReceipt?.logs
    const topicId = utils.id(
      'ProfileCreated(uint256,address,address,string,string,address,bytes,string,uint256)'
    )
    const profileCreatedLog = logs?.find((l) => l.topics[0] === topicId)
    const profileCreatedEventLog = profileCreatedLog?.topics
    const profileId = utils.defaultAbiCoder.decode(
      ['uint256'],
      profileCreatedEventLog[1]
    )[0]
    return BigNumber.from(profileId).toHexString()
  }

  const checkIfHandleFollowsRules = (handle) => {
    // Handle only supports lower case characters, numbers, - and _. Handle must be minimum of 5 length and maximum of 31 length
    const regex = /^[a-z0-9_-]{5,31}$/
    return regex.test(handle)
  }

  const handleCreateTestLensHandle = async () => {
    if (handle === '') return
    if (!checkIfHandleFollowsRules(handle)) {
      notifyError(
        'Handle must be minimum of 5 length and maximum of 31 length, and only supports lower case characters, numbers, - and _'
      )
      return
    }
    setLoading(true)
    const profileId = await createNewProfile()

    if (!profileId) {
      setLoading(false)
      return
    }

    //make the profile default
    await makeProfileDefault(profileId)
  }

  const createNewProfile = async () => {
    try {
      const createProfileResult = (
        await createProfile({
          request: {
            handle: handle
          }
        })
      ).createProfile

      if (createProfileResult.__typename === 'RelayError') {
        console.error('create profile: failed')
        notifyError('Handle is already taken')
        return null
      }
      const indexedResult = await pollUntilIndexed({
        txHash: createProfileResult.txHash
      })

      if (indexedResult) {
        const profileId = await profileIdFromResponseResult(indexedResult)
        return profileId
      }
    } catch (err) {
      console.log('create profile: failed', err)
      notifyError(
        'An error occurred while creating profile, probably handle is already taken'
      )
      return null
    }
  }

  const makeProfileDefault = async (profileId) => {
    try {
      const data = (
        await setDefaultProfile({
          request: {
            profileId
          }
        })
      ).createSetDefaultProfileTypedData

      console.log('data', data)
      notifyInfo('Check your wallet to confirm, if you have not already')
      signTypedDataAndBroadcast(data.typedData, {
        id: data.id,
        type: 'setDefaultProfile'
      })
    } catch (err) {
      setLoading(false)
      console.error('make profile default: failed', err)
      notifyError('An error occurred while making profile default')
      return
    }
  }

  const onSetDefaultProfileSuccess = async () => {
    setLoading(false)
    notifySuccess('Profile created successfully')
    await queryClient.invalidateQueries({
      queryKey: ['lensUser', 'defaultProfile']
    })
    await queryClient.invalidateQueries({
      queryKey: ['defaultProfile']
    })
    await refetch()
    hideModal()
  }
  useEffect(() => {
    if (result && type === 'setDefaultProfile') {
      onSetDefaultProfileSuccess()
    }
  }, [result, type])

  useEffect(() => {
    if (error) {
      setLoading(false)
      notifyError(error)
    }
  }, [error])

  const onChangeHandle = useCallback((e) => {
    setHandle(e.target.value)
  }, [])
  return (
    <PopUpWrapper
      title="Create Test Lens Handle"
      label="Create"
      onClick={handleCreateTestLensHandle}
      loading={loading}
    >
      <FormTextInput
        label="Handle"
        placeholder="A cool test lens handle"
        value={handle}
        onChange={onChangeHandle}
        required
      />
    </PopUpWrapper>
  )
}

export default CreateTestLensHandle
