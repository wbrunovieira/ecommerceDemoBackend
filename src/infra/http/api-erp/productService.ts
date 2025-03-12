import api from "./apiService";

export const fetchExternalProducts = async () => {
    try {
        const response = await api.get("/product");
        return response.data.data;
    } catch (error) {
        console.error("Erro ao buscar produtos externos:", error);
        throw new Error("Erro ao buscar produtos externos");
    }
};
