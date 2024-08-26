<template>
  <main class="bg-black">
    <h1 class="py-4 text-center font-matemasie text-6xl tracking-wider text-white">Playbook</h1>

    <section class="py-4 text-center">
      <Button size="lg" variant="default" class="" @click="openNewBetModal">Enter New Bet</Button>
    </section>

    <section class="py-4 text-center font-anek-devanagari text-xl text-white">
      <Card class="mx-auto w-[222px]">
        <CardHeader>
          <CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger>{{ selectedSport }}</DropdownMenuTrigger>
              <DropdownMenuContent>
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

    <section class="mx-auto w-4/5 max-w-[800px] py-4">
      <apexchart type="line" :options="chartOptions" :series="chartSeries"></apexchart>
    </section>

    <section class="py-4">
      <h2 class="justify-center text-center font-anek-devanagari text-2xl text-white">
        <DropdownMenu>
          <DropdownMenuTrigger>{{ selectedBetResult }}</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              v-for="result in resultOptions"
              :key="result"
              @click="handleResultClick(result)"
              >{{ result }}</DropdownMenuItem
            >
          </DropdownMenuContent> </DropdownMenu
        >&nbsp; Bets
      </h2>
      <div class="mx-auto flex w-4/5 max-w-[800px]">
        <Carousel class="w-full" :opts="{ align: 'start', loop: 'true' }">
          <CarouselContent class="w-[300px]">
            <CarouselItem
              v-for="bet in cardCarousel"
              :key="bet._id"
              class="mx-1 h-[250px] text-center"
              @click="openEditBetModal(bet)"
            >
              <Card class="flex h-[250px] flex-col justify-between">
                <CardHeader>
                  <CardTitle>{{ getBetTypeLabel(bet.betType) }}</CardTitle>
                  <CardDescription>Week {{ bet.week }}</CardDescription>
                </CardHeader>
                <CardContent class="flex-grow">
                  <div v-if="['2-team-teaser', '3-team-teaser', 'parlay'].includes(bet.betType)">
                    <div v-for="(team, index) in bet.team" :key="index">
                      <p>{{ team }} {{ bet.line[index] }} vs. {{ bet.opponent[index] }}</p>
                    </div>
                    <p class="mt-2">{{ bet.odds }}</p>
                  </div>
                  <div v-else>
                    <div v-for="(team, index) in bet.team" :key="index">
                      <p>
                        {{ team }} {{ bet.line[index] }} vs. {{ bet.opponent[index] }}
                        {{ bet.odds }}
                      </p>
                    </div>
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

  <!-- Edit Bet Modal -->
  <transition name="fade">
    <div v-if="showEditBetModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <button
        class="absolute inset-0 h-full w-full bg-black bg-opacity-90 p-0 focus:outline-none"
        @click="closeEditBetModal"
        aria-label="Close modal"
      >
        <div class="h-full w-full"></div>
      </button>
      <Card class="z-10 w-96">
        <form @submit.prevent="handleEditSubmit">
          <CardHeader>
            <CardTitle class="text-center">Modify Bet</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="mb-2 text-center">
              <DropdownMenu>
                <DropdownMenuTrigger class="text-xl">{{ editBet.sport }}</DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    v-for="sport in modalSportOptions"
                    :key="sport"
                    @click="this.editBet.sport = sport"
                    >{{ sport }}</DropdownMenuItem
                  >
                </DropdownMenuContent>
              </DropdownMenu>
              &nbsp;
              <DropdownMenu>
                <DropdownMenuTrigger class="text-xl">{{ editBet.season }}</DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    v-for="season in modalSeasonOptions"
                    :key="season"
                    @click="this.editBet.season = season"
                    >{{ season }}</DropdownMenuItem
                  >
                </DropdownMenuContent>
              </DropdownMenu>
              <br />
              <DropdownMenu>
                <DropdownMenuTrigger>{{ editBet.betType }}</DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    v-for="betType in betTypeLabels"
                    :key="betType"
                    @click="this.editBet.betType = betType"
                    >{{ betType }}</DropdownMenuItem
                  >
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div class="grid max-w-md grid-cols-[auto,1fr] items-center gap-x-4 gap-y-2">
              <template v-if="editBet.betType !== 'future'">
                <label for="week" class="text-left">Week:</label>
                <Input id="week" type="number" class="w-2/3" required v-model="editBet.week" />
              </template>

              <label for="team" class="text-left">Team:</label>
              <Input id="team" type="text" class="w-2/3" required v-model="editBet.team" />

              <template v-if="editBet.betType !== 'future'">
                <label for="opponent" class="text-left">Opponent:</label>
                <Input
                  id="opponent"
                  type="text"
                  class="w-2/3"
                  required
                  v-model="editBet.opponent"
                />
              </template>

              <template v-if="editBet.betType !== 'moneyline' && editBet.betType !== 'future'">
                <label for="line" class="text-left">Line:</label>
                <Input id="line" type="text" class="w-2/3" required v-model="editBet.line" />
              </template>

              <label for="betAmount" class="text-left">Bet Amount:</label>
              <Input
                id="betAmount"
                type="number"
                step="1"
                class="w-2/3"
                required
                v-model="editBet.betAmount"
              />

              <label for="odds" class="text-left">Odds:</label>
              <Input id="odds" type="text" class="w-2/3" required v-model="editBet.odds" />

              <label for="payout" class="text-left">Payout:</label>
              <Input
                id="payout"
                type="number"
                step="1"
                class="w-2/3"
                required
                v-model="editBet.betPayout"
              />

              <label for="note" class="text-left">Notes:</label>
              <Textarea id="note" class="w-full" v-model="editBet.notes" />
            </div>

            <div class="mt-2 text-center">
              <DropdownMenu>
                <DropdownMenuTrigger>{{ editBet.result }}</DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    v-for="result in resultOptions"
                    @click="this.editBet.result = result.toLowerCase()"
                    >{{ result }}</DropdownMenuItem
                  >
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
          <CardFooter class="flex justify-end">
            <Button type="button" variant="secondary" @click="closeEditBetModal">Cancel</Button>
            <Button type="submit" class="ml-2" variant="default">Save Bet</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  </transition>

  <!-- New Bet Modal -->
  <transition name="fade">
    <div v-if="showNewBetModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black bg-opacity-90" @click="closeNewBetModal"></div>
      <Card class="z-10 w-96">
        <form @submit.prevent="handleSubmit">
          <CardHeader>
            <CardTitle class="text-center">Enter New Bet</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="mb-2 text-center">
              <DropdownMenu>
                <DropdownMenuTrigger class="text-xl">{{ modalSelectedSport }}</DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    v-for="sport in modalSportOptions"
                    @click="handleModalSportClick(sport)"
                    >{{ sport }}</DropdownMenuItem
                  >
                </DropdownMenuContent>
              </DropdownMenu>
              &nbsp;
              <DropdownMenu>
                <DropdownMenuTrigger class="text-xl">{{ modalSelectedSeason }}</DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    v-for="season in modalSeasonOptions"
                    @click="handleModalSeasonClick(season)"
                    >{{ season }}</DropdownMenuItem
                  >
                </DropdownMenuContent>
              </DropdownMenu>
              <br />
              <DropdownMenu>
                <DropdownMenuTrigger>{{ modalSelectedBetType }}</DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    v-for="betType in betTypeLabels"
                    @click="handleModalBetTypeClick(betType)"
                    >{{ betType }}</DropdownMenuItem
                  >
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div class="grid max-w-md grid-cols-[auto,1fr] items-center gap-x-4 gap-y-2">
              <template v-if="modalSelectedBetTypeValue !== 'future'">
                <label for="week" class="text-left">Week:</label>
                <Input id="week" type="number" class="w-2/3" required v-model="newBet.week" />
              </template>

              <label for="team" class="text-left">Team:</label>
              <Input id="team" type="text" class="w-2/3" required v-model="newBet.team" />

              <template v-if="modalSelectedBetTypeValue !== 'future'">
                <label for="opponent" class="text-left">Opponent:</label>
                <Input id="opponent" type="text" class="w-2/3" required v-model="newBet.opponent" />
              </template>

              <template
                v-if="
                  modalSelectedBetTypeValue !== 'moneyline' &&
                  modalSelectedBetTypeValue !== 'future'
                "
              >
                <label for="line" class="text-left">Line:</label>
                <Input id="line" type="text" class="w-2/3" required v-model="newBet.line" />
              </template>

              <label for="betAmount" class="text-left">Bet Amount:</label>
              <Input
                id="betAmount"
                type="number"
                step="1"
                class="w-2/3"
                required
                v-model="newBet.betAmount"
              />

              <label for="odds" class="text-left">Odds:</label>
              <Input id="odds" type="text" class="w-2/3" required v-model="newBet.odds" />

              <label for="payout" class="text-left">Payout:</label>
              <Input
                id="payout"
                type="number"
                step="1"
                class="w-2/3"
                required
                v-model="newBet.betPayout"
              />

              <label for="note" class="text-left">Notes:</label>
              <Textarea id="note" class="w-full" v-model="newBet.notes" />
            </div>

            <div class="mt-2 text-center">
              <DropdownMenu>
                <DropdownMenuTrigger>{{ modalSelectedResult }}</DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    v-for="result in resultOptions"
                    @click="handleModalResultClick(result)"
                    >{{ result }}</DropdownMenuItem
                  >
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
          <CardFooter class="flex justify-end">
            <Button type="button" variant="secondary" @click="closeNewBetModal">Cancel</Button>
            <Button type="submit" class="ml-2" variant="default">Save Bet</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  </transition>
