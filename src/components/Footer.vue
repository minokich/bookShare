<template>
<div class="footer">
            <img id="sign_out" v-if="isLogin" src="../assets/exit.jpg" @click="signOut">
</div>
</template>

<script>
import firebase from "firebase";

export default {
  name: "Footer",
  data() {
    return {
    
    };
  },
  computed: {
    isLogin() {
      return this.$store.state.isLogin;
    },
  },
  methods: {
    signOut: function() {
      firebase.auth().signOut().then(() => {
          console.debug("### signOut");
          this.$router.push("/signin");
        });
    },
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.footer {
    width: 100%;
    text-align: right;
}
</style>
