<template>
  <main>
    <h1 class="text-center text-2xl">Playbook</h1>
    <div v-for="bet in allBets" :key="bet._id">
      <Card class="w-[300px]">
        <CardHeader>
          <CardTitle>{{ bet.betType }}</CardTitle>
          <CardDescription>{{ bet._id }}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{{ bet.team[0] }} {{ bet.line[0] }} {{ bet.opponent[0] }}</p>
          <p>{{ bet.betAmound }} {{ bet.odds }}</p>
        </CardContent>
        <CardFooter>
          {{ bet.result }}
        </CardFooter>
      </Card>
    </div>
  </main>
</template>
<script>
import axios from 'axios'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export default {
  components: {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
  },
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
