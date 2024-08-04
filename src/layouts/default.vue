<template>
  <div class="layout">
    <Header />
    <main>
      <slot />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from '~/components/Header.vue';
import Footer from '~/components/Footer.vue';
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;
  background: linear-gradient(0deg, rgba(9,0,29,1) 0%, rgba(10,0,46,1) 100%);
}

main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  padding: 20px;
  box-sizing: border-box;
}
</style>