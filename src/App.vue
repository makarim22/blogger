<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import Header from './components/Header.vue'
import CommandPalette from './components/CommandPalette.vue'
import Footer from './components/Footer.vue'

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
  transition: opacity 0.5s cubic-bezier(0.25, 1, 0.5, 1), transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(15px) scale(0.98);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(0.98);
}
</style>
