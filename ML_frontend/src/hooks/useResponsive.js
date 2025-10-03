import { useState, useEffect } from 'react'

// Breakpoints based on Tailwind CSS defaults
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

/**
 * Hook to detect if the current screen size matches a specific breakpoint
 * @param {string} breakpoint - The breakpoint to check (sm, md, lg, xl, 2xl)
 * @returns {boolean} - Whether the screen size matches the breakpoint
 */
export const useBreakpoint = (breakpoint) => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${breakpoints[breakpoint]}px)`)
    
    const handleChange = (e) => setMatches(e.matches)
    
    // Set initial value
    setMatches(mediaQuery.matches)
    
    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [breakpoint])

  return matches
}

/**
 * Hook to get the current screen size category
 * @returns {string} - Current screen size (xs, sm, md, lg, xl, 2xl)
 */
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState('xs')

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      
      if (width >= breakpoints['2xl']) {
        setScreenSize('2xl')
      } else if (width >= breakpoints.xl) {
        setScreenSize('xl')
      } else if (width >= breakpoints.lg) {
        setScreenSize('lg')
      } else if (width >= breakpoints.md) {
        setScreenSize('md')
      } else if (width >= breakpoints.sm) {
        setScreenSize('sm')
      } else {
        setScreenSize('xs')
      }
    }

    // Set initial value
    checkScreenSize()

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return screenSize
}

/**
 * Hook to detect if user is on mobile device
 * @returns {boolean} - Whether the user is on mobile
 */
export const useIsMobile = () => {
  return !useBreakpoint('lg')
}

/**
 * Hook to detect if user is on tablet device
 * @returns {boolean} - Whether the user is on tablet
 */
export const useIsTablet = () => {
  const isMd = useBreakpoint('md')
  const isLg = useBreakpoint('lg')
  return isMd && !isLg
}

/**
 * Hook to detect if user is on desktop
 * @returns {boolean} - Whether the user is on desktop
 */
export const useIsDesktop = () => {
  return useBreakpoint('lg')
}

/**
 * Hook to get viewport dimensions
 * @returns {object} - Object with width and height
 */
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return viewport
}

/**
 * Hook to detect device orientation
 * @returns {string} - Current orientation (portrait or landscape)
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState('portrait')

  useEffect(() => {
    const handleOrientationChange = () => {
      // Check if screen API is available
      if (screen?.orientation) {
        setOrientation(screen.orientation.angle % 180 === 0 ? 'portrait' : 'landscape')
      } else {
        // Fallback to window dimensions
        setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
      }
    }

    // Set initial value
    handleOrientationChange()

    // Listen for orientation changes
    if (screen?.orientation) {
      screen.orientation.addEventListener('change', handleOrientationChange)
    } else {
      window.addEventListener('orientationchange', handleOrientationChange)
      window.addEventListener('resize', handleOrientationChange)
    }

    return () => {
      if (screen?.orientation) {
        screen.orientation.removeEventListener('change', handleOrientationChange)
      } else {
        window.removeEventListener('orientationchange', handleOrientationChange)
        window.removeEventListener('resize', handleOrientationChange)
      }
    }
  }, [])

  return orientation
}

/**
 * Hook to detect if user prefers reduced motion
 * @returns {boolean} - Whether user prefers reduced motion
 */
export const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    const handleChange = (e) => setPrefersReducedMotion(e.matches)
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches)
    
    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  return prefersReducedMotion
}

/**
 * Hook to get responsive grid columns count
 * @param {object} breakpointCols - Object defining columns for each breakpoint
 * @returns {number} - Number of columns for current screen size
 */
export const useResponsiveColumns = (breakpointCols = {
  xs: 1,
  sm: 2,
  md: 2,
  lg: 3,
  xl: 4,
  '2xl': 4
}) => {
  const screenSize = useScreenSize()
  return breakpointCols[screenSize] || breakpointCols.xs
}

/**
 * Hook to detect touch device
 * @returns {boolean} - Whether the device supports touch
 */
export const useIsTouch = () => {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
      )
    }

    checkTouch()
  }, [])

  return isTouch
}

/**
 * Custom hook to get device type with more specific categorization
 * @returns {string} - Device type (mobile, tablet, desktop, large-desktop)
 */
export const useDeviceType = () => {
  const screenSize = useScreenSize()
  const isTouch = useIsTouch()

  if (screenSize === 'xs' || screenSize === 'sm') {
    return 'mobile'
  } else if (screenSize === 'md' && isTouch) {
    return 'tablet'
  } else if (screenSize === 'md' || screenSize === 'lg') {
    return 'desktop'
  } else {
    return 'large-desktop'
  }
}