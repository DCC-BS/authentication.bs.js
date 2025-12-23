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
    method: "POST",
    handler: async (response) => {
        return response.docs.map((doc) => ({
            id: doc.id,
            title: doc.title,
            content: doc.content,
        }));
    },
});
