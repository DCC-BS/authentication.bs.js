import { computed, ref } from "vue";
export const getServerSession = (_) => {
  return Promise.resolve(null);
};
export const getToken = (_) => {
  return Promise.resolve(null);
};
export const useAuth = () => {
  const status = computed(() => "unauthenticated");
  const data = ref(void 0);
  const lastRefreshedAt = ref(void 0);
  function getCsrfToken() {
    return Promise.resolve("dummy");
  }
  function getProviders() {
    return Promise.resolve({});
  }
  const getSession = (_) => {
    return Promise.resolve({});
  };
  const signIn = (_, __, ___, ____) => {
    return Promise.resolve({
      error: null,
      status: 200,
      ok: true,
      url: "/auth/signin"
    });
  };
  const signOut = (_) => {
    return Promise.resolve(void 0);
  };
  return {
    status,
    data,
    lastRefreshedAt,
    getCsrfToken,
    getProviders,
    getSession,
    signIn,
    signOut,
    refresh: () => Promise.resolve()
  };
};
