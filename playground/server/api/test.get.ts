interface BackendDoc {
    id: string;
    title: string;
    content: string;
}

interface BackendResponse {
    docs: BackendDoc[];
}

interface FrontendDoc {
    id: string;
    title: string;
    content: string;
}

export default defineBackendHandler<
    never,
    never,
    BackendResponse,
    FrontendDoc[]
>({
    url: "/docs",
    method: "GET",
    fetcher: async (_) => {
        // Simulate fetching data from a backend service
        // In a real scenario, you would use `fetch` or another HTTP client to get data
        return {
            docs: [
                { id: "1", title: "Doc 1", content: "Content of Document 1" },
                { id: "2", title: "Doc 2", content: "Content of Document 2" },
            ],
        } as BackendResponse;
    },
});
