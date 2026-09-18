import { createContext, useContext, useState } from 'react';

const SesionContext = createContext(null);

export function SesionProvider({ children }) {
    const [rol, setRol]           = useState(() => localStorage.getItem('tablon_rol'));
    const [perfilId, setPerfilId] = useState(() => localStorage.getItem('tablon_perfil_id'));

    const guardarRol = (nuevoRol) => {
        localStorage.setItem('tablon_rol', nuevoRol);
        setRol(nuevoRol);
    };

    const guardarPerfilId = (id) => {
        localStorage.setItem('tablon_perfil_id', String(id));
        setPerfilId(String(id));
    };

    const cerrar = () => {
        localStorage.removeItem('tablon_rol');
        localStorage.removeItem('tablon_perfil_id');
        setRol(null);
        setPerfilId(null);
    };

    return (
        <SesionContext.Provider value={{ rol, perfilId, guardarRol, guardarPerfilId, cerrar }}>
            {children}
        </SesionContext.Provider>
    );
}

export const useSesion = () => useContext(SesionContext);