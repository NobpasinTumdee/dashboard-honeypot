import axios from "axios";


// const apiUrl = 'http://10.5.51.9:3000'
const apiUrl = 'http://localhost:3000'

//get cowrie
async function getCowrie() {

    return await axios

        .get(`${apiUrl}/cowrie`)

        .then((res) => res)

        .catch((e) => e.response);

}
//get getOpenCanary
async function getOpenCanary() {

    return await axios

        .get(`${apiUrl}/open-canary`)

        .then((res) => res)

        .catch((e) => e.response);

}

export {
    getCowrie,
    getOpenCanary,
}