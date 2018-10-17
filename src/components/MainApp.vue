 <template>
  <div id="top_page" class="body">
    <div class="main">
      <h1>{{ msg }}</h1>
      <ul v-for="book in books" v-bind:key="book.id" v-bind:id="book.id">
        <li>{{book.title}}</li><button @click="retalRequest(book.id)" />
      </ul>
    </div>
  </div>
</template>

<script>
import firebase from "firebase";

export default {
  data() {
    return {
      msg: "Welcome to Book Share App",
      books: [],
      name: firebase.auth().currentUser.displayName
    };
  },
  created() {
    const collection = firebase.firestore().collection("books").orderBy("user").orderBy('createTime');
    this.setBooks(this.books,collection);
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
    retalRequest: function(id){
      alert('意味はないよ！！: ' + id);
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
