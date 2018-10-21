 <template>
  <div id="my_page" class="body">
    <div class="main">
      <h1>My Page @ {{ name }}</h1>
      <!-- 貸出リクエスト -->
      <div id="requests-field">
       <span v-if="requests.length > 0" style="color:red;">
          リクエストが{{requests.length}}件あるよ！！！！！
          <el-button type="primary" @click="requestOpen = (requestOpen)?false:true" size="mini" round>
            {{(requestOpen)?"閉じる":"確　認"}}
          </el-button>
        </span>
        <div id="request-table-field" v-if="requests.length > 0"> 
          <el-table v-if="requestOpen" :data="requests" height="200">
            <el-table-column prop="requestUName" label="希望者" width="180" sortable />
            <el-table-column prop="title" label="書籍名" width="180" sortable/>
            <el-table-column>
              <template slot-scope="scope" width="40">
                <el-button size="mini" round>貸すよ！</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <br>
      </div>

      <!-- 本追加 -->
      <el-button type="success" @click="showNewBookModal = true" >本の追加 </el-button>
      <el-dialog
        title="追加"
        :visible.sync="showNewBookModal"
        width="40%"
        :before-close="handleClose">
        <span class="dialog-body">
          <div>入力してください</div><br>
          <el-form label-width="120px">
            <el-form-item label="タイトル">
              <el-input placeholder="new title" v-model="newBook.title" clearable />
            </el-form-item>
            <el-form-item label="作者">
              <el-input placeholder="new author" v-model="newBook.author" clearable />
            </el-form-item>
          <!-- tesutoko-do -->
          <el-tag
            :key="tag"
            v-for="tag in newBook.tags"
            closable
            :disable-transitions="false"
            @close="tagDelete(tag)">
            {{tag}}
          </el-tag>
          <el-autocomplete
            :fetch-suggestions="querySearch"
            class="input-new-tag"
            v-if="tagAddFlag"
            v-model="tagName"
            ref="saveTagInput"
            size="mini"
            placeholder="例：Vue, Java, 基本情報 など"
            @keyup.enter.native="tagAdd"
            @select="tagAdd"
          >
        </el-autocomplete>
        <el-button v-else class="button-new-tag" size="small" @click="newTag">+ New Tag</el-button>
         </el-form>
        </span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showNewBookModal = false" size="small">Cancel</el-button>
          <el-button type="primary" @click="pushBook" size="small">Confirm</el-button>
        </span>
      </el-dialog>

       <!-- 自分の本 -->
      <div class="list-field">
      <el-table :data="myBooks" height="700"  :default-sort = "{prop: 'strDate', order: 'descending'}" 
      stripe style="width: 30%">
        <el-table-column label="#">
          <template slot-scope="scope">
            {{(scope.row.rentalFlag)?"貸出中":""}}
          </template>
        </el-table-column>
        <el-table-column prop="strDate" label="登録日" width="180" sortable />
        <el-table-column prop="title" label="書籍名" width="180" sortable/>
        <el-table-column prop="author" label="作者" width="180" sortable/>
        <el-table-column label="タグ">
            <template slot-scope="scope">
              <el-tag
              :key="tag"
              v-for="tag in scope.row.tags"
              :disable-transitions="false">
              {{tag}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column >
          <template slot-scope="scope">
            <el-button 
              size="mini"
              @click="editBook(scope.row)"
              round
            >本の更新
            </el-button>
            <el-button 
              size="mini"
              type="danger"
              @click="deleteBook(scope.row)"
              round
            >本の削除
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
  name: "MyPage",
  data() {
    return {
      myBooks: [],
      name: firebase.auth().currentUser.displayName,
      uid: firebase.auth().currentUser.uid,
      newBook: {
        title: null,
        author: null,
        tags: [],
        owner: this.uid,
        ownerName: this.name,
        createTime: null,
        updateTime: null,
        rentalFlag: false,
      },
      requestOpen: false,
      requests: [],
      sampleTags: [
        {"value":"Vue"},
        {"value":"Java"},
        {"value":"Python"},
        {"value":"基本情報"},
        {"value":"応用情報"},
        {"value":"Ruby"},
        {"value":"JavaScript"},
        {"value":"TypeScript"},
      ],
      showNewBookModal: false,
      tagAddFlag: false,
      tagName: ""
    };
  },
  created() {
    const db = firebase.firestore();
    db.collection("rental")
      .where("owner", "==", this.uid)
      .orderBy("requestTime")
      .get()
      .then(querySnapshot => {
        this.setRequests(querySnapshot);
      });
    let collection = db
      .collection("books")
      .where("owner", "==", this.uid)
      .orderBy("createTime");
    this.setBooks(this.myBooks, collection);
  },
  methods: {
    setRequests: function(querySnapshot) {
      querySnapshot.forEach(doc => {
        let obj = doc.data();
        obj["key"] = doc.key;
        this.requests.push(obj);
      });
    },
    setBooks: function(books, collection) {
      collection.onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          //トリガーが 追加 or 更新 (追加には初期実行時が含まれる)
          if (change.type === "added" || change.type === "modified")
            this.updateBooks(books, change.doc);
          if (change.type === "removed") this.removeBooks(books, change.doc.id);
        });
      });
      books.sort();
    },
    updateBooks: function(books, doc) {
      //タイムスタンプ型 => JS Date型 => String　うーん・・・ゴミ！！！！！
      const date = doc.data().createTime.toDate();
      const strDate =
        [date.getFullYear(), date.getMonth() + 1, date.getDate()].join("/") +
        " " +
        date.toLocaleTimeString();
      console.debug("### updateMyBooks");
      let obj = doc.data();
      obj["id"] = doc.id;
      obj["strDate"] = strDate;
      books.push(obj);
    },
    removeBooks: function(books, id) {
      console.debug("### removeMyBooks");
      books.forEach(function(item, index, books) {
        if (id === item.id) books.splice(index, 1);
      });
    },
    pushBook: function() {
      if(!(this.newBook.title) || !(this.newBook.author)){
        alert("タイトルと作者両方を未入力で本の作成はできません。")
        return
      };
      const authUser = firebase.auth().currentUser;
      const db = firebase.firestore();
      db.settings({ timestampsInSnapshots: true });

      this.newBook.createTime = new Date();
      this.newBook.updateTime = new Date();
      this.newBook.owner = authUser.uid;
      this.newBook.ownerName = this.name;
      db.collection("books").add(this.newBook);
      this.newBook = {
        title: null,
        author: null,
        tags: [],
        owner: this.uid,
        ownerName: this.name,
        createTime: null,
        updateTime: null,
        rentalFlag: false
      };
      this.showNewBookModal = false;
    },
    editBook: function(book) {
      console.debug(book);
      alert("未実装だよ!ごめんネ！！");
    },
    //本の削除
    deleteBook: function(book) {
      if(!confirm('本当に削除しても良いですか？'))return;
      const db = firebase.firestore();
      db.collection("books").doc(book.id).delete();
    },
    //モーダル閉じる
    handleClose: function(done) {
      this.$confirm("現在の入力が保存されていませんが、閉じても良いですか？")
        .then(_ => {
          done();
        })
        .catch(_ => {});
    },
    //タグの削除
    tagDelete: function(tag) {
      this.newBook.tags.splice(this.newBook.tags.indexOf(tag), 1);
    },
    //タグ追加ボタン押下
    newTag: function() {
      this.tagAddFlag = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    //タグついか
    tagAdd: function(item) {
      let tagName = (item.value) ? item.value : this.tagName;
      //sample選択時はitemの値を使う
      if(this.newBook.tags.indexOf(tagName) >= 0){
        alert("重複はダメです")
      }
      else if(this.newBook.tags.length > 4){
        alert("４つまでにしてください")
      }else{
        if (tagName) this.newBook.tags.push(tagName);
      }
      this.tagAddFlag = false;
      this.tagName = "";
    },
    //タグの入力保管データ作成
    querySearch(queryString, cb) {
        var sampleTags = this.sampleTags;
        var results = queryString ? sampleTags.filter(this.createFilter(queryString)) : sampleTags;
        // call callback function to return suggestions
        cb(results);
    },
    //タグの入力保管データを入力でフィルタリング
    createFilter(queryString) {
       return (sampleTag) => {
        return (sampleTag.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
       };
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
#request-table-field {
  width: 50%;
  text-align: center;
  margin: 0 auto;
}

.centar {
  text-align: center;
  margin: 0 auto;
}
</style>
