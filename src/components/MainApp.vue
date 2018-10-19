 <template>
  <div id="top_page" class="body">
    <div class="main">
      <h1>{{ msg }}</h1>
    <div class="list-field">
      <el-table :data="books" stripe height="700"  :default-sort = "{prop: 'strDate', order: 'descending'}" style="width: 30%">
        <el-table-column prop="strDate" label="登録日" width="180" sortable />
        <el-table-column prop="title" label="書籍名" width="180" sortable/>
        <el-table-column prop="author" label="作者" width="180" sortable/>
        <el-table-column prop="ownerName" label="持ち主" sortable/>
        <el-table-column >
          <template slot-scope="scope">
            <el-button 
              size="mini"
              :disabled="uid == scope.row.owner" 
              @click="retalRequest(scope.row.id, scope.row.title, scope.row.owner)"
              round
            >{{(uid == scope.row.owner)?"あなたの本":"借りたい！"}}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
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
      uid: firebase.auth().currentUser.uid,
      name: firebase.auth().currentUser.displayName,
    };
  },
  created() {
    const collection = firebase.firestore().collection("books").orderBy("owner").orderBy('createTime');
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
      //タイムスタンプ型 => JS Date型 => String　うーん・・・ゴミ！！！！！
      const date = doc.data().createTime.toDate();
      const strDate = [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
        ].join( '/' ) + ' '
        + date.toLocaleTimeString();
      console.debug("### updateMyBooks");
      let obj = doc.data();
      obj['id'] = doc.id; 
      obj['strDate'] = strDate;
      books.push(obj);
    },
    removeBooks: function(books,id){
      console.debug("### removeMyBooks");
      books.forEach(function(item,index, books){
        if(id === item.id) books.splice(index,1);
      });
    },
    hoge: function(aaa,bbb){
      alert(bbb);
    },
    retalRequest: function(bookId,title,owner){
      if(owner === this.uid ){
        alert('自分の本にレンタルリクエストは送れません。');
        return;
      }
      if(confirm('この本のレンタルリクエストを出しますか？')) {
        const db = firebase.firestore();
        db.settings({ timestampsInSnapshots: true});
        let date = new Date()
        db.collection('rental').doc(this.uid+'_'+bookId).set({
          'bookId': bookId,
          'title': title,
          'owner': owner,
          'requestTime': date,
          'requestUId':this.uid,
          'requestUName':this.name,
        });
        alert('レンタルリクエストを登録しました。')
      }
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
