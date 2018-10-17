<template>
  <div id="app">
    <headerItem />
    <router-view/>
    <footerItem />
  </div>
</template>

<script>
import headerItem from './components/Header'
import footerItem from './components/Footer'
import firebase from 'firebase'

export default {
  name: 'App',
  data() {
    return {
      
    }
  },
  components: {
    headerItem,
    footerItem,
  },
  created: function(){
    firebase.auth().onAuthStateChanged(token => {
      if (token) {
        this.$store.commit('updateState', true);
      } else {
        this.$store.commit('updateState', false);
      }
    });
  }
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
.body{
  display: flex;
  justify-content: center;
  -webkit-justify-content: center;
  -webkit-align-items: stretch;
  align-items: stretch;
  text-align: center;
}
.main{
  width: 100%;
  max-width: 1226px;
  border: solid #808000 1px;
}

</style>
