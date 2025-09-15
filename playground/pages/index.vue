<script setup lang="ts">
const { signOut } = useAuth();

const { data, error, pending } = await useFetch('/api/test', { method: 'POST' });
</script>

<template>
    <div>Test</div>

    <div v-if="pending">Loading...</div>
    <div v-if="error">Error: {{ error.message }}</div>
    <div v-else-if="data">Success!</div>
    Data:

    {{ data }}

    <button @click="signOut()">Sign Out</button>
</template>