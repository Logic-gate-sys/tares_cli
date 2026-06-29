import { use } from "react";
import { AuthContext } from '#state/context/auth-context';

export function useAuth() {
    const authCtx = use(AuthContext)
    if (!authCtx) {
        throw new Error("Failed to initialise auth context");
    }
    return authCtx; 
}