<template>
  <main>
    <h1 class="py-4 text-center text-6xl text-white">Playbook</h1>
    <section class="flex justify-center">
      <Carousel class="w-full max-w-sm" :opts="{ align: 'start' }">
        <CarouselContent class="mx-1">
          <Card v-for="bet in allBets" :key="bet._id" class="mx-1 w-[300px] text-center">
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
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'

export default {
  components: {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
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
