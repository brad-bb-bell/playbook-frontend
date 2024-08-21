<template>
  <main class="bg-black">
    <h1 class="py-4 text-center font-matemasie text-6xl tracking-wider text-white">Playbook</h1>
    <section class="py-4 text-center font-anek-devanagari text-xl text-white">
      <p>Sport: NFL</p>
      <p>Season: 2023</p>
      <p>Record: {{ record }}</p>
      <p>Winnings: ${{ amountTotal }}</p>
      <div class="mx-auto flex w-4/5"></div>
    </section>

    <apexchart type="line" :options="chartOptions" :series="chartSeries"></apexchart>

    <section class="py-4">
      <h2 class="justify-center text-center font-anek-devanagari text-xl text-white underline">
        Bets
      </h2>
      <div class="mx-auto flex w-4/5">
        <Carousel class="w-full" :opts="{ align: 'start', loop: 'true' }">
          <CarouselContent class="w-[300px]">
            <CarouselItem v-for="bet in allBets" :key="bet._id" class="mx-1 h-[250px] text-center">
              <Card class="flex h-[250px] flex-col justify-between">
                <CardHeader>
                  <CardTitle>{{ getBetTypeLabel(bet.betType) }}</CardTitle>
                  <CardDescription>Week {{ bet.week }}</CardDescription>
                </CardHeader>
                <CardContent class="flex-grow">
                  <div v-for="(team, index) in bet.team" :key="index">
                    <p>
                      {{ team }} {{ bet.line[index] }} vs. {{ bet.opponent[index] }} {{ bet.odds }}
                    </p>
                  </div>
                </CardContent>
                <CardFooter class="mx-auto mt-auto">
                  {{
                    bet.result === 'pending'
                      ? `Risk: $${bet.betAmount} Payout: $${bet.betPayout}`
                      : `Status: ${bet.result} ${
                          bet.result === 'win'
                            ? '+$' + bet.betPayout
                            : bet.result === 'push'
                              ? '+$0'
                              : '-$' + bet.betAmount
                        }`
                  }}
                </CardFooter>
              </Card>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  </main>
  <!-- <CustomChartTooltip :data="chartData" /> -->
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
      betTypeLabels: {
        spread: 'Spread',
        moneyline: 'Moneyline',
        'over-under': 'Over/Under',
        future: 'Future',
        parlay: 'Parlay',
        '2-team-teaser': '2 Team Teaser',
        '3-team-teaser': '3 Team Teaser'
      },
      record: '',
      amountWon: 0,
      amountLost: 0,
      amountTotal: 0,
      chartData: [],
      chartOptions: {
        chart: {
          type: 'line',
          height: 350,
          background: '#000000'
        },
        title: {
          text: 'Total Winnings Over Time',
          align: 'left',
          style: {
            color: '#FFFFFF'
          }
        },
        xaxis: {
          categories: Array.from({ length: 22 }, (_, i) => `Week ${i + 1}`),
          labels: {
            style: {
              colors: '#FFFFFF'
            }
          }
        },
        yaxis: {
          labels: {
            style: {
              colors: '#FFFFFF'
            }
          }
        },
        stroke: {
          curve: 'smooth'
        },
        grid: {
          borderColor: '#333333'
        },
        dataLabels: {
          enabled: false
        },
        tooltip: {
          theme: 'dark'
        }
      },
      chartSeries: [
        {
          name: 'Total Winnings',
          data: []
        }
      ]
    }
  },
  methods: {
    getBetTypeLabel(betType) {
      return this.betTypeLabels[betType] || betType
    },
    prepareChartData() {
      const weeks = Array.from({ length: 22 }, (_, i) => i + 1)
      let cumulativeWinnings = 0

      const weeklyWinnings = weeks.map((week) => {
        return { week, winnings: 0 }
      })

      this.allBets.forEach((bet) => {
        const weekIndex = bet.week - 1
        if (bet.result === 'win') {
          cumulativeWinnings += bet.betPayout
        } else if (bet.result === 'loss') {
          cumulativeWinnings -= bet.betAmount
        }
        weeklyWinnings[weekIndex].winnings = cumulativeWinnings
      })

      this.chartSeries[0].data = weeklyWinnings.map((item) => item.winnings)
    },
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
      try {
        const response = await axios.get(
          'https://playbook-api-399674c1bec2.herokuapp.com/api/v1/bets/'
        )
        this.allBets = response.data.bets
        this.calculateStats()
        this.prepareChartData()
      } catch (error) {
        console.error('Error fetching bets:', error)
      }
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
