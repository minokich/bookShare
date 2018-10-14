 <template>
  <div class="hello">
    <h1>My Page @ {{ name }}</h1>
    <button @click="goTop">Top</button>
    <div v-for="(book,id) in myBooks" v-bind:key="id" v-bind:id="id">
      <p>{{book.title}}</p>
      <input type='hidden' v-bind:value="id">
    </div>
    <button @click="pushBook">push</button>
    <button @click="signOut">Sign out</button>
  </div>
</template>

<script>
import firebase from "firebase";

export default {
  name: "MyPage",
  data() {
    return {
      myBooks: {},
      name: firebase.auth().currentUser.displayName
    };
  },
  created() {
    const userKey = firebase.auth().currentUser.uid;
    var collection = firebase.firestore().collection("books").where("user", "==", userKey)

    collection.onSnapshot(querySnapshot => {
        console.debug(querySnapshot)
      //myBooksと取得queryのサイズを比較
      if (Object.keys(this.myBooks).length > querySnapshot.size) {
        console.debug("delete検知したから、myBooksを初期化")
        this.myBooks = {}
      }
      //myBooksに全部突っ込む
      querySnapshot.forEach(doc => {
        this.$set(this.myBooks, doc.id, doc.data());
      });
    });
  },
  methods: {
    goTop: function(){
      console.debug("### goTop");
      this.$router.push("/");
    },
    signOut: function() {
      firebase.auth().signOut().then(() => {
          console.debug("### signOut");
          this.$router.push("/signin");
        });
    },
    pushBook: function(newBook) {
      const authUser = firebase.auth().currentUser;
      const db = firebase.firestore();
      db.settings({ timestampsInSnapshots: true});

      db.collection('books').add({
        user: authUser.uid,
        title: authUser.displayName+'の本だよ',
        param1: '',
        param2: '',
        hoge : {
          moge : 100,
          fuga : true
        },
      });
    }
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
