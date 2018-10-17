<template>
<div class="header">
    <div id="headder_imgs">
        <img　id="top_img" src="../assets/logo.jpg" alt="book-share" @click="goTop">
    </div>
    <div id="page_tab" v-if="isLogin">
        <button @click="goTop" v-bind:class="{active:isTop}" class="tab_item">Top</button>
        <button @click="goMyPage" v-bind:class="{active:!isTop}" class="tab_item">MyPage</button>
    </div>
</div>
</template>

<script>
import firebase from "firebase";

export default {
  name: "Header",
  data() {
    return {
        isTop: true,
    };
  },
  computed: {
    isLogin() {
      return this.$store.state.isLogin;
    },
  },
  methods: {
    goTop: function(){
      console.debug("### goTop");
      this.isTop = true;
      this.$router.push("/");
      
    },
    goMyPage: function(){
      console.debug("### goMyPage");
      this.isTop = false;
      this.$router.push("/mypage");
    },
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
.header {
    width: 100%;
    text-align: center;
}
#page_tab {
    display: -webkit-flex;
    display: flex;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-align-items: stretch;
    align-items: stretch;
    text-align: center;
    width: 100%;
}
.tab_item {
    width: calc(100%/2);
    max-width: calc(1226px/2);
    height: 50px;
    border-bottom: 3px solid #5ab4bd;
    background-color: #d9d9d9;
    line-height: 50px;
    font-size: 16px;
    text-align: center;
    color: #565656;
    display: block;
    float: left;
    font-weight: bold;
}
.tab_item:hover {
    opacity: 0.75;
}
.active {
    color: aliceblue;
    background-color:darkgray;
}
#headder_imgs{
    max-height: 300px;
    width: 100%;
    
}
#top_img {
    max-height: 300px;
    max-width: 100%;
    position: relative;
    z-index: 1;
}
</style>
