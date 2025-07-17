<script setup lang="ts">

const { signOut } = useAuth();


</script>

<template>
    <div>Test</div>

    <button @click="signOut()">Sign Out</button>
</template>