<template>
  <main class="bg-black">
    <h1 class="font-matemasie py-4 text-center text-6xl text-white">Playbook</h1>
    <section class="font-anek-devanagari py-4 text-center text-xl text-white">
      <p>Sport: NFL</p>
      <p>Season: 2023</p>
      <p>Record: {{ record }}</p>
      <p>Winnings: ${{ amountTotal }}</p>
      <div class="mx-auto flex w-4/5">
        <LineChart
          :data="chartData"
          index="week"
          :categories="['Total Winnings']"
          :y-formatter="(tick, i) => (typeof tick === 'number' ? `$ ${tick}` : '')"
        />
      </div>
    </section>

    <section class="py-4">
      <h2 class="font-anek-devanagari justify-center text-center text-xl text-white underline">
        Bets
      </h2>
      <div class="mx-auto flex w-4/5">
        <Carousel class="w-full" :opts="{ align: 'start', loop: 'true' }">
          <CarouselContent class="w-[300px]">
            <CarouselItem v-for="bet in allBets" :key="bet._id" class="mx-1 h-[250px] text-center">
              <Card class="h-[250px]">
                <CardHeader>
                  <CardTitle>{{ getBetTypeLabel(bet.betType) }}</CardTitle>
                  <CardDescription>Week {{ bet.week }}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div v-for="(team, index) in bet.team" :key="index">
                    <p>
                      {{ team }} {{ bet.line[index] }} vs. {{ bet.opponent[index] }} {{ bet.odds }}
                    </p>
                  </div>
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
      </div>
    </section>
  </main>
