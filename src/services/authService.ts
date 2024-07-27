import { dataLoginType, dataSignUpType } from "../types/Auth";
import http from "./httpService";

export function signInApi(data: dataLoginType) {
    return http.post('/auth/login', data).then(({ data }) => data);
}

export function getAccessToken(refreshToken: string) {
    return http.post('/auth/refresh-token', { refreshToken }).then(({ data }) => data);
}

export function signUpApi(data: dataSignUpType) {
    const dataUser = {...data , avatar:"https"}
    return http.post('/users', dataUser).then(({ data }) => data);
}