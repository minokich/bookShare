 <template>
  <div class="mypage">
    <h1>My Page @ {{ name }}</h1>
    <button @click="goTop">Top</button>
    <ul v-for="book in myBooks" v-bind:key="book.id" v-bind:id="book.id">
      <li>{{book.title}}</li>
      <input type='hidden' v-bind:value="book.id">
    </ul>
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
      myBooks: [],
      name: firebase.auth().currentUser.displayName
    };
  },
  created() {
    let collection = firebase.firestore().collection("books").where("user", "==", firebase.auth().currentUser.uid).orderBy('createTime')
    this.setBooks(this.myBooks,collection);
  },
  methods: {
    setBooks: function(books,collection){
      collection.onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          //トリガーが 追加 or 更新 (追加には初期実行時が含まれる)
          if(change.type === "added" || change.type === "modified")this.updateBooks(books,change.doc);
          if(change.type === "removed")this.removeBooks(books,change.doc.id);
        });
      });
      books.sort();
    },
    updateBooks: function(books,doc){
      console.debug("### updateMyBooks");
      let obj = doc.data();
      obj['id'] = doc.id; 
      books.push(obj);
    },
    removeBooks: function(books,id){
      console.debug("### removeMyBooks");
      books.forEach(function(item,index, books){
        if(id === item.id) books.splice(index,1);
      });
    },
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

      let ranNum = Math.floor(Math.random() * 100);//乱数
      db.collection('books').add({
        user: authUser.uid,
        title: authUser.displayName+'の本だよ('+ranNum+')',
        createTime: new Date(),
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
