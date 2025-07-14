import axios from "axios";
import api from "@/lib/api"; // hoặc import phù hợp với project bạn

export const topUp = (amount: number) =>
    axios.post("/wallet/top-up", { amount });

export const getBalance = () => api.get<number>('/wallet/balance');
export const getTransactionHistory = (page = 0, size = 10) =>
    axios.get(`/wallet/history?page=${page}&size=${size}`);
