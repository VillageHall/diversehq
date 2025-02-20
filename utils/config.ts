import apiEndpoint from '../apiHelper/ApiEndpoint'

export const POST_LIMIT: number = 10
export const COMMENT_LIMIT: number = 10
export const LENS_POST_LIMIT: number = 15
export const LENS_COMMENT_LIMIT: number = 20
export const LENS_NOTIFICATION_LIMIT: number = 15
export const NOTIFICATION_LIMIT: number = 15
export const COMMUNITY_LIMIT: number = 5
export const MAX_CONTENT_LINES: number = 4
export const MAX_CONTENT_LINES_FOR_POST: number = 6
export const LENS_SEARCH_PROFILE_LIMIT: number = 4
export const WHO_WAS_IT_PROFILES_LIMIT: number = 30
export const LensInfuraEndpoint: string = 'https://4everland.io/ipfs/'
export const LENS_INFINITE_SCROLL_THRESHOLD: number = 0.5
export const SEARCH_ITEMS_LIMIT: number = 30

export const apiMode: string = process.env.NEXT_PUBLIC_LENS_API_MODE

export const isMainnet: boolean = apiMode === 'mainnet'
export const HANDLE_PREFIX: string = isMainnet ? 'lens/' : 'test/'
export const HANDLE_SUFFIX: string = isMainnet ? '.lens' : '.test'
export const lensApiEndpoint: string = isMainnet
  ? 'https://api-v2.lens.dev/'
  : 'https://api-v2-mumbai.lens.dev/'

export const DEFAULT_OG_IMAGE = 'https://diversehq.xyz/LogoV3TrimmedWithBG.png'

export const POLYGONSCAN_URL = isMainnet
  ? 'https://polygonscan.com'
  : 'https://mumbai.polygonscan.com'

export const userRoles = {
  ADMIN_USER: 0,
  WHITELISTED_USER: 1,
  NORMAL_USER: 2
}

export const resolveActions = {
  IGNORE: 'IGNORE',
  BAN_USER: 'BAN_USER',
  HIDE_POST: 'HIDE_POST'
}

export const lensCommunityPostsResolveActions = {
  IGNORE: 'IGNORE',
  ALLOW: 'ALLOW'
}

export const notificationTypes = {
  POST: 0,
  COMMENT: 1,
  UPVOTE_POST: 2,
  UPVOTE_COMMENT: 3,
  BAN_USER: 4,
  TIMEOUT_USER: 5,
  BAN_PUBLICATION: 6,
  BAN_COMMENT: 7,
  MODERATOR_ASSIGNED: 8,
  MODERATOR_REMOVED: 9,
  PUBLICATION_REPORT_ACTION_TAKEN: 10,
  UNBAN_USER: 11,
  REVIEW_POST_FOR_LENS_COMMUNITY: 12,
  RESOLVED_POST_FOR_LENS_COMMUNITY: 13,
  NEW_JOINED_COMMUNITY_POST: 14
}

export const sortTypes = {
  LATEST: 'Latest',
  TOP_TODAY: 'Top Today',
  TOP_WEEK: 'Top Week',
  TOP_MONTH: 'Top Month',
  TOP_YEAR: 'Top Year'
}

export const recommendedCommunitiesIds = [
  '63b068ca07a65dd65e5c6687', // Diverse HQ
  '63b1c8298bce8b3e7b295915', // Crypto
  '63b1c9ae675d8d93aaf53f6c', // airdrops
  '63b1bb1318b63498449c1b13', // dank memes
  '63b1c91218b63498449c1b93', // gaming
  '63b1ccdb18b63498449c1bb0' // anime
]

export const DISCORD_INVITE_LINK = 'https://discord.gg/6sRYC5jD58'
export const TWITTER_LINK = 'https://twitter.com/useDiverseHQ'
export const IMAGE_KIT_ENDPOINT = 'https://ik.imagekit.io/kopveel8c' // devenrathodrd account
// export const IMAGE_KIT_ENDPOINT = 'https://ik.imagekit.io/xgrqxy3nw/' // devilopurity
// export const IMAGE_KIT_ENDPOINT = 'https://ik.imagekit.io/wo7aelvvz/' // diversehq

export const XMTP_PREFIX = 'lens.dev/dm'
export const XMTP_ENV = isMainnet ? 'production' : 'dev'
export const MAX_PROFILES_PER_REQUEST = 50
export const MESSAGE_PAGE_LIMIT = 30
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

/** For Publication */

export const supportedMimeTypes: string[] = [
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'image/x-ms-bmp',
  'image/svg+xml',
  'image/webp',
  'video/webm',
  'video/mp4',
  'video/x-m4v',
  'video/ogv',
  'video/ogg',
  'audio/wav',
  'audio/mpeg',
  'audio/ogg'
]

