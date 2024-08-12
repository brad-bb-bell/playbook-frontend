<template>
  <h1 class="text-center text-2xl">Playbook for {{ username }}</h1>
</template>
<script>
import axios from 'axios'

export default {
  data() {
    return {
      username: ''
    }
  },
  methods: {
    login() {
      axios
        .post('https://playbook-api-be781a173fb8.herokuapp.com/api/v1/auth/login/', {
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
    this.login()
  }
}
</script>
