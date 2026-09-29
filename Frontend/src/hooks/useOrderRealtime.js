import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../api/config";

const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export default function useOrderRealtime(queryName) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    if (!token) return undefined;

    const socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
    });
    socket.on("order:status-updated", () => {
      queryClient.invalidateQueries({ queryKey: [queryName] });
    });

    return () => socket.disconnect();
  }, [queryClient, queryName]);
}
