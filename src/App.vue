<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import Header from './components/Header.vue'
import CommandPalette from './components/CommandPalette.vue'
import Footer from './components/Footer.vue'
import MobileNavigation from './components/MobileNavigation.vue'

const route = useRoute()
</script>

<template>
  <div class="app-layout">
    <Header />
    <CommandPalette />
    <main class="main-content">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.name" />
        </transition>
      </RouterView>
    </main>
    <Footer />
    <MobileNavigation />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 40px 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