</template>
<script>
import axios from 'axios'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
    DropdownMenuTrigger,
    Input,
    Textarea
  },
  data() {
    return {
      allBets: [],
      chartBets: [],
      cardCarousel: [],
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
      modalSelectedSport: '',
      modalSportOptions: ['NFL', 'NBA'],
      modalSelectedSeason: '',
      modalSeasonOptions: ['2023', '2024'],
      modalSelectedBetType: 'Spread',
      modalSelectedBetTypeValue: 'spread',
      modalSelectedResult: 'Pending',
      resultOptions: ['Pending', 'Win', 'Loss', 'Push'],
      selectedBetResult: 'Pending',
      newBet: {
        sport: '',
        season: '',
        betType: '',
        week: '',
        team: '',
        line: '',
        opponent: '',
        betAmount: '',
        odds: '',
        betPayout: '',
        notes: '',
        result: 'pending'
      },
      editBet: {},
      showNewBetModal: false,
      showEditBetModal: false,
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
          custom({ series, seriesIndex, dataPointIndex, w }) {
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
    closeEditBetModal() {
      this.showEditBetModal = false
    },
    openEditBetModal(bet) {
      this.showEditBetModal = true

      // Create a deep copy of the bet object
      this.editBet = JSON.parse(JSON.stringify(bet))

      // Convert arrays to comma-separated strings
      for (const key in this.editBet) {
        if (Array.isArray(this.editBet[key])) {
          this.editBet[key] = this.editBet[key].join(', ')
        }
      }
    },
    handleResultClick(result) {
      this.cardCarousel = this.allBets
        .filter((bet) => bet.result === result.toLowerCase())
        .sort((a, b) => new Date(b.date) - new Date(a.date))
      this.selectedBetResult = result
    },
    async submitEditBet() {
      try {
        // Create a copy of the newBet object
        const betToSubmit = { ...this.editBet }

        // Convert team, opponent, and line to arrays if they contain commas
        ;['team', 'opponent', 'line'].forEach((field) => {
          if (typeof betToSubmit[field] === 'string' && betToSubmit[field].includes(',')) {
            betToSubmit[field] = betToSubmit[field].split(',').map((item) => item.trim())
          }
        })

        const response = await axios.patch(
          `https://playbook-api-399674c1bec2.herokuapp.com/api/v1/bets/${this.editBet._id}`,
          betToSubmit
        )
        // Find the index of the bet to update in allBets
        const betIndex = this.allBets.findIndex((bet) => bet._id === this.editBet._id)

        if (betIndex !== -1) {
          // Update the bet in the allBets array
          this.allBets[betIndex] = response.data.bet

          this.cardCarousel = this.allBets
            .filter((bet) => bet.result === this.selectedBetResult.toLowerCase())
            .sort((a, b) => new Date(b.date) - new Date(a.date))
        } else {
          console.warn('Edited bet not found in allBets array')
        }
        this.filterAndUpdateBets()
      } catch (error) {
        console.error('Error submitting new bet: ', error)
      }
    },
    async submitNewBet() {
      try {
        // Create a copy of the newBet object
        const betToSubmit = { ...this.newBet }

        // Convert team, opponent, and line to arrays if they contain commas
        ;['team', 'opponent', 'line'].forEach((field) => {
          if (typeof betToSubmit[field] === 'string' && betToSubmit[field].includes(',')) {
            betToSubmit[field] = betToSubmit[field].split(',').map((item) => item.trim())
          }
        })

        const response = await axios.post(
          'https://playbook-api-399674c1bec2.herokuapp.com/api/v1/bets/',
          betToSubmit
        )
        this.allBets.push(response.data.bet)
        this.filterAndUpdateBets()
      } catch (error) {
        console.error('Error submitting new bet: ', error)
      }
    },
    handleSubmit() {
      console.log('Form submitted: ', this.newBet)
      this.submitNewBet()
      this.closeNewBetModal()
      this.newBet = {
        sport: '',
        season: '',
        betType: '',
        week: '',
        team: '',
        line: '',
        opponent: '',
        betAmount: '',
        odds: '',
        betPayout: '',
        notes: '',
        result: 'pending'
      }
    },
    handleEditSubmit() {
      this.submitEditBet()
      this.closeEditBetModal()
    },
    handleModalResultClick(result) {
      this.modalSelectedResult = result
      this.newBet.result = result.toLowerCase()
    },
    handleModalBetTypeClick(type) {
      Object.keys(this.betTypeLabels).forEach((key) => {
        if (this.betTypeLabels[key] === type) {
          this.modalSelectedBetTypeValue = key
          this.modalSelectedBetType = type
          this.newBet.betType = key
        }
      })
    },
    handleModalSportClick(sport) {
      this.modalSelectedSport = sport
      this.newBet.sport = sport
    },
    handleModalSeasonClick(season) {
      this.modalSelectedSeason = season
      this.newBet.season = season
    },
    openNewBetModal() {
      this.showNewBetModal = true
      document.body.style.overflow = 'hidden' // Prevent scrolling
    },
    closeNewBetModal() {
      this.showNewBetModal = false
      document.body.style.overflow = '' // Re-enable scrolling
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
      filteredBets = filteredBets.filter((bet) => bet.sport === this.selectedSport)
      // Filter by season
      filteredBets = filteredBets.filter((bet) => bet.season == this.selectedSeason)

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
      // Find the maximum week number from the bets
      const maxWeek = Math.max(...bets.map((bet) => bet.week), 0)

      // Use maxWeek as the number of weeks to display
      const weeks = Array.from({ length: maxWeek }, (_, i) => i + 1)
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

      // Update chart options to show only the weeks with data
      this.chartOptions.xaxis.categories = weeks.map((week) => `Week ${week}`)
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
        ...Object.keys(sportCounts).sort((a, b) => sportCounts[b] - sportCounts[a])
      ]

      const seasonCounts = bets.reduce((acc, bet) => {
        acc[bet.season] = (acc[bet.season] || 0) + 1
        return acc
      }, {})
      // Create an array of unique seasons, sorted by most recent season first
      const allSeasons = [...Object.keys(seasonCounts).sort((a, b) => b.localeCompare(a))]

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
        const initialStats = this.calculateStats(
          this.allBets.filter((bet) => bet.status !== 'pending')
        )

        // Update component data with initial stats
        this.record = initialStats.record
        this.allSports = initialStats.allSports
        this.allSeasons = initialStats.allSeasons
        this.amountWon = initialStats.amountWon
        this.amountLost = initialStats.amountLost
        this.amountTotal = initialStats.amountTotal

        // Set initial selections
        this.selectedSport = this.allSports[0] || 'NFL'
        this.selectedSeason = this.allSeasons[0] || '2023'
        this.modalSelectedSport = 'NFL'
        this.modalSelectedSeason = '2024'
        this.newBet.sport = 'NFL'
        this.newBet.season = '2024'
        this.newBet.betType = 'spread'

        // Prepare initial chart data
        this.filterAndUpdateBets()

        // Add pending bets to cardCarousel and sort by most recent
        this.cardCarousel = this.allBets
          .filter((bet) => bet.result === 'pending')
          .sort((a, b) => new Date(b.date) - new Date(a.date))
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
          const { token } = response.data
          localStorage.setItem('token', token)
          if (token) {
            axios.defaults.headers.common.Authorization = `Bearer ${token}`
          }
        })
    },
    logout() {
      localStorage.removeItem('token')
      axios.defaults.headers.common.Authorization = ''
    }
  },
  mounted() {
    this.login()
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
