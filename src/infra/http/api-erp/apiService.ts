import axios from "axios";

const api = axios.create({
    baseURL: "https://connectplug.com.br/api/v2/product",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "SEU_TOKEN_AQUI",
    },
});

export default api;
