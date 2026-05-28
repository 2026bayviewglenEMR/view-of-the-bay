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
      component: () => import('../views/Consultation.vue')
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
      path: '/patients',
      name: 'patients',
      component: () => import('../views/PatientList.vue')
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: () => import('../views/Tasks.vue')
    },
    {
      path: '/patientPortal',
      name: 'patientPortal',
      component: () => import('../views/PatientPortal.vue')
    },
    {
      path: '/alerts',
      name: 'alerts',
      component: () => import('../views/Alerts.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/Profile.vue')
    },
    {
      path: '/waitingroom',
      name: 'Waiting Room',
      component: () => import('../views/WaitingRoom.vue')
    },
    {
      path: '/consultation',
      name: "Consultation",
      component: () => import('../views/Consultation.vue')
    },
    {
      path: "/drug-directory",
      name: "Drug Directory",
      component: () => import('../views/DoctorsDrugs.vue')
    }
  ]
})

//list of routes accessible without a token
const openRoutes = [
  '/login'
]

const routesConfig = {
  '/': {
    patientRedirect: '/patientPortal',
    doctorRedirect: '/dashboard',
    adminRedirect: '/waitingRoom',
  },
  '/patients': {
    patientRedirect: () => {
      const user = JSON.parse(localStorage.getItem('user'))
      return `/patients/${user?.patientId}`
    },
    doctorRedirect: '/patients',
    adminRedirect: '/patients',
  }
}

router.beforeEach((to, from, next) => {
  if (localStorage.getItem("token") || openRoutes.includes(to.path)) {
    if (routesConfig[to.path]) {
      const user = JSON.parse(localStorage.getItem("user"))
      const role = user?.role
      const redirect = routesConfig[to.path][role + "Redirect"]
      if (typeof redirect === 'function') {
        const resolvedRedirect = redirect()
        if (resolvedRedirect !== to.path) {
          next(resolvedRedirect)
        } else {
          next()
        }
      } else if (redirect !== to.path) {
        next(redirect)
      } else {
        next()
      }
    } else {
      next()
    }
  } else {
    next('/login');
  }
});

export default router
