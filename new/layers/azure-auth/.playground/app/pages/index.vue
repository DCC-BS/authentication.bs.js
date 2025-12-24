<script lang="ts" setup>
import { useAppAuth } from '#imports';

const { data, signOut } = useAppAuth();

</script>

<template>
    <div>
        <div>User: {{ data?.user.name ?? 'NO USER' }}</div>

        <button @click="signOut">Sing Out</button>
    </div>
</template>
