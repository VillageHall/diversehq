import React, { useState, useCallback } from 'react'
import { AiOutlineCamera } from 'react-icons/ai'
import { IoPencilSharp } from 'react-icons/io5'
import { putEditCommunity } from '../../../../apiHelper/community'
import { CommunityType } from '../../../../types/community'
import { useNotify } from '../../../Common/NotifyContext'
import FormTextInput from '../../../Common/UI/FormTextInput'
import uploadToIPFS from '../../../../utils/uploadToIPFS'
import getIPFSLink from '../../../User/lib/getIPFSLink'

const CommunityEditSection = ({ community }: { community: CommunityType }) => {
  const [loading, setLoading] = useState(false)
  const [communityBanner, setCommunityBanner] = useState(
    getIPFSLink(community?.bannerImageUrl)
  )
  const [logoImage, setLogoImage] = useState(
    getIPFSLink(community?.logoImageUrl)
  )
  const [communityBannerFile, setCommunityBannerFile] = useState(null)
  const [logoImageFile, setLogoImageFile] = useState(null)
  const [description, setDescription] = useState(community?.description)
  const [label, setLabel] = useState(community?.label)

  const { notifyError, notifySuccess } = useNotify()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    if (!description) {
      setLoading(false)
      notifyError('Please fill all fields')
      return
    }
    try {
      const communityData: CommunityType = {
        description,
        label,
        communityId: community._id
      }
      if (logoImageFile) {
        const { url } = await uploadToIPFS(logoImageFile)
        communityData.logoImageUrl = url
      }
      if (communityBannerFile) {
        // const banner = await uploadFileToIpfs(communityBannerFile)
        const { url } = await uploadToIPFS(communityBannerFile)
        communityData.bannerImageUrl = url
      }
      const res = await putEditCommunity(communityData)
      const resData = await res.json()
      if (res.status !== 200) {
        setLoading(false)
        notifyError(resData.msg)
        return
      }
      setLoading(false)
      notifySuccess('Community has been updated')
    } catch (error) {
      setLoading(false)
      console.log(error)
      notifyError(error.message)
    }
  }

  const onChangeDescription = useCallback((e) => {
    setDescription(e.target.value)
  }, [])

  const handleLogoImageChange = (e) => {
    const filePicked = e.target.files[0]
    if (!filePicked) return
    setLogoImageFile(filePicked)
    setLogoImage(URL.createObjectURL(filePicked))
  }

  const handleCommunityBannerChange = (e) => {
    const filePicked = e.target.files[0]
    if (!filePicked) return
    setCommunityBannerFile(filePicked)
    setCommunityBanner(URL.createObjectURL(filePicked))
  }
  return (
    <div className="p-2 w-full sm:p-3 space-y-2">
      <div className="h-64">
        <label htmlFor="communityBanner">
          <div className="flex h-[200px] rounded-xl border-y border-s-border items-center justify-center cursor-pointer">
            {/* eslint-disable-next-line */}
            {communityBanner && (
              <img
                className="inset-0 object-cover h-full w-full rounded-xl"
                src={communityBanner}
                alt="Header"
              />
            )}
            <div className="absolute flex flex-row">
              <div className="bg-p-bg rounded-full p-2">
                <AiOutlineCamera className="h-8 w-8" />
              </div>
            </div>
          </div>
        </label>

        <div
          className={`flex relative ${
            logoImage ? '' : 'border'
          } h-24 w-24 sm:h-24 sm:w-24 border-p-border rounded-full bottom-12 ml-3 items-center justify-center bg-p-bg z-10 cursor-pointer`}
        >
          {logoImage && (
            <label htmlFor="logoImage">
              {' '}
              <img
                className="rounded-full h-24 w-24 sm:h-24 sm:w-24 object-cover"
                src={logoImage}
                alt="PFP"
              />
            </label>
          )}
          <div className="absolute">
            <label htmlFor="logoImage">
              <div className="bg-p-bg rounded-full p-2 cursor-pointer">
                <AiOutlineCamera className="h-8 w-8 " />
              </div>
            </label>
          </div>
        </div>
      </div>
      <FormTextInput startingLetters="c/" value={community?.name} disabled />
      <FormTextInput
        label="Name"
        value={label}
        placeholder="Community Name"
        onChange={(e) => {
          setLabel(e.target.value)
        }}
        maxLength={60}
      />
      <FormTextInput
        label="Short Description"
        placeholder="Show the world what your community is..."
        value={description}
        onChange={onChangeDescription}
        maxLength={200}
      />
      <input
        type="file"
        id="logoImage"
        placeholder="Commmunity Name"
        accept="image/*"
        onChange={handleLogoImageChange}
        required
        hidden
      />
      <input
        type="file"
        id="communityBanner"
        accept="image/*"
        onChange={handleCommunityBannerChange}
        hidden
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="self-start text-xl font-bold tracking-wide  m-5 px-4 py-2 bg-p-btn text-p-btn-text rounded-lg flex flex-row items-center space-x-2"
      >
        {loading && <div className="h-5 w-5 spinner border-p-btn-text" />}
        {!loading && <IoPencilSharp className="h-5 w-5" />}
        <div>Save</div>
      </button>
    </div>
  )
}

export default CommunityEditSection
