import { UserDTO } from "@dtos/userDTO";
import { api } from "@services/api";
import { storageAuthTokenGet, storageAuthTokenRemove, storageAuthTokenSave } from "@storage/storageAuthToken";
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

    async function signIn(email: string, password: string) { //ao inves de mandar setUser pra outra tela, a gente centraliza a lógica toda aqui nesse contexto, mandando o signIn (setUser() fica dentro do signIn()) apenas.
        try {
            const { data } = await api.post("/sessions", { //chama API pra buscar as informações
                email,
                password
            });

            if (data.user && data.token) { //check se voltou os resultados de usuario e token de usuário

                setIsLoadingUserStorageData(true);
                await storageUserAndTokenSave(data.user, data.token); //salva os dados no AsyncStorage
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
            setToken("");
            //Remove do AsyncStorage os dados de usuário e token de usuário
            await storageAuthTokenRemove();
            await storageUserRemove();
        } catch (error) {
            throw error;
        } finally {
            setIsLoadingUserStorageData(false);
        }

    }

    async function userAndTokenUpdate(userData: UserDTO, token: string) { //vai atualizar os estados e cabeçalho de requisições da aplicação tanto na reinicialização quanto no login ()
        //took out try catch cause it is just an update info according to teacher
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setToken(token);
        setUser(userData);
    }

    async function storageUserAndTokenSave(userData: UserDTO, token: string) { //vai salvar no AsyncStorage pra persistir os dados no mobile
        try {
            setIsLoadingUserStorageData(true);
            await storageUserSave(userData);
            await storageAuthTokenSave(token); //frufru na minha opiniao; podia ser feito aqui mesmo;
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
            const token = await storageAuthTokenGet(); //busca token de usuário, na reinicialização do app ou reabertura, pois useEffect chama loadUserData()
            if (token && userLogged) { //confere se chegou algo aqui nessas variáveis
                userAndTokenUpdate(user, token); //se chegou ele vai atualizar os estados (não precisa escrever, pois ele buscou de lá mesmo, do AsyncStorage)

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