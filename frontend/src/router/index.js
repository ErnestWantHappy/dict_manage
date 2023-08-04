import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
const routes = [
  {
    path: '/',
    component: Home,
    children:[
        {
            path:'dict',
            name:'dict',
            component:()=>import("../views/dict.vue")
        },
        {
          path:'dict/data/:dictType',
          name:'SystemDictData',
          component:()=>import("../components/dict/index.vue")
        }
    ]
  },
]



const router = createRouter({
  history: createWebHashHistory(),
  routes
})



export default router 