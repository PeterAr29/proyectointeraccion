import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Los headers de seguridad (CSP, HSTS, etc.) se endurecen en F6.2.
  // El acceso a datos siempre pasa por lib/services/* (nunca Supabase directo en componentes).
};

export default nextConfig;
