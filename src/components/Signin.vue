<template>
    <div class="signin">
    <div>
      <h1>ようこそ</h1>
    </div>
        <button @click="signIn" class="firebaseui-idp-button mdl-button mdl-js-button mdl-button--raised firebaseui-idp-google firebaseui-id-idp-button" >
          <span class="firebaseui-idp-icon-wrapper">
            <img class="firebaseui-idp-icon" alt="" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg">
          </span>
          <span class="firebaseui-idp-text firebaseui-idp-text-long">
            Sign in with Google
          </span>
          <span class="firebaseui-idp-text firebaseui-idp-text-short">
            Google
          </span>
        </button>
    </div>
</template>

<script>
import firebase from "firebase";
import 'firebaseui/dist/firebaseui.css';

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
    },
    moge: function(key){
      console.debug(key)
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