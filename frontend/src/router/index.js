import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue') 
    },
  ]
})

//list of routes accessible without a token
const openRoutes = [
  '/login'
]

router.beforeEach((to, from, next) => {
  //if the route requires a token, go to login
  if (localStorage.getItem("token") || openRoutes.includes(to.path)) {
    next();
  } else {
    next('/login');
  }
});

export default router