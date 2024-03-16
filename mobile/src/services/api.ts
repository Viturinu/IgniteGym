import { storageAuthTokenGet, storageAuthTokenSave } from "@storage/storageAuthToken";
import { AppError } from "@utils/AppError";
import axios, { AxiosInstance, AxiosError } from "axios"

let failedQueue: PromiseType[] = []; //Array<PromiseType>
let isRefreshing = false; //quando criar este código em memória, ele será falso para não entrar lá embaixo em condicional que cria requisição com erro em fila

type PromiseType = {
    onSuccess: (token: string) => void;
    onFailure: (error: AxiosError) => void;
}

type SignOut = () => void;

type APIInstanceProps = AxiosInstance & { //sem essa definição de tipo, já temos uma AxiosInstance autoamticamente (foco aqui é no interceptador)
    registerInterceptTokenManager: (signOut: SignOut) => () => void;//função que recebe outra função de retorno void; e a função em si também retorna void (meu entendimento)
}

const api = axios.create({ //criação de um objeto, por isso quando setamos registerInterceptTokenManager no AuthContext com a função de SignOut, ele seta este objeto em especifico (objeto utilizado para fazer todas as chamadas)
    baseURL: "http://10.0.0.103:3333"
}) as APIInstanceProps;



api.registerInterceptTokenManager = (signOut) => { //esse signOut foi passado lá no AuthContext (passada a referência da função signOut do contexto, e aqui ela será utilizada)
    const interceptTokenManager = api.interceptors.response.use(response => response, async (RequestError) => { //interceptTokenManager é referência do nosso interceptador, para passar pra função reject logo abaixo

        if (RequestError?.response?.status === 401) { //erro de autorização
            if (RequestError.response.data?.message === "token.expired" || RequestError.response.data?.message === "token.invalid") { //mensagens caracteristicas de erro de token
                const { refresh_token } = await storageAuthTokenGet(); //resgatando nosso refresh_token aramazenado no AsyncStorage (para recuperação de token novo)
                if (!refresh_token) { //se refresh_token não existir, faz signOut (pois entra no true) e retorna promessa rejeitada com objeto de erro
                    signOut();
                    return Promise.reject(RequestError);
                }

                if (isRefreshing) { //na primeira vez ele não entra aqui, pois estará como falso;  Na segunda vez sim, daí aqui dentro fazer implementar a lógica de adionar a nossa fila
                    return new Promise((resolve, reject) => {
                        failedQueue.push({
                            onSuccess: (token: string) => {
                                RequestError.config.headers = { "Authorization": `Bearer ${token}` } //token atualizado
                                resolve(api(RequestError.config.headers))
                            },
                            onFailure: (error: AxiosError) => {
                                reject(error);
                            }
                        })
                    })
                }

                isRefreshing = true; //pra entrar no if acima no próximo ciclo

                return new Promise(async (resolve, reject) => { //na primeira vez ele entra aqui (ou no recarregamento do app)
                    try {
                        const { data } = await api.post("/sessions/refresh-token", { refresh_token });
                        await storageAuthTokenSave({ token: data.token, refresh_token: data.refresh_token });
                        if (RequestError.config.headers.data) {
                            RequestError.config.headers.data = JSON.parse(RequestError.config.headers.data);
                        }
                        RequestError.config.headers = { "Authorization": `Bearer ${data.token}` }
                        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

                        failedQueue.forEach(request => {
                            request.onSuccess(data.token);
                        })
                    } catch (error: any) {
                        failedQueue.forEach(request => {
                            request.onFailure(error);
                        });
                        signOut(); //deslogar usuário
                        reject(error) //rejeitar requisição passando erro que aconteceu
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