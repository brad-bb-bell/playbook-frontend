<template>
  <main>
    <h1 class="text-center text-2xl">Playbook</h1>
    <div v-for="bet in allBets" :key="bet.id">
      <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">Title</label>
          <p class="text-gray-700 text-base">{{ bet.sport }}</p>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">Description</label>
          <p class="text-gray-700 text-base">{{ bet.description }}</p>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">Odds</label>
          <p class="text-gray-700 text-base">{{ bet.odds }}</p>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">Status</label>
          <p class="text-gray-700 text-base">{{ bet.status }}</p>
        </div>
      </div>
    </div>
  </main>
</template>
<script>
import axios from 'axios'

export default {
  data() {
    return {
      allBets: []
    }
  },
  methods: {
    getAllBets() {
      axios.get('https://playbook-api-399674c1bec2.herokuapp.com/api/v1/bets/').then((response) => {
        this.allBets = response.data.bets
      })
    },
    login() {
      axios
        .post('https://playbook-api-399674c1bec2.herokuapp.com/api/v1/auth/login/', {
          email: 'brad.bb.bell@gmail.com',
          password: 'passwordbb'
        })
        .then((response) => {
          this.username = response.data.username
          const token = response.data.token
          localStorage.setItem('token', token)
          if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          }
        })
    },
    logout() {
      localStorage.removeItem('token')
      axios.defaults.headers.common['Authorization'] = ''
    }
  },
  mounted() {
    this.getAllBets()
  }
}
</script>
