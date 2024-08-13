<template>
  <main>
    <h1 class="py-4 text-center text-6xl">Playbook</h1>
    <section class="py-4 text-center">
      <p>Sport: NFL</p>
      <p>Season: 2023</p>
      <p>Record: {{ record }}</p>
      <p>Winnings: ${{ amountTotal }}</p>
    </section>
    <section class="flex justify-center py-4">
      <Carousel class="w-full max-w-sm" :opts="{ align: 'start' }">
        <CarouselContent class="mx-1">
          <CarouselItem v-for="bet in allBets" :key="bet._id" class="mx-1 w-[300px] text-center">
            <Card>
              <CardHeader>
                <CardTitle>{{ bet.betType }}</CardTitle>
                <CardDescription>week: {{ bet.week }}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{{ bet.team[0] }} {{ bet.line[0] }} {{ bet.opponent[0] }}</p>
                <p>{{ bet.betAmound }} {{ bet.odds }}</p>
              </CardContent>
              <CardFooter>
                {{ bet.result }}
                {{
                  bet.result === 'win'
                    ? '+' + bet.betPayout
                    : bet.result === 'push'
                      ? '+0'
                      : '-' + bet.betAmount
                }}</CardFooter
              >
            </Card>
          </CarouselItem>
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
      allBets: [],
      record: '',
      amountWon: 0,
      amountLost: 0,
      amountTotal: 0
    }
  },
  methods: {
    calculateStats() {
      const wins = this.allBets.filter((bet) => bet.result === 'win').length
      this.amountWon = 0
      this.allBets.forEach((bet) => {
        if (bet.result === 'win') {
          this.amountWon += bet.betPayout
        }
      })
      const losses = this.allBets.filter((bet) => bet.result === 'loss').length
      this.amountLost = 0
      this.allBets.forEach((bet) => {
        if (bet.result === 'loss') {
          this.amountLost += bet.betAmount
        }
      })
      this.amountTotal = this.amountWon - this.amountLost
      const pushes = this.allBets.filter((bet) => bet.result === 'push').length
      this.record = `${wins}-${losses}-${pushes}`

      return {
        wins,
        losses,
        pushes
      }
    },
    async getAllBets() {
      await axios
        .get('https://playbook-api-399674c1bec2.herokuapp.com/api/v1/bets/')
        .then((response) => {
          this.allBets = response.data.bets
          this.calculateStats()
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
