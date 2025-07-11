import axios from "axios";


// const apiUrl = 'http://192.168.196.193:3000'
const apiUrl = 'http://localhost:3000' 


// Auth
const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");
const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};

export interface SignInInterface {
    UserName?: string
    Email?: string;
    Password?: string;
}

//login
async function LignIn(data: SignInInterface) {

    return await axios
  
      .post(`${apiUrl}/auth/login`, data, requestOptions)
  
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

        .get(`${apiUrl}/get/cowrie`,requestOptions)

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

export {
    LignIn,
    getCowrie,
    getCowrieAuth,
    getOpenCanary,
}