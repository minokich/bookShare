 <template>
  <div id="my_page" class="body">
    <div class="main">
      <h1>My Page @ {{ name }}</h1>
      <!-- 受けた貸出リクエスト -->
      <span id="requests-field">
       <span v-if="requests.length > 0" >
         <el-badge :value="requests.length">
          <el-button type="danger" @click="requestOpen = (requestOpen)?false:true" size="mini" icon="el-icon-message" round>
            {{(requestOpen)?"閉じる":"受けたリクエスト"}}
          </el-button>
         </el-badge>
        </span>
        <div id="request-table-field" v-if="requests.length > 0"> 
          <el-table v-if="requestOpen" :data="requests" height="150">
            <el-table-column prop="requestUName" label="希望者" width="180" sortable />
            <el-table-column prop="title" label="書籍名" width="200" sortable/>
            <el-table-column>
              <template slot-scope="scope" width="40" >
                <span v-if="scope.row.rentalStatus == 0">
                  <el-button size="mini" type="success" round @click="rentalAllow(scope.row, scope.row.bookId)">貸すよ！</el-button>
                  <br><el-button size="mini" type="danger" round @click="rentalProhibit(scope.row.rentalId)">ヤダよ！</el-button>
                </span>
                <span v-else-if="scope.row.rentalStatus == 1 || scope.row.rentalStatus == 2">
                  {{(scope.row.rentalStatus == 1)?"渡さなきゃ！":"貸してるよ！"}}
                  <el-button v-if="scope.row.rentalStatus == 1" size="mini" type="warning" round @click="rentalProhibit(scope.row.rentalId)"> やっぱやめた</el-button>
                </span>
                <span v-else-if="scope.row.rentalStatus == 3">
                  <el-button size="mini" type="warning" round @click="myBookReturned(scope.row, scope.row.bookId)"> 返してもらった</el-button>
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <br>
      </span>

      <!-- 自分の出した貸出リクエスト -->
      <span id="requests-field">
       <span v-if="myRequests.length > 0">
          <el-button type="primary" @click="myRequestOpen = (myRequestOpen)?false:true" size="mini" icon="el-icon-message" round>
            {{(myRequestOpen)?"閉じる":"自分のリクエスト"}}
          </el-button>
        </span>
        <div id="request-table-field" v-if="myRequests.length > 0"> 
          <el-table v-if="myRequestOpen" :data="myRequests" height="150">
            <el-table-column prop="requestUName" label="希望者" width="180" sortable />
            <el-table-column prop="title" label="書籍名" width="180" sortable/>
            <el-table-column>
              <template slot-scope="scope" width="80" >
                <span v-if="scope.row.rentalStatus == 0">
                  許可待ち！<br>
                  <el-button size="mini" type="danger" @click="myRentalRequestDelete(scope.row.rentalId)">キャンセル</el-button>
                </span>
                <span v-else-if="scope.row.rentalStatus == 1">
                  許可もらったよ！<br>
                  <el-button size="mini" @click="rentalBookRceive(scope.row.rentalId)">受け取った！</el-button>
                </span>
                <span v-else-if="scope.row.rentalStatus == 2">
                  借りてるよ<br>
                  <el-button size="mini" @click="rentalBookReturn(scope.row.rentalId)">返した！</el-button>
                </span>
                <span v-else-if="scope.row.rentalStatus == 3">
                  返したよ
                </span>
                <span v-else>
                  拒否されました。
                  <el-button size="mini" type="danger" @click="myRentalRequestDelete(scope.row.rentalId)">削除</el-button>
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <br>
      </span>

      <!-- 本追加 -->
      <el-button type="success" @click="pushOpen" >本の追加 </el-button>
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

      <!-- 本の更新 -->
      <el-dialog
        title="修正"
        :visible.sync="showEditModal"
        width="40%"
        :before-close="handleClose">
        <span class="dialog-body">
          <div>変更情報を入力してください。</div><br>
          <el-form label-width="120px">
            <el-form-item label="タイトル">
              <el-input placeholder="new title" v-model="editBookObj.title" clearable />
            </el-form-item>
            <el-form-item label="作者">
              <el-input placeholder="new author" v-model="editBookObj.author" clearable />
            </el-form-item>
          <!-- tesutoko-do -->
          <el-tag
            :key="uptag"
            v-for="uptag in editBookObj.tags"
            closable
            :disable-transitions="false"
            @close="tagDelete(uptag)">
            {{uptag}}
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
         <label style="font-size:5px"><br>タグの削除をしてもモーダル上に反映されません。<br>データは問題ないですが、頑張って直します。
         </label>
        </span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showEditModal = false" size="small">Cancel</el-button>
          <el-button type="primary" @click="editBook" size="small">Confirm</el-button>
        </span>
      </el-dialog>

      <!-- 自分の本 -->
      <div class="list-field">
        <el-table :data="myBooks" height="700"  :default-sort = "{prop: 'strDate', order: 'descending'}" 
        stripe style="width: 30%">
          <el-table-column prop="strDate" label="登録日" width="180" sortable />
          <el-table-column prop="title" label="書籍名" min-width="150" sortable/>
          <el-table-column prop="author" label="作者" width="180" sortable/>
          <el-table-column prop="rentalUser" label="貸出中" width="100"/>
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
          <el-table-column min-width="100">
            <template slot-scope="scope">
              <el-button 
                size="mini"
                @click="editOpen(scope.row)"
                round
              >本の修正
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
      requestOpen: false,
      requests: [],
      myRequestOpen: false,
      myRequests:[],
      newBook: {
        title: null,
        author: null,
        tags: [],
        owner: this.uid,
        ownerName: this.name,
        createTime: null,
        updateTime: null,
        rentalUser: "",
        rentalFlag: false,
      },
      showNewBookModal: false,
      editBookObj: {},
      showEditModal : false,
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
      tagAddFlag: false,
      tagName: ""
    };
  },
  created() {
    const db = firebase.firestore();
    this.getMyRequest(db)
    this.getHaveRequest(db)
    let collection = db
      .collection("books")
      .where("owner", "==", this.uid)
      .orderBy("createTime");
    this.setBooks(this.myBooks, collection);
  },
  methods: {
    getHaveRequest: function(db) {
      db.collection("rental")
      .where("owner", "==", this.uid)
      .where("rentalStatus",'<=',10)
      .get()
      .then(querySnapshot => {
        this.setRequests(querySnapshot, this.requests);
      });
    },
    getMyRequest: function(db){
      db.collection("rental")
      .where("requestUId", "==", this.uid)
      .orderBy("requestTime")
      .get()
      .then(querySnapshot => {
        this.setRequests(querySnapshot, this.myRequests);
      });
    },
    setRequests: function(querySnapshot,requests) {
      //初期化
      requests.forEach(function(item, index, requests) {
          requests.splice(index, 1);
      });
      querySnapshot.forEach(doc => {
        let obj = doc.data();
        obj["rentalId"] = doc.id;
        requests.push(obj);
      });
    },
    setBooks: function(books, collection) {
      collection.onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          //トリガーが 追加 or 更新 (追加には初期実行時が含まれる)
          if (change.type === "removed" || change.type === "modified") this.removeBooks(books, change.doc.id);
          if (change.type === "added" || change.type === "modified") this.updateBooks(books, change.doc);
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
    pushOpen: function(){
        this.newBook = {
        title: null,
        author: null,
        tags: [],
        owner: this.uid,
        ownerName: this.name,
        createTime: null,
        updateTime: null,
        rentalUser: "",
        rentalFlag: false
      };
      this.tagAddFlag = false;
      this.showNewBookModal = true;
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
        rentalUser: "",
        rentalFlag: false
      };
      this.showNewBookModal = false;
    },
    //修正反映
    editBook: function() {
      if(!confirm('本当に修正しても良いですか？'))return;
      const db = firebase.firestore();
      const id = this.editBookObj.id;
      delete this.editBookObj["id"]
      db.collection("books").doc(id).set(this.editBookObj)

      this.showEditModal = false;
    },
    //修正モーダルを開く
    editOpen: function(book){
      this.tagAddFlag = false;
      Object.assign(this.editBookObj, book);
      //タグの配列をconcatでこぴーしたもので上書き => そのままだと参照がこぴーされているっぽい
      //this.editBookObj["tags"] = book["tags"].concat();
      this.showEditModal = true;
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
      if(this.showNewBookModal) this.newBook.tags.splice(this.newBook.tags.indexOf(tag), 1);
      if(this.showEditModal) this.editBookObj.tags.splice(this.editBookObj.tags.indexOf(tag), 1);
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
      console.debug(item);
      let tagName = (item.value) ? item.value : this.tagName;
      //sample選択時はitemの値を使う
      let tags = (this.showNewBookModal) ? this.newBook.tags : this.editBookObj.tags;
      if(tags.indexOf(tagName) >= 0){
        alert("重複はダメです")
      }else if(tags.length > 4){
        alert("４つまでにしてください")
      }else if(tagName){
        tags.push(tagName);
      }
      this.tagAddFlag = false;
      this.tagName = "";
    },
    //タグの入力保管データ作成
    querySearch: function(queryString, cb) {
        var sampleTags = this.sampleTags;
        var results = queryString ? sampleTags.filter(this.createFilter(queryString)) : sampleTags;
        // call callback function to return suggestions
        cb(results);
    },
    //タグの入力保管データを入力でフィルタリング
    createFilter: function(queryString) {
       return (sampleTag) => {
        return (sampleTag.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
       };
    },
    //レンタル許可
    rentalAllow: function(request,bookId){
      if(!confirm('貸し出してもいいですか？'))return;
      const db = firebase.firestore();
      db.collection("books").doc(bookId).update(
        {
          "rentalFlag":true,
          "rentalUser":request.requestUName,
        }
      );
      //パラメータ設定のみ
      db.collection('rental').doc(request.rentalId).update(
        {
          "rentalStatus": 1
        }
      ).then(
        request.rentalStatus = 1
      );
      this.getHaveRequest(db)
    },
    //レンタル拒否
    rentalProhibit: function(rentalId){
      if(!confirm('本当に拒否しますか？'))return;
      const db = firebase.firestore();
            //パラメータ設定のみ
      db.collection('rental').doc(rentalId).update({"rentalStatus": 99}
      );
      //一覧から消す
      this.requests.forEach(function(item, index, requests) {
        if (rentalId === item.rentalId) requests.splice(index, 1);
      });
      this.getHaveRequest(db)
      if(this.requests.length <= 0)this.requests = false;
    },
    //本を返してもらった
    myBookReturned: function(request,bookId){
      const db = firebase.firestore();
      db.collection('rental').doc(request.rentalId).delete();
      db.collection('books').doc(bookId).update(
        {
          "rentalFlag":falese,
          "rentalUser":"",
        }
      );
      this.getHaveRequest(db)
    },
    //本を受け取った
    rentalBookRceive: function(rentalId){
      const db = firebase.firestore();
      db.collection('rental').doc(rentalId).update({"rentalStatus": 2})
      this.getMyRequest(db)
    },
    //本を返した
    rentalBookReturn: function(rentalId){
      const db = firebase.firestore();
      db.collection('rental').doc(rentalId).update({"rentalStatus": 3})
      this.getMyRequest(db)
    },
    //リクエストの削除
    myRentalRequestDelete: function(rentalId){
      let message = 'リクエストをを削除します。必ず書籍を返却してから実行してください。';
      if(!window.confirm(message))return;
      const db = firebase.firestore();
      db.collection('rental').doc(rentalId).delete();
      //一覧から消す
      this.myRequests.forEach(function(item, index, myRequests) {
        if (rentalId === item.rentalId) myRequests.splice(index, 1);
      });
      this.getMyRequest(db)
      if(myRequests.length <= 0)this.myRequestOpen = false;
    },
    hoge: function(){
      alert("ゴメンね！まだ未実装だよ！！");
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
