<template>
  <div id="app">
    <img　id="top-img" src="./assets/logo.jpg" alt="book-share">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 10px;
}

#top-img {
  max-height: 300px;
  max-width: 100%;
}
</style>