</template>
<script>
import axios from 'axios'
import { LineChart } from '@/components/ui/chart-line'
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
    CarouselPrevious,
    LineChart
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
      chartData: [
        {
          year: 1970,
          'Export Growth Rate': 2.04,
          'Import Growth Rate': 1.53
        },
        {
          year: 1971,
          'Export Growth Rate': 1.96,
          'Import Growth Rate': 1.58
        },
        {
          year: 1972,
          'Export Growth Rate': 1.96,
          'Import Growth Rate': 1.61
        },
        {
          year: 1973,
          'Export Growth Rate': 1.93,
          'Import Growth Rate': 1.61
        },
        {
          year: 1974,
          'Export Growth Rate': 1.88,
          'Import Growth Rate': 1.67
        },
        {
          year: 1975,
          'Export Growth Rate': 1.79,
          'Import Growth Rate': 1.64
        },
        {
          year: 1976,
          'Export Growth Rate': 1.77,
          'Import Growth Rate': 1.62
        },
        {
          year: 1977,
          'Export Growth Rate': 1.74,
          'Import Growth Rate': 1.69
        },
        {
          year: 1978,
          'Export Growth Rate': 1.74,
          'Import Growth Rate': 1.7
        },
        {
          year: 1979,
          'Export Growth Rate': 1.77,
          'Import Growth Rate': 1.67
        },
        {
          year: 1980,
          'Export Growth Rate': 1.79,
          'Import Growth Rate': 1.7
        },
        {
          year: 1981,
          'Export Growth Rate': 1.81,
          'Import Growth Rate': 1.72
        },
        {
          year: 1982,
          'Export Growth Rate': 1.84,
          'Import Growth Rate': 1.73
        },
        {
          year: 1983,
          'Export Growth Rate': 1.77,
          'Import Growth Rate': 1.73
        },
        {
          year: 1984,
          'Export Growth Rate': 1.78,
          'Import Growth Rate': 1.78
        },
        {
          year: 1985,
          'Export Growth Rate': 1.78,
          'Import Growth Rate': 1.81
        },
        {
          year: 1986,
          'Export Growth Rate': 1.82,
          'Import Growth Rate': 1.89
        },
        {
          year: 1987,
          'Export Growth Rate': 1.82,
          'Import Growth Rate': 1.91
        },
        {
          year: 1988,
          'Export Growth Rate': 1.77,
          'Import Growth Rate': 1.94
        },
        {
          year: 1989,
          'Export Growth Rate': 1.76,
          'Import Growth Rate': 1.94
        },
        {
          year: 1990,
          'Export Growth Rate': 1.75,
          'Import Growth Rate': 1.97
        },
        {
          year: 1991,
          'Export Growth Rate': 1.62,
          'Import Growth Rate': 1.99
        },
        {
          year: 1992,
          'Export Growth Rate': 1.56,
          'Import Growth Rate': 2.12
        },
        {
          year: 1993,
          'Export Growth Rate': 1.5,
          'Import Growth Rate': 2.13
        },
        {
          year: 1994,
          'Export Growth Rate': 1.46,
          'Import Growth Rate': 2.15
        },
        {
          year: 1995,
          'Export Growth Rate': 1.43,
          'Import Growth Rate': 2.17
        },
        {
          year: 1996,
          'Export Growth Rate': 1.4,
          'Import Growth Rate': 2.2
        },
        {
          year: 1997,
          'Export Growth Rate': 1.37,
          'Import Growth Rate': 2.15
        },
        {
          year: 1998,
          'Export Growth Rate': 1.34,
          'Import Growth Rate': 2.07
        },
        {
          year: 1999,
          'Export Growth Rate': 1.32,
          'Import Growth Rate': 2.05
        },
        {
          year: 2000,
          'Export Growth Rate': 1.33,
          'Import Growth Rate': 2.07
        },
        {
          year: 2001,
          'Export Growth Rate': 1.31,
          'Import Growth Rate': 2.08
        },
        {
          year: 2002,
          'Export Growth Rate': 1.29,
          'Import Growth Rate': 2.1
        },
        {
          year: 2003,
          'Export Growth Rate': 1.27,
          'Import Growth Rate': 2.15
        },
        {
          year: 2004,
          'Export Growth Rate': 1.27,
          'Import Growth Rate': 2.21
        },
        {
          year: 2005,
          'Export Growth Rate': 1.26,
          'Import Growth Rate': 2.23
        },
        {
          year: 2006,
          'Export Growth Rate': 1.26,
          'Import Growth Rate': 2.29
        },
        {
          year: 2007,
          'Export Growth Rate': 1.27,
          'Import Growth Rate': 2.34
        },
        {
          year: 2008,
          'Export Growth Rate': 1.26,
          'Import Growth Rate': 2.36
        },
        {
          year: 2009,
          'Export Growth Rate': 1.26,
          'Import Growth Rate': 2.36
        },
        {
          year: 2010,
          'Export Growth Rate': 1.25,
          'Import Growth Rate': 2.35
        },
        {
          year: 2011,
          'Export Growth Rate': 1.24,
          'Import Growth Rate': 2.34
        },
        {
          year: 2012,
          'Export Growth Rate': 1.25,
          'Import Growth Rate': 2.39
        },
        {
          year: 2013,
          'Export Growth Rate': 1.22,
          'Import Growth Rate': 2.3
        },
        {
          year: 2014,
          'Export Growth Rate': 1.2,
          'Import Growth Rate': 2.35
        },
        {
          year: 2015,
          'Export Growth Rate': 1.17,
          'Import Growth Rate': 2.39
        },
        {
          year: 2016,
          'Export Growth Rate': 1.16,
          'Import Growth Rate': 2.41
        },
        {
          year: 2017,
          'Export Growth Rate': 1.13,
          'Import Growth Rate': 2.44
        },
        {
          year: 2018,
          'Export Growth Rate': 1.07,
          'Import Growth Rate': 2.45
        },
        {
          year: 2019,
          'Export Growth Rate': 1.03,
          'Import Growth Rate': 2.47
        },
        {
          year: 2020,
          'Export Growth Rate': 0.92,
          'Import Growth Rate': 2.48
        },
        {
          year: 2021,
          'Export Growth Rate': 0.82,
          'Import Growth Rate': 2.51
        }
      ]
    }
  },
  methods: {
    getBetTypeLabel(betType) {
      return this.betTypeLabels[betType] || betType
    },
    prepareChartData() {
      const weeks = Array.from({ length: 22 }, (_, i) => i + 1) // [1, 2, ..., 22]
      let cumulativeWinnings = 0

      // Initialize data structure for each week
      const weeklyWinnings = weeks.map((week) => ({
        week,
        'Total Winnings': 0
      }))

      // Calculate winnings for each week
      this.allBets.forEach((bet) => {
        const weekIndex = bet.week - 1 // Convert week to zero-based index
        if (bet.result === 'win') {
          cumulativeWinnings += bet.betPayout
        } else if (bet.result === 'loss') {
          cumulativeWinnings -= bet.betAmount
        }

        // Update the weekly winnings
        weeklyWinnings[weekIndex]['Total Winnings'] = cumulativeWinnings
      })

      this.chartData = weeklyWinnings
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
      await axios
        .get('https://playbook-api-399674c1bec2.herokuapp.com/api/v1/bets/')
        .then((response) => {
          this.allBets = response.data.bets
          this.calculateStats()
          this.prepareChartData()
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
