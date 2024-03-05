import { UserDTO } from "@dtos/userDTO";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import { ReactNode, createContext, useState } from "react";

export type AuthContextDataProps = {
    user: UserDTO;
    signIn: (email: string, password: string) => Promise<void>;
}

type AuthContextProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps);

export function AuthContextProvider({ children }: AuthContextProviderProps) { //tem que ser assim, pois é esperado a recepção de um objeto com a chave children; por isso, se passarmos children como ReactNode não vai dar certo, mas não é errado do ponto de vista lógico, uma vez que children é um tipo que aceitar qualquer coisa renderizavel na arvore de elementos React. 

    const [user, setUser] = useState<UserDTO>({} as UserDTO) //estado que ficara em nosso contexto, para manipulação e re-renderização a qualquer tempo

    async function signIn(email: string, password: string) { //ao inves de mandar setUser pra outra tela, a gente centraliza a lógica toda aqui nesse contexto, mandando o signIn (setUser() fica dentro do signIn()) apenas.
        try {
            const { data } = await api.post("/sessions", {
                email,
                password
            });

            if (data.user) {
                setUser(data.user)
            }
        } catch (error) {
            throw error;
        }

    }

    return (
        <AuthContext.Provider value={{
            user,
            signIn //usar estado pra aproveitar a estrutura de renderização
        }}>
            {children}
        </AuthContext.Provider>
    )
}