import { storageAuthTokenGet, storageAuthTokenSave } from "@storage/storageAuthToken";
import { AppError } from "@utils/AppError";
import axios, { AxiosInstance, AxiosError } from "axios"

type PromiseType = {
    onSuccess: (token: string) => void;
    onFailure: (error: AxiosError) => void;
}

type SignOut = () => void;

type APIInstanceProps = AxiosInstance & { //sem essa definição de tipo, já temos uma AxiosInstance autoamticamente (foco aqui é no interceptador)
    registerInterceptTokenManager: (signOut: SignOut) => () => void;//função que recebe outra função de retorno void; e a função em si também retorna void (meu entendimento)
}

const api = axios.create({
    baseURL: "http://10.0.0.103:3333"
}) as APIInstanceProps;

let failedQueue: PromiseType[] = []; //Array<PromiseType>
let isRefreshing = false;

api.registerInterceptTokenManager = (signOut) => { //esse signOut foi passado lá no AuthContext (passada a referência da função signOut do contexto, e aqui ela será utilizada)
    const interceptTokenManager = api.interceptors.response.use(response => response, async (RequestError) => { //referencia do nosso interceptador, para passar pra função reject logo abaixo

        if (RequestError?.response?.status === 401) { //erro de autorização
            if (RequestError.response.data?.message === "token.expired" || RequestError.response.data?.message === "token.invalid") {
                const { refresh_token } = await storageAuthTokenGet();
                if (!refresh_token) { //se refresh_token não existir, faz signOut (pois entra no true) e retorna promessa rejeitada com objeto de erro
                    signOut();
                    return Promise.reject(RequestError);
                }

                const originalRequestConfig = RequestError.config; //pegando configurações do objeto de erro que está sendo interceptado

                if (isRefreshing) { //na primeira vez ele não entra aqui, pois estará como falso;  Na segunda vez sim, pois precisa refresh token e prosseguir
                    return new Promise((resolve, reject) => {
                        failedQueue.push({
                            onSuccess: (token: string) => {
                                originalRequestConfig.headers = { "Authorization": `Bearer ${token}` } //token atualizado
                            },
                            onFailure: (error: AxiosError) => {
                                reject(error);
                            }
                        })
                    })
                }

                isRefreshing = true;

                return new Promise(async (resolve, reject) => { //na primeira vez ele entra aqui?
                    try {
                        const { data } = await api.post("/sessions/refresh-token", { refresh_token });
                        await storageAuthTokenSave({ token: data.token, refresh_token: data.refresh_token })
                    } catch (error: any) {
                        failedQueue.forEach(request => {
                            request.onFailure(error);
                        });
                        signOut(); //deslogar usuário
                        reject(error)
                    } finally {
                        isRefreshing = false;
                        failedQueue = [];
                    }
                })
            }
            signOut();
        }

        if (RequestError.response && RequestError.response.data) { //padrão utilizado na api, logo estamos verificando se aquilo que fizemos na api está caindo aqui, com a mensagem padronizada pela api em uma condicional (se cair, foi aquele erro lá que deu)
            return Promise.reject(new AppError(RequestError.response.data.message)); //estamos rejeitando (como se fosse jogando pro catch da instrução que chamou (toda Promisse é assim Promisse(resolve, reject))) a promisse e passando essa promisse para um novo padrão de mensagem de erro/excessão
        } else { //error.response.data é um padrão seguido, pois no backend só existe um lançamento de excessão com uma class AppError e sua mensagem e statusCode; já aqui no mobile pegamos dessa forma (error.response.data) logo, é um padrão a ser seguido (inferência)
            return Promise.reject(RequestError); //aqui é um erro genérico, pois se não existem error.response, error.response.data, logo error.response.data.message então é um erro feito pelo servidor (talvez pelo fastify ou express, a depender do framework)
        }
    });
    return () => {
        api.interceptors.response.eject(interceptTokenManager);
    }
}


export { api }