<template>
    <div class="signin">
        <h2>Sign in</h2>
        <button @click="signIn">Google</button>
    </div>
</template>

<script>
import firebase from "firebase";

export default {
  name: "Signin",
  methods: {
    signIn: function() {
      const providar = new firebase.auth.GoogleAuthProvider();
      const user = firebase
        .auth()
        .signInWithPopup(providar)
        .then(token => {
          console.debug("### success:[" + token.user.email + "]");
          this.$router.push('/')
        },
        err => {
          alert(err.message);
        });
    }
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
.signup {
  margin-top: 20px;

  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}
input {
  margin: 10px 0;
  padding: 10px;
}
</style>