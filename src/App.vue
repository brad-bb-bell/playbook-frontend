<template>
  <main class="bg-black">
    <h1 class="py-4 text-center font-matemasie text-6xl tracking-wider text-white">Playbook</h1>
    <section class="py-4 text-center font-anek-devanagari text-xl text-white">
      <!-- Will have to add a conditional if there are no bets -->
      <Card class="mx-auto w-1/5">
        <CardHeader>
          <CardTitle
            ><DropdownMenu>
              <DropdownMenuTrigger>{{ allSports[0] }}</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel class="text-center">Sports</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem v-for="sport in allSports" :key="sport">{{
                  sport
                }}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>All Sports</DropdownMenuItem>
              </DropdownMenuContent> </DropdownMenu
            >&nbsp;&nbsp;
            <DropdownMenu>
              <DropdownMenuTrigger>{{ allSeasons[0] }}</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel class="text-center">Season</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  v-for="season in allSeasons"
                  :key="season"
                  @click="console.log(season)"
                  >{{ season }}</DropdownMenuItem
                >
                <DropdownMenuSeparator />
                <DropdownMenuItem>All Seasons</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Record: {{ record }}</p>
          <p>Winnings: ${{ amountTotal }}</p>
        </CardContent>
      </Card>
    </section>

    <section class="mx-auto w-4/5 max-w-[800px] py-4">
      <apexchart type="line" :options="chartOptions" :series="chartSeries"></apexchart>
    </section>

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
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
      allSports: [],
      allSeasons: [],
      amountWon: 0,
      amountLost: 0,
      amountTotal: 0,
      chartData: [],
      chartOptions: {
        chart: {
          type: 'line',
          height: 200,
          background: '#000000',
          toolbar: {
            show: false
          }
        },
        title: {
          text: 'Total Winnings',
          align: 'center',
          style: {
            color: '#FFFFFF'
          }
        },
        xaxis: {
          categories: Array.from({ length: 22 }, (_, i) => `Week ${i + 1}`),
          labels: {
            hideOverlappingLabels: true,
            style: {
              colors: '#FFFFFF'
            }
          },
          crosshairs: {
            show: false
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
          curve: 'straight'
        },
        grid: {
          borderColor: '#333333'
        },
        dataLabels: {
          enabled: false
        },
        tooltip: {
          custom: function ({ series, seriesIndex, dataPointIndex, w }) {
            const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex]
            return `<div class="custom-tooltip">
              <span class="week-header">Week ${dataPointIndex + 1}</span>
              <span class="week-record">${data.weekRecord}</span>
              <div class="tooltip-row">
                <span>Week:</span>
                <span>$${data.weekWinnings}</span>
              </div>
              <div class="tooltip-row">
                <span>Total:</span>
                <span>$${data.totalWinnings}</span>
              </div>
            </div>`
          }
        },
        colors: ['#c089e8']
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

      const weeklyData = weeks.map((week) => {
        return {
          week,
          wins: 0,
          losses: 0,
          pushes: 0,
          weekWinnings: 0,
          totalWinnings: 0
        }
      })

      this.allBets.forEach((bet) => {
        const weekIndex = bet.week - 1
        if (bet.result === 'win') {
          weeklyData[weekIndex].wins++
          weeklyData[weekIndex].weekWinnings += bet.betPayout
          cumulativeWinnings += bet.betPayout
        } else if (bet.result === 'loss') {
          weeklyData[weekIndex].losses++
          weeklyData[weekIndex].weekWinnings -= bet.betAmount
          cumulativeWinnings -= bet.betAmount
        } else if (bet.result === 'push') {
          weeklyData[weekIndex].pushes++
        }
        weeklyData[weekIndex].totalWinnings = cumulativeWinnings
      })

      this.chartSeries[0].data = weeklyData.map((item) => ({
        x: `Week ${item.week}`,
        y: item.totalWinnings,
        weekRecord: `${item.wins}-${item.losses}-${item.pushes}`,
        weekWinnings: item.weekWinnings,
        totalWinnings: item.totalWinnings
      }))
    },
    calculateStats(bets) {
      const wins = bets.filter((bet) => bet.result === 'win').length
      const amountWon = bets.reduce((sum, bet) => {
        return bet.result === 'win' ? sum + bet.betPayout : sum
      }, 0)

      const losses = bets.filter((bet) => bet.result === 'loss').length
      const amountLost = bets.reduce((sum, bet) => {
        return bet.result === 'loss' ? sum + bet.betAmount : sum
      }, 0)

      const amountTotal = amountWon - amountLost
      const pushes = bets.filter((bet) => bet.result === 'push').length
      const record = `${wins}-${losses}-${pushes}`

      // Count the number of bets for each sport
      const sportCounts = bets.reduce((acc, bet) => {
        acc[bet.sport] = (acc[bet.sport] || 0) + 1
        return acc
      }, {})

      // Create an array of unique sports, sorted by frequency
      const allSports = Object.keys(sportCounts).sort((a, b) => sportCounts[b] - sportCounts[a])

      const seasonCounts = bets.reduce((acc, bet) => {
        acc[bet.season] = (acc[bet.season] || 0) + 1
        return acc
      }, {})
      // Create an array of unique years, sorted by most recent year first
      const allSeasons = Object.keys(seasonCounts)
        .map(Number) // Convert string years to numbers
        .sort((a, b) => b - a) // Sort in descending order

      this.wins = wins
      this.losses = losses
      this.pushes = pushes
      this.record = record
      this.allSports = allSports
      this.allSeasons = allSeasons
      this.amountWon = amountWon
      this.amountLost = amountLost
      this.amountTotal = amountTotal
    },
    async getAllBets() {
      try {
        const response = await axios.get(
          'https://playbook-api-399674c1bec2.herokuapp.com/api/v1/bets/'
        )
        this.allBets = response.data.bets
        this.calculateStats(this.allBets)
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
<style>
.custom-tooltip {
  background: #f3f3f3;
  padding: 10px;
  border-radius: 5px;
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
}
.week-header {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}
.week-record {
  display: block;
  margin-bottom: 2px;
}
.tooltip-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
