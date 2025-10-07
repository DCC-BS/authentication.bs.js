export const getServerSession = (_) => {
  return Promise.resolve(null);
};
export const getToken = (_) => {
  return Promise.resolve(null);
};
export function useAuth() {
  const status = "unauthenticated";
  const data = void 0;
  const lastRefreshedAt = void 0;
  function getCsrfToken() {
    return "dummy";
  }
  function getProviders() {
    return [];
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
    signOut
  };
}
