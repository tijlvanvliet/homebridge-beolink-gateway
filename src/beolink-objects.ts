export interface GatewayConfig {
    id: string;
    url: string;
    prefix: string;
    username: string;
    password: string;
    authHeader: string;
}

export interface MacroConfig {
    id: number;
    name: string;
    zone: string;
}