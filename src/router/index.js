import Vue from 'vue'
import Router from 'vue-router'
import MainApp from '@/components/MainApp'
import MyPage from '@/components/MyPage'
import Signin from '@/components/Signin'
import firebase from 'firebase'

Vue.use(Router)

let router = new Router({
  routes: [
    {
      path: '*',
      redirect: 'signin'
    },
    {
      path: '/',
      name: 'MainApp',
      component: MainApp,
      meta: { requiresAuth: true }
    },
    {
      path: '/mypage',
      name: 'MyPage',
      component: MyPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/signin',
      name: 'Signin',
      component: Signin
    }
  ]
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  if (requiresAuth) {
    //firebaseからログイン状態を取得し、未認証なら認証画面へリダイレクト
    firebase.auth().onAuthStateChanged(token => {
      if (!token) {
        next({
          path: '/signin',
          query: { redirect: to.fullPath }
        })
      } else {
        next()
      }
    })
  } else {
    next()
  }
})

export default router