type KakaoNamespace = typeof window.kakao

let loaderPromise: Promise<KakaoNamespace | null> | null = null

export function loadKakaoMaps(): Promise<KakaoNamespace | null> {
  if (loaderPromise) return loaderPromise

  loaderPromise = new Promise(resolve => {
    if (typeof window === 'undefined') {
      console.error('[kakaoMaps] Browser environment required.')
      loaderPromise = null
      resolve(null)
      return
    }

    if (window.kakao?.maps) {
      resolve(window.kakao as KakaoNamespace)
      return
    }

    const appKey = import.meta.env.VITE_KAKAO_JS_KEY
    if (!appKey) {
      console.error('[kakaoMaps] Missing VITE_KAKAO_JS_KEY.')
      loaderPromise = null
      resolve(null)
      return
    }

    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`
    script.async = true
    script.onload = () => {
      if (!window.kakao?.maps) {
        console.error('[kakaoMaps] Kakao SDK failed to expose maps namespace.')
        loaderPromise = null
        resolve(null)
        return
      }
      window.kakao.maps.load(() => resolve(window.kakao as KakaoNamespace))
    }
    script.onerror = event => {
      console.error('[kakaoMaps] Failed to load Kakao SDK script.', event)
      loaderPromise = null
      resolve(null)
    }
    document.head.appendChild(script)
  })

  return loaderPromise
}
