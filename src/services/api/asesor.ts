import { api } from './client';

export const enviarSolicitudAsesoramiento = async (mensaje: string) => {
    const { data } = await api.post("/solicitudes-asesoramiento", {
        mensaje,
    });

    return data;
};