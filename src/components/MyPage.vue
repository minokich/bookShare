 <template>
  <div id="my_page" class="body">
    <div class="main">
      <h1>My Page @ {{ name }}</h1>
      <div v-if="requests.length > 0" @click="requestOpen = (requestOpen)?false:true"> 
        <span style="color:red;">リクエストがあるよ！！！！！</span>
        <div v-if="requestOpen" v-for="request in this.requests" v-bind:key = "request.key">
          {{request.title}}:{{request.requestUName}}
        </div>
      </div><br>
      <button id="show-modal" @click="showModal = true">newBook</button>
      <modalItem v-if="showModal" @close="showModal = false">
        <h3 slot="header">書籍追加</h3>
        <div slot="body">
          タイトル：<input type="text" v-model="newBook.title"><br>
          作者　　：<input type="text" v-model="newBook.author">
        </div>
        <span slot="footer">
           <button class="modal-default-button" @click="pushBook">push</button>
        </span>
      </modalItem>

      <ul v-for="book in myBooks" v-bind:key="book.id" v-bind:id="book.id">
        <li>{{book.title}}</li>
        <input type='hidden' v-bind:value="book.id">
      </ul>
    </div>
  </div>
</template>

<script>
import firebase from "firebase";
import modalItem from "./NewBookModal"
import { request } from 'http';

export default {
  name: "MyPage",
  components: {
    modalItem,
  },
  data() {
    return {
      showModal: false,
      myBooks: [],
      name: firebase.auth().currentUser.displayName,
      uid: firebase.auth().currentUser.uid,
      newBook: {
        title : 'noTitle',
        author: 'noAuthor',
        tag : [],
        owner: firebase.auth().currentUser.uid,
        createTime : null,
      },
      requestOpen : false,
      requests: []
    };
  },
  created() {
    const db = firebase.firestore();
    db.collection('rental').where("owner", "==", this.uid).orderBy('requestTime')
    .get()
    .then(querySnapshot => {
      this.setRequests(querySnapshot)
    })
    let collection = db.collection("books").where("owner", "==", this.uid).orderBy('createTime')
    this.setBooks(this.myBooks,collection);
  },
  methods: {
    setRequests: function(querySnapshot){
      querySnapshot.forEach(doc => {
       let obj = doc.data();
       obj['key'] = doc.key;
       this.requests.push(obj);        
      });
    },
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
    pushBook: function() {
      const authUser = firebase.auth().currentUser;
      const db = firebase.firestore();
      db.settings({ timestampsInSnapshots: true});

      this.newBook.createTime = new Date();
      this.newBook.owner = authUser.uid
      db.collection('books').add(this.newBook);
      this.newBook = {
        title : 'noTitle',
        author: 'noAuthor',
        tag : [],
        owner: 'thisUser',
        createTime : null,
      }
      this.showModal = false;
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
