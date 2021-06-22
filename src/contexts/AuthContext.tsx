import { createContext, ReactNode, useEffect, useState } from "react"
import { auth, firebase } from "../services/firebase"

type User = {
    id: string;
    name: string;
    avatar: string;
}
  
type authContextType = {
    user: User | undefined;
    signInWithGoogle: () => Promise<void>;
}

type authContextProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext({} as authContextType)

export function AuthContextProvider(props: authContextProviderProps) {
    const [user, setUser] = useState<User>()

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        if(user) {
          const { displayName, photoURL, uid } = user
      
          if (!photoURL || !displayName) {
            throw new Error("Missing Information from Google account!")
          }
  
          setUser({
            id: uid,
            name: displayName,
            avatar: photoURL
          })
        }
      })
  
      return () => {
        unsubscribe()
      }
    }, [])
  
    async function signInWithGoogle() {
      const provider = new firebase.auth.GoogleAuthProvider()
  
      const result = await auth.signInWithPopup(provider)
    
      if(result.user) {
        const { displayName, photoURL, uid } = result.user
      
        if (!photoURL || !displayName) {
          throw new Error("Missing Information from Google account!")
        }
  
        setUser({
          id: uid,
          name: displayName,
          avatar: photoURL
        })
      }
    }

    return (
        <AuthContext.Provider value={{ user, signInWithGoogle }}>
            {props.children}
        </AuthContext.Provider>
    )
}