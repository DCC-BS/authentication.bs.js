<script setup lang="ts">
import { onMounted, ref } from "vue";

const { signIn } = useAuth();
// const { t } = useI18n();

function t(key: string): string {
    // Mock translation function for demonstration purposes
    const translations: Record<string, string> = {
        "auth.connecting": "Connecting to Azure AD...",
        "auth.authenticating": "Authenticating...",
        "auth.redirecting": "Redirecting...",
        "auth.welcomeBack": "Welcome Back!",
        "auth.signInToContinue": "Please sign in to continue.",
        "auth.azureAdDescription": "You are being redirected to Azure Active Directory for authentication.",
    };
    return translations[key] || key;
}

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
/* Main container */
.main-container {
    min-height: 100vh;
    background: linear-gradient(to bottom right, #dbeafe, #ffffff, #e0e7ff);
    position: relative;
    overflow: hidden;
}

/* Background overlay */
.background-overlay {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    opacity: 0.2;
}

/* Background circles */
.bg-circle {
    position: absolute;
    width: 24rem;
    height: 24rem;
    border-radius: 50%;
    mix-blend-mode: multiply;
    filter: blur(64px);
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.bg-circle-1 {
    top: 25%;
    left: 25%;
    background-color: #93c5fd;
}

.bg-circle-2 {
    top: 33.333333%;
    right: 25%;
    background-color: #c4b5fd;
    animation-delay: 2s;
}

.bg-circle-3 {
    bottom: 25%;
    left: 33.333333%;
    background-color: #f9a8d4;
    animation-delay: 4s;
}

/* Content wrapper */
.content-wrapper {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
}

/* Brand section */
.brand-section {
    margin-bottom: 3rem;
    text-align: center;
}

/* Logo container */
.logo-container {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 5rem;
    height: 5rem;
    background: linear-gradient(to right, #3b82f6, #9333ea);
    border-radius: 50%;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    margin-bottom: 1.5rem;
    animation: bounce 2s infinite;
}

.logo-icon {
    width: 2.5rem;
    height: 2.5rem;
    color: white;
}

/* Main title */
.main-title {
    font-size: 2.25rem;
    line-height: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.5rem;
}

/* Subtitle */
.subtitle {
    color: #4b5563;
}

/* Loading card */
.loading-card {
    background-color: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 1rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    padding: 2rem;
    max-width: 28rem;
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-content {
    text-align: center;
}

/* Loading title */
.loading-title {
    font-size: 1.5rem;
    line-height: 2rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 1rem;
    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Description */
.description {
    color: #4b5563;
    margin-bottom: 1.5rem;
    line-height: 1.625;
}

/* Progress dots */
.progress-dots {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
}

.dot {
    width: 0.5rem;
    height: 0.5rem;
    background-color: #3b82f6;
    border-radius: 50%;
    animation: bounce 2s infinite;
}

.dot-2 {
    animation-delay: 0.2s;
}

.dot-3 {
    animation-delay: 0.4s;
}

/* Animations */
@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

@keyframes bounce {

    0%,
    20%,
    53%,
    80%,
    100% {
        transform: translate3d(0, 0, 0);
    }

    40%,
    43% {
        transform: translate3d(0, -8px, 0);
    }

    70% {
        transform: translate3d(0, -4px, 0);
    }

    90% {
        transform: translate3d(0, -2px, 0);
    }
}

/* Smooth transitions */
* {
    transition: all 0.3s ease;
}

/* Responsive design */
@media (max-width: 640px) {
    .content-wrapper {
        padding: 1rem;
    }

    .main-title {
        font-size: 1.875rem;
        line-height: 2.25rem;
    }

    .loading-card {
        padding: 1.5rem;
    }

    .bg-circle {
        width: 16rem;
        height: 16rem;
    }
}
</style>