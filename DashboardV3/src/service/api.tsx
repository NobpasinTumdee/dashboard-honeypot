import axios from "axios";
import type { Users } from "../types";

// ZeroTier Main honeypot
// const apiUrl = 'http://172.29.169.27:3000'

const Url = localStorage.getItem("apiUrl");
const apiUrl = `${Url || 'http://localhost:3000'}`

// Auth
const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");
const requestOptions = {
    headers: {
        "Content-Type": "application/json",
        Authorization: `${Bearer} ${Authorization}`,
    },
};


//login
async function LignIn(data: Users) {

    return await axios

        .post(`${apiUrl}/auth/login`, data, requestOptions)

        .then((res) => res)

        .catch((e) => e.response);

}

//SignUp
async function SignUp(data: Users) {

    return await axios

        .post(`${apiUrl}/auth/register`, data, requestOptions)

        .then((res) => res)

        .catch((e) => e.response);

}

//get cowrie
async function getCowrie() {

    return await axios

        .get(`${apiUrl}/get/cowrie-none-auth`)

        .then((res) => res)

        .catch((e) => e.response);

}
//get cowrie Authorization
async function getCowrieAuth() {

    return await axios

        .get(`${apiUrl}/get/cowrie`, requestOptions)

        .then((res) => res)

        .catch((e) => e.response);

}

//get getOpenCanary
async function getOpenCanary() {

    return await axios

        .get(`${apiUrl}/get/open-canary-none-auth`)

        .then((res) => res)

        .catch((e) => e.response);

}
//get cowrie Authorization
async function getOpenCanaryAuth() {

    return await axios

        .get(`${apiUrl}/get/open-canary`, requestOptions)

        .then((res) => res)

        .catch((e) => e.response);

}

async function getAllUsers() {

    return await axios

        .get(`${apiUrl}/user/all`, requestOptions )

        .then((res) => res)

        .catch((e) => e.response);

}

async function AuthNewUser(id: string) {
    
    return await axios

        .put(`${apiUrl}/user/${id}/status`, {}, requestOptions )

        .then((res) => res)

        .catch((e) => e.response);

}

async function DeAuthNewUser(id: string) {
    
    return await axios

        .put(`${apiUrl}/user/${id}/deauthorize`, {}, requestOptions )

        .then((res) => res)

        .catch((e) => e.response);

}

export {
    LignIn,
    SignUp,
    getCowrie,
    getCowrieAuth,
    getOpenCanary,
    getOpenCanaryAuth,
    getAllUsers,
    AuthNewUser,
    DeAuthNewUser,
}