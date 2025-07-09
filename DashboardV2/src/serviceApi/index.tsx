import axios from "axios";


const apiUrl = 'http://192.168.196.193:3000'
// const apiUrl = 'http://localhost:3000' 

//get cowrie
async function getCowrie() {

    return await axios

        .get(`${apiUrl}/get/cowrie-none-auth`)

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
    getCowrie,
    getOpenCanary,
}