 <template>
  <div class="hello">
    <h1>Hello {{ name }}!!</h1>
    <h1>{{ msg }}</h1>
    <button @click="goMyPage">MyPage</button>
    <div v-for="(book,id) in books" v-bind:key="id" v-bind:id="id">
      <p>{{book.title}}</p>
      <input type='hidden' v-bind:value="id">
    </div>

    <button @click="signOut">Sign out</button>
  </div>
</template>

<script>
import firebase from "firebase";

export default {
  name: "HelloWorld",
  data() {
    return {
      msg: "Welcome to Book Share App",
      books: {},
      name: firebase.auth().currentUser.displayName
    };
  },
  created() {
    const collection = firebase.firestore().collection("books");
    collection.onSnapshot(querySnapshot => {
      //booksと取得queryのサイズを比較
      if (Object.keys(this.books).length > querySnapshot.size) {
        console.debug("delete検知のためbooksを初期化")
        this.books = {}
      }
      //booksに全部突っ込む
      querySnapshot.forEach(doc => {
        this.$set(this.books, doc.id, doc.data());
      });
      console.debug(this.books)
    });
  },
  methods: {
    goMyPage: function(){
      console.debug("### goMyPage");
      this.$router.push("/mypage");
    },
    signOut: function() {
      firebase.auth().signOut().then(() => {
          console.debug("### signOut");
          this.$router.push("/signin");
        });
    },
  },
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
</style>
