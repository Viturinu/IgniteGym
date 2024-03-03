import { AppError } from "@utils/AppError";
import axios from "axios"

const api = axios.create({
    baseURL: "http://192.168.1.12:3333/"
});

api.interceptors.response.use(response => response, error => {
    if (error.response && error.response.data) { //padrão utilizado na api, logo estamos verificando se aquilo que fizemos na api está caindo aqui, com a mensagem padronizada pela api em uma condicional (se cair, foi aquele erro lá que deu)
        return Promise.reject(new AppError(error.response.data.message)); //estamos rejeitando (como se fosse jogando pro catch da instrução que chamou (toda Promisse é assim Promisse(resolve, reject))) a promisse e passando essa promisse para um novo padrão de mensagem de erro/excessão
    } else {
        return Promise.reject(error); //aqui é um erro genérico, pois se não existem error.response, error.response.data, logo error.response.data.message então é um erro feito pelo servidor (talvez pelo fastify ou express, a depender do framework)
    }
});

export { api }