import { createRouter, createWebHistory } from 'vue-router'
import Consultation from "@/views/TemplateUse.vue";

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
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/Dashboard.vue')
    },
    {
      path: '/templates',
      name: 'templates',
      component: () => import('../views/Templates.vue')
    },
    {
      path: "/consultation/:patientId",
      name: "consultation",
      component: Consultation
    },
    {
      path: '/diagnose/:patientId',
      name: 'templateUse',
      component: () => import('../views/TemplateUse.vue')
    },
    {
      path: '/messaging',
      name: 'messaging',
      component: () => import('../views/Messaging.vue')
    },
    {
      path: '/patients/:id',
      name: 'patient-record',
      component: () => import('../views/PatientRecord.vue')
    },
    {
      path: '/patientPortal',
      name: 'patientPortal',
      component: () => import('../views/PatientPortal.vue')
    },
    {
      path: '/waitingroom',
      name: 'waitingroom',
      component: () => import('../views/WaitingRoom.vue')
    }
    
  ]
})

//list of routes accessible without a token
const openRoutes = [
  '/login'
]

// router.beforeEach((to, from, next) => {
//   //if the route requires a token, go to login
//   if (localStorage.getItem("token") || openRoutes.includes(to.path)) {
//     next();
//   } else {
//     next('/login');
//   }
// });

export default router