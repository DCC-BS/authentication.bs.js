import { useAuth as useNuxtAuth } from '#imports';
import type { AuthData } from '../../types/authData';
import type { UseAppAuthReturns } from '../../types/composableTypes';

export function useAppAuth(): UseAppAuthReturns {
    const { data: nuxtData, signOut: nuxtSignOut, signIn: nuxtSignIn } = useNuxtAuth();

    const data = computed<AuthData>(() => {
        return {
            user: {
                image: nuxtData.value?.user?.image || '',
                name: nuxtData.value?.user?.name || ''
            }
        }
    });

    async function signOut(): Promise<void> {
        await nuxtSignOut();
    }

    async function signIn(): Promise<void> {
        await nuxtSignIn(undefined);
    }

    return {
        signIn,
        signOut,
        data,
        isEnabled: computed(() => !!nuxtData.value),
    };
}
