 <template>
  <div id="my_page" class="body">
    <div class="main">
      <h1>My Page @ {{ name }}</h1>
      <!-- 貸出リクエスト -->
      <span v-if="requests.length > 0" style="color:red;">
        リクエストが{{requests.length}}件あるよ！！！！！
        <el-button type="primary" @click="requestOpen = (requestOpen)?false:true" size="mini" round>
          {{(requestOpen)?"閉じる":"確　認"}}
        </el-button>
      </span>
      <div v-if="requests.length > 0"> 
        <el-table v-if="requestOpen" :data="requests" height="200" max-width="400">
          <el-table-column prop="requestUName" label="希望者" width="180" sortable />
          <el-table-column prop="title" label="書籍名" width="180" sortable/>
        </el-table>
      </div>
      <br>

      <!-- 本追加 -->
      <el-button type="success" @click="showModal = true" >本の追加 </el-button>
      <el-dialog
        title="Tips"
        :visible.sync="showModal"
        width="40%"
        :before-close="handleClose">
        <span class="dialog-body">
          <span>情報入れろ</span>
          <el-input placeholder="new title" size="mini" v-model="newBook.title" clearable />
          <el-input placeholder="new author" size="mini" v-model="newBook.author" clearable />
          <!-- tesutoko-do -->
          <el-tag
            :key="tag"
            v-for="tag in newBook.tags"
            closable
            :disable-transitions="false"
            @close="tagDelete(tag)">
            {{tag}}
          </el-tag>
          <el-input
            class="input-new-tag"
            v-if="tagAddFlag"
            v-model="tagName"
            ref="saveTagInput"
            size="mini"
            @keyup.enter.native="tagAdd"
            @blur="tagAdd"
          >
        </el-input>
        <el-button v-else class="button-new-tag" size="small" @click="newTag">+ New Tag</el-button>
        </span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showModal = false">Cancel</el-button>
          <el-button type="primary" @click="pushBook">Confirm</el-button>
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
              @click="editBook(scope.row)"
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
import modalItem from "./NewBookModal";
import { request } from "http";

export default {
  name: "MyPage",
  components: {
    modalItem
  },
  data() {
    return {
      showModal: false,
      myBooks: [],
      name: firebase.auth().currentUser.displayName,
      uid: firebase.auth().currentUser.uid,
      newBook: {
        title: "",
        author: "",
        tags: [],
        owner: this.uid,
        ownerName: this.name,
        createTime: null,
        updateTime: null,
        rentalFlag: false,
      },
      requestOpen: false,
      requests: [],
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
      const authUser = firebase.auth().currentUser;
      const db = firebase.firestore();
      db.settings({ timestampsInSnapshots: true });

      this.newBook.createTime = new Date();
      this.newBook.updateTime = new Date();
      this.newBook.owner = authUser.uid;
      this.newBook.ownerName = this.name;
      db.collection("books").add(this.newBook);
      this.newBook = {
        title: "",
        author: "",
        tags: [],
        owner: this.uid,
        ownerName: this.name,
        createTime: null,
        updateTime: null,
        rentalFlag: false
      };
      this.showModal = false;
    },
    editBook: function(book) {
      console.debug(book);
      alert("未実装だよ!ごめんネ！！");
    },
    handleClose: function(done) {
      this.$confirm("現在の入力が保存されていませんが、閉じても良いですか？")
        .then(_ => {
          done();
        })
        .catch(_ => {});
    },
    tagDelete: function(tag) {
      this.dynamicTags.splice(this.newBook.tags.indexOf(tag), 1);
    },
    newTag: function() {
      this.tagAddFlag = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    tagAdd: function() {
      let tagName = this.tagName;
      if (tagName) {
        this.newBook.tags.push(tagName);
      }
      this.tagAddFlag = false;
      this.tagName = "";
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
</style>
