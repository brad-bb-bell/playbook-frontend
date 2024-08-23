<template>
  <main class="bg-black">
    <h1 class="py-4 text-center font-matemasie text-6xl tracking-wider text-white">Playbook</h1>
    <section class="py-4 text-center font-anek-devanagari text-xl text-white">
      <Card class="mx-auto w-[222px]">
        <CardHeader>
          <CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger>{{ selectedSport }}</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel class="text-center">Sports</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  v-for="sport in allSports"
                  :key="sport"
                  @click="handleSportClick(sport)"
                  >{{ sport }}</DropdownMenuItem
                >
              </DropdownMenuContent>
            </DropdownMenu>
            &nbsp;
            <DropdownMenu>
              <DropdownMenuTrigger>{{ selectedSeason }}</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel class="text-center">Season</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  v-for="season in allSeasons"
                  :key="season"
                  @click="handleSeasonClick(season)"
                  >{{ season }}</DropdownMenuItem
                >
              </DropdownMenuContent>
            </DropdownMenu>
          </CardTitle>
          <hr class="mx-auto mt-auto w-3/4 border-gray-300" />
        </CardHeader>
        <CardContent>
          <p>Record: {{ record }}</p>
          <p>Winnings: ${{ amountTotal }}</p>
        </CardContent>
      </Card>
    </section>

    <section class="py-4 text-center">
      <Button size="lg" variant="default" class="" @click="enterNewBet">Enter new bet</Button>
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

import { Button } from '@/components/ui/button'
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
    Button,
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
      selectedSport: '',
      selectedSeason: '',
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
    enterNewBet() {
      console.log('Enter new bet')
    },
    handleSportClick(sport) {
      this.selectedSport = sport
      this.filterAndUpdateBets()
    },
    handleSeasonClick(season) {
      this.selectedSeason = season
      this.filterAndUpdateBets()
    },
    filterAndUpdateBets() {
      let filteredBets = this.allBets

      // Filter by sport
      if (this.selectedSport !== 'All Sports') {
        filteredBets = filteredBets.filter((bet) => bet.sport === this.selectedSport)
      }

      // Filter by season
      if (this.selectedSeason !== 'All Seasons') {
        filteredBets = filteredBets.filter((bet) => bet.season === this.selectedSeason)
      }

      // Calculate stats for filtered bets
      const filteredStats = this.calculateStats(filteredBets)

      // Update component data with filtered stats
      this.record = filteredStats.record
      this.amountWon = filteredStats.amountWon
      this.amountLost = filteredStats.amountLost
      this.amountTotal = filteredStats.amountTotal

      // Prepare chart data for filtered bets
      this.prepareChartData(filteredBets)
    },
    getBetTypeLabel(betType) {
      return this.betTypeLabels[betType] || betType
    },
    prepareChartData(bets) {
      // ... (update your existing prepareChartData to accept bets as an argument)
      const weeks = Array.from({ length: 22 }, (_, i) => i + 1)
      let cumulativeWinnings = 0

      const weeklyData = weeks.map((week) => ({
        week,
        wins: 0,
        losses: 0,
        pushes: 0,
        weekWinnings: 0,
        totalWinnings: 0
      }))

      bets.forEach((bet) => {
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
      const allSports = [
        'All Sports',
        ...Object.keys(sportCounts).sort((a, b) => sportCounts[b] - sportCounts[a])
      ]

      const seasonCounts = bets.reduce((acc, bet) => {
        acc[bet.season] = (acc[bet.season] || 0) + 1
        return acc
      }, {})
      // Create an array of unique seasons, sorted by most recent season first
      const allSeasons = [
        'All Seasons',
        ...Object.keys(seasonCounts).sort((a, b) => b.localeCompare(a))
      ]

      return {
        wins,
        losses,
        pushes,
        record,
        allSports,
        allSeasons,
        amountWon,
        amountLost,
        amountTotal
      }
    },
    async getAllBets() {
      try {
        const response = await axios.get(
          'https://playbook-api-399674c1bec2.herokuapp.com/api/v1/bets/'
        )
        this.allBets = response.data.bets

        // Calculate initial stats for all bets
        const initialStats = this.calculateStats(this.allBets)

        // Update component data with initial stats
        this.record = initialStats.record
        this.allSports = initialStats.allSports
        this.allSeasons = initialStats.allSeasons
        this.amountWon = initialStats.amountWon
        this.amountLost = initialStats.amountLost
        this.amountTotal = initialStats.amountTotal

        // Set initial selections
        this.selectedSport = this.allSports[1] || 'All Sports'
        this.selectedSeason = this.allSeasons[1] || 'All Seasons'

        // Prepare initial chart data
        this.prepareChartData(this.allBets)
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
