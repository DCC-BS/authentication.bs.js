<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAuth } from '#imports'
import { useI18n, availableLocales, defaultLocale } from '../../localization';

const { signIn } = useAuth();
const route = useRoute();

// Extract locale from URL path (e.g., /en/auth/signin -> "en")
function getLocaleFromUrl(): string {
    const pathSegments = route.path.split('/').filter(Boolean);
    const potentialLocale = pathSegments[0];

    // Check if the first path segment is a valid locale
    if (potentialLocale && availableLocales.includes(potentialLocale)) {
        return potentialLocale;
    }

    return defaultLocale;
}

const local = getLocaleFromUrl();

const { t } = useI18n(local);

// Add reactive state for loading animation
const isLoading = ref(true);
const loadingText = ref(t("auth.connecting"));

// Simulate loading states for better UX
const loadingStates = [
    t("auth.connecting"),
    t("auth.authenticating"),
    t("auth.redirecting"),
];

let currentStateIndex = 0;

onMounted(() => {
    // Cycle through loading states
    const loadingInterval = setInterval(() => {
        currentStateIndex = (currentStateIndex + 1) % loadingStates.length;
        loadingText.value = loadingStates[currentStateIndex];
    }, 1000);

    setTimeout(() => {
        signIn("azure-ad");
    }, 1500);

    // Cleanup interval after 10 seconds
    setTimeout(() => {
        clearInterval(loadingInterval);
    }, 1000);
});
</script>

<template>
    <div class="main-container">
        <!-- Animated background elements -->
        <div class="background-overlay">
            <div class="bg-circle bg-circle-1"></div>
            <div class="bg-circle bg-circle-2"></div>
            <div class="bg-circle bg-circle-3"></div>
        </div>

        <!-- Main content -->
        <div class="content-wrapper">
            <!-- Logo/Brand area -->
            <div class="brand-section">
                <div class="logo-container">
                    <svg class="logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z">
                        </path>
                    </svg>
                </div>
                <h1 class="main-title">{{ t("auth.welcomeBack") }}</h1>
                <p class="subtitle">{{ t("auth.signInToContinue") }}</p>
            </div>

            <!-- Loading card -->
            <div class="loading-card">
                <div class="card-content">
                    <!-- Loading text with animation -->
                    <h2 class="loading-title">
                        {{ loadingText }}
                    </h2>

                    <!-- Description -->
                    <p class="description">
                        {{ t("auth.azureAdDescription") }}
                    </p>

                    <!-- Progress dots -->
                    <div class="progress-dots">
                        <div class="dot dot-1"></div>
                        <div class="dot dot-2"></div>
                        <div class="dot dot-3"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.main-container{background:linear-gradient(to bottom right,#dbeafe,#fff,#e0e7ff);min-height:100vh;overflow:hidden;position:relative}.background-overlay{bottom:0;left:0;opacity:.2;position:absolute;right:0;top:0}.bg-circle{animation:pulse 2s cubic-bezier(.4,0,.6,1) infinite;border-radius:50%;filter:blur(64px);height:24rem;mix-blend-mode:multiply;position:absolute;width:24rem}.bg-circle-1{background-color:#93c5fd;left:25%;top:25%}.bg-circle-2{animation-delay:2s;background-color:#c4b5fd;right:25%;top:33.333333%}.bg-circle-3{animation-delay:4s;background-color:#f9a8d4;bottom:25%;left:33.333333%}.content-wrapper{align-items:center;display:flex;flex-direction:column;justify-content:center;min-height:100vh;padding:2rem;position:relative;z-index:10}.brand-section{margin-bottom:3rem;text-align:center}.logo-container{align-items:center;animation:bounce 2s infinite;background:linear-gradient(90deg,#3b82f6,#9333ea);border-radius:50%;box-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -2px rgba(0,0,0,.05);display:inline-flex;height:5rem;justify-content:center;margin-bottom:1.5rem;width:5rem}.logo-icon{color:#fff;height:2.5rem;width:2.5rem}.main-title{color:#1f2937;font-size:2.25rem;font-weight:700;line-height:2.5rem;margin-bottom:.5rem}.subtitle{color:#4b5563}.loading-card{backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);background-color:hsla(0,0%,100%,.8);border:1px solid hsla(0,0%,100%,.2);border-radius:1rem;box-shadow:0 25px 50px -12px rgba(0,0,0,.25);max-width:28rem;padding:2rem;width:100%}.card-content{text-align:center}.loading-title{animation:pulse 4s cubic-bezier(.4,0,.6,1) infinite;color:#1f2937;font-size:1.5rem;font-weight:600;line-height:2rem;margin-bottom:1rem}.description{color:#4b5563;line-height:1.625;margin-bottom:1.5rem}.progress-dots{display:flex;gap:.5rem;justify-content:center}.dot{animation:bounce 2s infinite;background-color:#3b82f6;border-radius:50%;height:.5rem;width:.5rem}.dot-2{animation-delay:.2s}.dot-3{animation-delay:.4s}@keyframes pulse{0%,to{opacity:1}50%{opacity:.5}}@keyframes bounce{0%,20%,53%,80%,to{transform:translateZ(0)}40%,43%{transform:translate3d(0,-8px,0)}70%{transform:translate3d(0,-4px,0)}90%{transform:translate3d(0,-2px,0)}}*{transition:all .3s ease}@media (max-width:640px){.content-wrapper{padding:1rem}.main-title{font-size:1.875rem;line-height:2.25rem}.loading-card{padding:1.5rem}.bg-circle{height:16rem;width:16rem}}
</style>