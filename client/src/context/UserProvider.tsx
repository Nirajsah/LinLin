import React, { ReactNode, useContext } from 'react'

interface User {
  chainId: string
  owner: string
  port: string
  isLoggedIn: boolean
}
export const UserContext = React.createContext<any | null>(null)
export default function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = React.useState<User>({
    chainId: '',
    owner: '',
    port: '',
    isLoggedIn: false,
  })

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const chainIdFromStorage = window.sessionStorage.getItem('chainId') ?? ''
      const ownerFromStorage = window.sessionStorage.getItem('owner') ?? ''
      const portFromStorage = window.sessionStorage.getItem('port') ?? ''
      if (
        chainIdFromStorage !== '' &&
        ownerFromStorage !== '' &&
        portFromStorage !== ''
      ) {
        user.chainId = chainIdFromStorage
        user.owner = ownerFromStorage
        user.port = portFromStorage
        user.isLoggedIn = true
      }
    }
    if (user.chainId !== '') {
      window.sessionStorage.setItem('chainId', user.chainId)
      window.sessionStorage.setItem('owner', user.owner)
      window.sessionStorage.setItem('port', user.port)
    }
  }, [user])

  // React.useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     const chainIdFromStorage = window.sessionStorage.getItem('chainId') ?? ''
  //     const ownerFromStorage = window.sessionStorage.getItem('owner') ?? ''
  //     const portFromStorage = window.sessionStorage.getItem('port') ?? ''
  //     if (
  //       chainIdFromStorage !== '' &&
  //       ownerFromStorage !== '' &&
  //       portFromStorage !== ''
  //     ) {
  //       user.chainId = chainIdFromStorage
  //       user.owner = ownerFromStorage
  //       user.port = portFromStorage
  //       user.isLoggedIn = true
  //     }
  //   }
  // }, [])

  const contextValue = {
    user,
    setUser,
  }
  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  )
}

export const useUser = () => {
  const userContext = useContext(UserContext)
  if (!userContext) {
    return {}
  }
  return userContext
}