export const SUPPORTED_IMAGE_TYPE: string[] = [
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'image/x-ms-bmp',
  'image/svg+xml',
  'image/webp'
]

export const SUPPORTED_VIDEO_TYPE: string[] = [
  'video/webm',
  'video/mp4',
  'video/x-m4v',
  'video/ogv',
  'video/ogg',
  'video/quicktime'
]

export const SUPPORTED_AUDIO_TYPE: string[] = [
  'audio/wav',
  'audio/mpeg',
  'audio/ogg'
]
/* eslint-disable */

// XP and Level configs
export const baseXP = 200
export const xpMultiplier = 4
export const xpPerMember = 10

// Named transforms
export const AVATAR = 'avatar'
export const COVER = 'cover'
export const ATTACHMENT = 'attachment'

// lens appId and its information
export const infoFromLensAppId = {
  lenster: {
    appId: 'lenster',
    logoLink: 'https://lenster.xyz/logo.svg',
    name: 'Lenster',
    description:
      'Lenster is a decentralized, and permissionless social media app built with Lens Protocol 🌿',
    link: 'https://lenster.xyz'
  },
  orb: {
    appId: 'orb',
    logoLink:
      'https://pbs.twimg.com/profile_images/1554199747560230912/uthjq-0D_400x400.jpg',
    name: 'Orb',
    description: 'Super App for Social Media.',
    link: 'https://orb.ac'
  },
  lenstube: {
    appId: 'lenstube',
    logoLink: 'https://static.lenstube.xyz/images/brand/lenstube.svg',
    name: 'Lenstube',
    description:
      'Decentralized, open-source video-sharing social media platform, built on Lens Protocol.',
    link: 'https://lenstube.xyz'
  },
  'lenstube-bytes': {
    appId: 'lenstube',
    logoLink: 'https://static.lenstube.xyz/images/brand/lenstube.svg',
    name: 'Lenstube',
    description:
      'Decentralized, open-source video-sharing social media platform, built on Lens Protocol.',
    link: 'https://lenstube.xyz'
  },
  phaver: {
    appId: 'phaver',
    logoLink:
      'https://pbs.twimg.com/profile_images/1610386741931741184/JYAM_Y7T_400x400.jpg',
    name: 'Phaver',
    description: 'The Gateway to Web3 Social',
    link: 'https://phaver.com'
  },
  memester: {
    appId: 'memester',
    logoLink:
      'https://pbs.twimg.com/profile_images/1569120124065423361/skbWGFHt_400x400.jpg',
    name: 'Memester',
    description: 'The NFT Meme Platform on LensProtocol',
    link: 'https://memester.xyz'
  },
  wav3s: {
    appId: 'wav3s',
    logoLink:
      'https://pbs.twimg.com/profile_images/1608995874255912961/d2peMxs__400x400.jpg',
    name: 'Wav3s',
    description: 'Your content promoted through web3 social media.',
    link: 'https://wav3s.app/'
  },
  lensport: {
    appId: 'lensport',
    logoLink: 'https://lensport.io/static/media/lensport_icon.e4bdb518.png',
    name: 'Lensport',
    description: 'Discover, collect, and sell amazing posts.',
    link: 'https://lensport.io'
  },
  buttrfly: {
    appId: 'buttrfly',
    logoLink: 'https://buttrfly.app/buttrfly-icon-rounded.png',
    name: 'Buttrfly',
    description: 'Web3 Social Explorer',
    link: 'https://buttrfly.app'
  },
  soclly: {
    appId: 'soclly',
    logoLink:
      'https://pbs.twimg.com/profile_images/1610906791080255500/CptAXIco_400x400.jpg',
    name: 'Soclly',
    description: 'A Decentralized Social Network with a difference.',
    link: 'https://soclly.com'
  },
  chainjet: {
    appId: 'chainjet',
    logoLink:
      'https://pbs.twimg.com/profile_images/1567155757761679361/k_EIJBD5_400x400.jpg',
    name: 'Chainjet',
    description: 'Build web3 automation easily',
    link: 'https://chainjet.io'
  }
}

export const appId = 'diversehq'
export const showNameForThisAppIds = ['diversehq', 'lenstube', 'lenstube-bytes']
export const appLink = 'https://diversehq.xyz'

export const STS_TOKEN_URL = `${apiEndpoint}/ever/sts/token`
export const EVER_REGION = 'us-west-2'
export const EVER_ENDPOINT = 'https://endpoint.4everland.co'

export const DEFAULT_BANNER_URL = 'https://diversehq.xyz/defaultBanner.png'
