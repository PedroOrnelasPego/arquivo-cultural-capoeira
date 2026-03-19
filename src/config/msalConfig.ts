import { Configuration, PublicClientApplication } from "@azure/msal-browser";

export const msalConfig: Configuration = {
    auth: {
        clientId: "ad632909-8e39-4a28-b180-19ae2c987a94",
        // ID do locatário que pegamos do icmbc.onmicrosoft.com
        authority: "https://login.microsoftonline.com/common",
        redirectUri: window.location.origin + "/login", // Detecta dinamicamente (localhost:3000, 5173 ou produção)
    },
    cache: {
        cacheLocation: "localStorage", 
        storeAuthStateInCookie: true, // Adicionado para melhor compatibilidade com navegadores
    }
};

export const msalInstance = new PublicClientApplication(msalConfig);
