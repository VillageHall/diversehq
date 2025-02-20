import React, { memo, useEffect, useState } from 'react'
import '../styles/globals.css'
import MasterWrapper from '../components/Common/MasterWrapper'
import Script from 'next/script'
import { DefaultSeo } from 'next-seo'
import MainLayout from '../components/Home/MainLayout'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useRef } from 'react'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
import { appLink, sortTypes } from '../utils/config'
import { useCommonStore } from '../store/common'
TimeAgo.addDefaultLocale(en)

interface MyAppProps {
  Component: React.FC<any>
  pageProps: any
  isMobileView: boolean
}

interface RetainedComponent {
  // eslint-disable-next-line no-undef
  component: JSX.Element
  scrollPos: number
}

const ROUTES_TO_RETAIN = [
  '/',
  `/?sort=${sortTypes.LATEST.replace(' ', '+')}`,
  `/?sort=${sortTypes.TOP_TODAY.replace(' ', '+')}`,
  `/?sort=${sortTypes.TOP_WEEK.replace(' ', '+')}`,
  `/?sort=${sortTypes.TOP_MONTH.replace(' ', '+')}`,
  `/?sort=${sortTypes.TOP_YEAR.replace(' ', '+')}`,
  '/feed/all',
  `/feed/all?sort=${sortTypes.LATEST.replace(' ', '+')}`,
  `/feed/all?sort=${sortTypes.TOP_TODAY.replace(' ', '+')}`,
  `/feed/all?sort=${sortTypes.TOP_WEEK.replace(' ', '+')}`,
  `/feed/all?sort=${sortTypes.TOP_MONTH.replace(' ', '+')}`,
  `/feed/all?sort=${sortTypes.TOP_YEAR.replace(' ', '+')}`,
  `/feed/foryou`,
  `/feed/foryou?sort=${sortTypes.LATEST.replace(' ', '+')}`,
  `/feed/foryou?sort=${sortTypes.TOP_TODAY.replace(' ', '+')}`,
  `/feed/foryou?sort=${sortTypes.TOP_WEEK.replace(' ', '+')}`,
  `/feed/foryou?sort=${sortTypes.TOP_MONTH.replace(' ', '+')}`,
  `/feed/foryou?sort=${sortTypes.TOP_YEAR.replace(' ', '+')}`,
  `/feed/offchain`,
  '/feed/timeline'
]

function MyApp({ Component, pageProps, isMobileView }: MyAppProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const retainedComponents = useRef<{ [path: string]: RetainedComponent }>({})
  const isRetainableRoute = ROUTES_TO_RETAIN.includes(router.asPath)
  const increaseRouteChanged = useCommonStore(
    (state) => state.increaseNumberOfRoutesChanged
  )

  useEffect(() => {
    document.cookie = 'isClient=true; path=/'
  }, [])

  // Add Component to retainedComponents if we haven't got it already
  if (isRetainableRoute && !retainedComponents.current[router.asPath]) {
    const MemoComponent = memo(Component)
    retainedComponents.current[router.asPath] = {
      component: <MemoComponent {...pageProps} />,
      scrollPos: 0
    }
  }

  // Save the scroll position of current page before leaving
  const handleRouteChangeStart = () => {
    setIsLoading(true)
    if (isRetainableRoute) {
      retainedComponents.current[router.asPath].scrollPos = window.scrollY
    }
  }

  // code for loading on route change
  useEffect(() => {
    router.events.on('routeChangeStart', handleRouteChangeStart)
    router.events.on('routeChangeComplete', () => {
      setIsLoading(false)
      increaseRouteChanged()
    })
    router.events.on('routeChangeError', () => {
      setIsLoading(false)
    })
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart)
    }
  }, [router.asPath])

  // Scroll to the saved position when we load a retained component
  useEffect(() => {
    if (isRetainableRoute && !isLoading) {
      window.scrollTo(0, retainedComponents.current[router.asPath].scrollPos)
    }
  }, [Component, pageProps, isLoading])

  return (
    <>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png"></link>
        <meta name="twitter:creator" content="@useDiverseHQ" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* @ts-ignore */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro&display=swap"
          rel="stylesheet"
        ></link>
      </Head>

      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
      />
      <Script id="google-analytics-script" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
        `}
      </Script>
      <script
        defer
        data-domain="diversehq.xyz,lensverse.web"
        src="https://plausible.io/js/script.js"
      ></script>
      <Script
        defer
        data-domain="diversehq.xyz,lensverse.web"
        src="https://plausible.io/js/script.js"
      ></Script>
      <DefaultSeo
        title="DiverseHQ"
        openGraph={{
          type: 'website',
          locale: 'en_IE',
          url: appLink,
          siteName: 'DiverseHQ'
        }}
        twitter={{
          handle: '@useDiverseHQ',
          cardType: 'summary_large_image'
        }}
      />
      <MasterWrapper>
        <MainLayout isLoading={isLoading} isMobileView={isMobileView}>
          <>
            <div>
              {Object.entries(retainedComponents.current).map(([path, c]) => {
                return (
                  <div
                    key={path}
                    style={{
                      display: router.asPath === path ? 'block' : 'none'
                    }}
                  >
                    {c.component}
                  </div>
                )
              })}
            </div>
            {!isRetainableRoute && <Component {...pageProps} />}
          </>
        </MainLayout>
      </MasterWrapper>
    </>
  )
}

MyApp.getInitialProps = async ({ ctx }) => {
  // check is isMobile
  let isMobileView = (
    ctx.req ? ctx.req.headers['user-agent'] : navigator.userAgent
  ).match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i)
  //Returning the isMobileView as a prop to the component for further use.
  return {
    isMobileView: Boolean(isMobileView)
  }
}

export default MyApp
