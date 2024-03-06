import { UserDTO } from "@dtos/userDTO";
import { api } from "@services/api";
import { storageAuthTokenSabe } from "@storage/storageAuthToken";
import { storageUserGet, storageUserRemove, storageUserSave } from "@storage/storageUser";
import { ReactNode, createContext, useEffect, useState } from "react";

export type AuthContextDataProps = {
    user: UserDTO;
    isLoadingUserStorageData: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

type AuthContextProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps);

export function AuthContextProvider({ children }: AuthContextProviderProps) { //tem que ser assim, pois é esperado a recepção de um objeto com a chave children; por isso, se passarmos children como ReactNode não vai dar certo, mas não é errado do ponto de vista lógico, uma vez que children é um tipo que aceitar qualquer coisa renderizavel na arvore de elementos React. 

    const [user, setUser] = useState<UserDTO>({} as UserDTO) //estado que ficara em nosso contexto, para manipulação e re-renderização a qualquer tempo
    const [token, setToken] = useState("");
    const [isLoadingUserStorageData, setIsLoadingUserStorageData] = useState(true);

    async function storageUserAndToken(userData: UserDTO, token: string) {
        try {
            setIsLoadingUserStorageData(true);

            setToken(token);
            setUser(userData);
            await storageUserSave(userData);
            await storageAuthTokenSabe(token);
        } catch (error) {
            throw error;
        } finally {
            setIsLoadingUserStorageData(false);
        }

    }

    async function signIn(email: string, password: string) { //ao inves de mandar setUser pra outra tela, a gente centraliza a lógica toda aqui nesse contexto, mandando o signIn (setUser() fica dentro do signIn()) apenas.
        try {
            const { data } = await api.post("/sessions", {
                email,
                password
            });

            if (data.user && data.token) {
                storageUserAndToken(data.user, data.token);
            }
        } catch (error) {
            throw error;
        }

    }

    async function signOut() {
        try {
            setIsLoadingUserStorageData(true)
            setUser({} as UserDTO);
            await storageUserRemove();
        } catch (error) {
            throw error;
        } finally {
            setIsLoadingUserStorageData(false);
        }

    }

    async function loadUserData() { //será carregada sempre que reiniciarmos o APP, realimentará todos os nossos estados e renderizações serão todas feitas novamente
        try {
            const userLogged = await storageUserGet();
            if (userLogged) {
                setUser(userLogged);
            }
        } catch (error) {
            throw error;
        } finally {
            setIsLoadingUserStorageData(false);
        }

    }

    useEffect(() => {
        loadUserData();
    }, [])

    return (
        <AuthContext.Provider value={{
            user,
            signIn, //usar estado pra aproveitar a estrutura de renderização
            signOut,
            isLoadingUserStorageData
        }}>
            {children}
        </AuthContext.Provider>
    )
}