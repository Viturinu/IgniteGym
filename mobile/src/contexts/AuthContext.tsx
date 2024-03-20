import { UserDTO } from "@dtos/UserDTO";
import { api } from "@services/api";
import { storageAuthTokenGet, storageAuthTokenRemove, storageAuthTokenSave } from "@storage/storageAuthToken";
import { storageUserGet, storageUserRemove, storageUserSave } from "@storage/storageUser";
import { ReactNode, createContext, useEffect, useState } from "react";

export type AuthContextDataProps = {
    user: UserDTO;
    isLoadingUserStorageData: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    updateUserProfile: (userUpdated: UserDTO) => Promise<void>;
}

type AuthContextProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps);

export function AuthContextProvider({ children }: AuthContextProviderProps) { //tem que ser assim, pois é esperado a recepção de um objeto com a chave children; por isso, se passarmos children como ReactNode não vai dar certo, mas não é errado do ponto de vista lógico, uma vez que children é um tipo que aceitar qualquer coisa renderizavel na arvore de elementos React. 

    const [user, setUser] = useState<UserDTO>({} as UserDTO) //estado que ficara em nosso contexto, para manipulação e re-renderização a qualquer tempo
    const [isLoadingUserStorageData, setIsLoadingUserStorageData] = useState(true); //por isso no signin não colocamos como true desde o inicio, pois ela já é inicializada como true

    async function signIn(email: string, password: string) { //ao inves de mandar setUser pra outra tela, a gente centraliza a lógica toda aqui nesse contexto, mandando o signIn (setUser() fica dentro do signIn()) apenas.
        try {
            const { data } = await api.post("/sessions", { //chama API pra buscar as informações
                email,
                password
            });

            if (data.user && data.token && data.refresh_token) { //check se voltou os resultados de usuario, token e refresh_token de usuário

                setIsLoadingUserStorageData(true);
                await storageUserAndTokenSave(data.user, data.token, data.refresh_token); //salva os dados no AsyncStorage
                await userAndTokenUpdate(data.user, data.token); //salva as variáveis nos estados
            }
        } catch (error) {
            throw error;
        } finally {
            setIsLoadingUserStorageData(false);
        }

    }

    async function signOut() {
        try {
            setIsLoadingUserStorageData(true)
            //Atualiza os estados pra vazios
            setUser({} as UserDTO);
            //Remove do AsyncStorage os dados de usuário e token de usuário
            await storageAuthTokenRemove(); //excluindo do Async Storage
            await storageUserRemove(); //excluindo do Async Storage
        } catch (error) {
            throw error;
        } finally {
            setIsLoadingUserStorageData(false);
        }

    }

    async function userAndTokenUpdate(userData: UserDTO, token: string) { //vai atualizar os estados e cabeçalho de requisições da aplicação tanto na reinicialização quanto no login ()
        //took out try catch cause it is just an update info according to teacher
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;//definindo o headers com a recuperação do api.post
        setUser(userData); //definindo o estado com a recuperação do api.post
    }

    async function updateUserProfile(userUpdate: UserDTO) { //pra atualizar no handleUserPhotoSelected() e no handleUserUpdate()
        try {
            setUser(userUpdate);
            await storageUserSave(userUpdate);
        } catch (error) {
            throw error;
        }
    }

    async function storageUserAndTokenSave(userData: UserDTO, token: string, refresh_token: string) { //vai salvar no AsyncStorage pra persistir os dados no mobile
        try {
            setIsLoadingUserStorageData(true);
            await storageUserSave(userData); //gravando no Async
            await storageAuthTokenSave({ token, refresh_token }); //gravando no Async -> frufru na minha opiniao; podia ser feito aqui mesmo;
        } catch (error) {
            throw error;
        } finally {
            setIsLoadingUserStorageData(false);
        }
    }

    async function loadUserData() { //será carregada sempre que reiniciarmos o APP, realimentará todos os nossos estados e renderizações serão todas feitas novamente
        try {
            setIsLoadingUserStorageData(true);

            const userLogged = await storageUserGet(); //busca informações de usuário, na reinicialização do app ou reabertura, pois useEffect chama loadUserData()
            const { token } = await storageAuthTokenGet(); //busca token de usuário, na reinicialização do app ou reabertura, pois useEffect chama loadUserData()
            if (token && userLogged) { //confere se chegou algo aqui nessas variáveis
                userAndTokenUpdate(user, token); //se chegou ele vai atualizar os estados (não precisa escrever no AsyncStorage, pois ele buscou de lá mesmo, do AsyncStorage)
            }
        } catch (error) {
            throw error;
        } finally {
            setIsLoadingUserStorageData(false);
        }

    }

    useEffect(() => {
        loadUserData();
    }, []);
    useEffect(() => {
        const subscribe = api.registerInterceptTokenManager(signOut); //aqui temos acesso a função de signOut, lá no api.ts nós não temos; portanto, passamos ela aqui no AuthContext. Aqui acontece a execução do interceptor;
        return () => {
            subscribe(); //No React, quando você usa o useEffect, você pode retornar uma função que será executada quando o componente for desmontado, o que é conhecido como uma "função de limpeza" ou "cleanup function". Essa função de limpeza é opcional e é usada para limpar quaisquer efeitos secundários gerados pelo código dentro do useEffect antes que o componente seja removido do DOM.
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            signIn, //usar estado pra aproveitar a estrutura de renderização
            signOut,
            isLoadingUserStorageData,
            updateUserProfile
        }}>
            {children}
        </AuthContext.Provider>
    )
}