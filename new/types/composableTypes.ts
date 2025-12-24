import type { Ref } from 'vue';
import type { AuthData } from './authData';

export type SignOut = () => Promise<void>;
export type SignIn = () => Promise<void>;

export type UseAppAuthReturns = {
    signIn: SignIn;
    signOut: SignOut;
    data: Readonly<Ref<AuthData | null>>;
    isEnabled: Readonly<Ref<boolean>>;
};

export type UseAppAuth = () => UseAppAuthReturns;
