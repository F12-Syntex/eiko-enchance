<template>
  <header class="header">
    <nav>
      <ul>
        <li :class="{ selected: currentPage === 'upscale' }">
          <NuxtLink to="/" @click="navigate('upscale')" class="nav-link">
            <span class="material-icons">arrow_upward</span>
            <span class="link-text">Upscale</span>
          </NuxtLink>
        </li>
        <li :class="{ selected: currentPage === 'settings' }">
          <NuxtLink to="/settings" @click="navigate('settings')" class="nav-link">
            <span class="material-icons">settings</span>
            <span class="link-text">Settings</span>
          </NuxtLink>
        </li>
        <li :class="{ selected: currentPage === 'download' }">
          <NuxtLink to="/download" @click="navigate('download')" class="nav-link">
            <span class="material-icons">download</span>
            <span class="link-text">Downloaded Models</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script>
export default {
  name: 'Header',
  data() {
    return {
      currentPage: 'upscale'
    };
  },
  methods: {
    navigate(page) {
      this.currentPage = page;
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.header {
  padding: 10px 30px;
  background-color: #0d0d1a; /* Darker background for a modern look */
  border-bottom: 1px solid #333; /* Subtle border for separation */
}

nav ul {
  list-style: none;
  padding: 0;
  display: flex;
  justify-content: center;
  gap: 15px; /* Bringing buttons closer together */
}

nav ul li {
  cursor: pointer;
}

.nav-link {
  color: #fff;
  text-decoration: none;
  font-size: 1.2em;
  font-weight: 400;
  display: flex;
  align-items: center;
  transition: color 0.3s ease, transform 0.3s ease;
  font-family: 'Roboto', sans-serif;
}

.material-icons {
  margin-right: 8px;
  font-size: 1.5em;
}

.link-text {
  display: none;
}

.nav-link:hover {
  color: #f50057;
}

.selected .nav-link {
  color: #f50057;
}

@media (min-width: 768px) {
  .link-text {
    display: inline;
  }
}
</style>