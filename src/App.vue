<template>
  <!-- Loading Overlay -->
  <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
    <div class="text-center text-white">
      <div class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-600 border-t-white"></div>
      <p class="font-anek-devanagari text-xl">Retrieving Data</p>
    </div>
  </div>

  <main class="bg-black">
    <h1 class="py-4 text-center font-matemasie text-6xl tracking-wider text-white">Playbook</h1>

    <section class="py-4 text-center">
      <Button size="lg" variant="default" class="" @click="openNewBetModal">Enter New Bet</Button>
    </section>

    <section class="py-4 text-center font-anek-devanagari text-xl text-white">
      <div class="mx-auto flex max-w-[500px] justify-center gap-4">
        <Card class="w-[222px]">
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
            <p :class="{ 'text-red-500': amountTotal < 0 }">Winnings: ${{ amountTotal }}</p>
          </CardContent>
        </Card>
        
        <Card class="w-[222px]">
          <CardHeader>
            <CardTitle>Pending Bets</CardTitle>
            <hr class="mx-auto mt-auto w-3/4 border-gray-300" />
          </CardHeader>
          <CardContent>
            <p>At Risk: ${{ totalAtRisk }}</p>
            <p>Potential: ${{ totalPotentialWinnings }}</p>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- Chart -->
    <section class="mx-auto w-4/5 max-w-[800px] py-4">
      <apexchart type="line" :options="chartOptions" :series="chartSeries"></apexchart>
    </section>

    <!-- Bet Carousel -->
    <section class="py-4">
      <h2 class="justify-center text-center font-anek-devanagari text-2xl text-white">
        <DropdownMenu>
          <DropdownMenuTrigger>{{ selectedBetResult }}</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              v-for="result in resultFilterOptions"
              :key="result"
              @click="handleResultClick(result)"
              >{{ result }}</DropdownMenuItem
            >
          </DropdownMenuContent> </DropdownMenu
        >&nbsp;
        <DropdownMenu>
          <DropdownMenuTrigger>{{ selectedSport }}</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              v-for="sport in allSports"
              :key="sport"
              @click="handleSportClick(sport)"
              >{{ sport }}</DropdownMenuItem
            >
          </DropdownMenuContent> </DropdownMenu
        >&nbsp;
        <DropdownMenu>
          <DropdownMenuTrigger>{{ selectedSeason }}</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              v-for="season in allSeasons"
              :key="season"
              @click="handleSeasonClick(season)"
              >{{ season }}</DropdownMenuItem
            >
          </DropdownMenuContent> </DropdownMenu
        >&nbsp;&nbsp;Bets
      </h2>
      <div class="mx-auto flex w-4/5 max-w-[800px]">
        <Carousel class="w-full" :opts="{ align: 'start', loop: 'true' }">
          <CarouselContent class="w-[300px]">
            <CarouselItem v-if="cardCarousel.length === 0" class="mx-1 h-[250px] text-center">
              <Card class="flex h-[250px] flex-col items-center justify-center">
                <CardContent>
                  <p class="text-lg">No bets to be displayed</p>
                </CardContent>
              </Card>
            </CarouselItem>
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
                  <div v-if="isMultiLegType(bet.betType)">
                    <div v-for="(team, index) in bet.team" :key="index">
                      <p>{{ formatLeg(bet, index) }}</p>
                    </div>
                    <p class="mt-2">{{ bet.odds }}</p>
                  </div>
                  <div v-else>
                    <div v-for="(team, index) in bet.team" :key="index">
                      <p>{{ formatLeg(bet, index) }} {{ bet.odds }}</p>
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

    <!-- Stats by Bet Type -->
    <section
      v-if="statsByType.length"
      class="py-4 text-center font-anek-devanagari text-xl text-white"
    >
      <h2 class="text-center font-anek-devanagari text-2xl text-white">By Bet Type</h2>
      <div class="mx-auto mt-4 grid w-4/5 max-w-[800px] grid-cols-2 gap-4 md:grid-cols-3">
        <Card v-for="stats in statsByType" :key="stats.betType">
          <CardHeader>
            <CardTitle>{{ stats.label }}</CardTitle>
            <hr class="mx-auto mt-auto w-3/4 border-gray-300" />
          </CardHeader>
          <CardContent>
            <p>Record: {{ stats.record }}</p>
            <p :class="{ 'text-red-500': stats.net < 0 }">Net: ${{ stats.net }}</p>
            <p v-if="stats.pending" class="text-sm text-gray-400">{{ stats.pending }} pending</p>
          </CardContent>
        </Card>
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
                <DropdownMenuTrigger>{{ getBetTypeLabel(editBet.betType) }}</DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    v-for="(label, key) in betTypeLabels"
                    :key="key"
                    @click="handleEditBetTypeClick(key)"
                    >{{ label }}</DropdownMenuItem
                  >
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div class="grid max-w-md grid-cols-[auto,1fr] items-center gap-x-4 gap-y-2">
              <template v-if="editBet.betType !== 'future'">
                <label for="week" class="text-left">Week:</label>
                <Input id="week" type="number" class="w-2/3" required v-model="editBet.week" />
              </template>

              <template v-for="(leg, index) in editBet.legs" :key="index">
                <label :for="`edit-team-${index}`" class="text-left">{{
                  isMultiLegType(editBet.betType) ? `Team ${index + 1}:` : 'Team:'
                }}</label>
                <div class="flex items-center gap-1">
                  <Input
                    :id="`edit-team-${index}`"
                    type="text"
                    class="w-2/3"
                    required
                    :list="
                      editBet.sport === 'NFL' && editBet.betType !== 'future'
                        ? 'nfl-teams'
                        : undefined
                    "
                    v-model="leg.team"
                  />
                  <button
                    v-if="editBet.betType === 'parlay' && editBet.legs.length > 2"
                    type="button"
                    aria-label="Remove leg"
                    class="px-1 text-gray-400 hover:text-red-500"
                    @click="removeParlayLeg(editBet, index)"
                  >
                    ✕
                  </button>
                </div>

                <template v-if="editBet.betType !== 'future'">
                  <label :for="`edit-opponent-${index}`" class="text-left">Opponent:</label>
                  <Input
                    :id="`edit-opponent-${index}`"
                    type="text"
                    class="w-2/3"
                    :list="editBet.sport === 'NFL' ? 'nfl-teams' : undefined"
                    v-model="leg.opponent"
                  />
                </template>

                <template v-if="editBet.betType !== 'moneyline' && editBet.betType !== 'future'">
                  <label :for="`edit-line-${index}`" class="text-left">Line:</label>
                  <Input
                    :id="`edit-line-${index}`"
                    type="text"
                    class="w-2/3"
                    :required="editBet.betType !== 'parlay'"
                    v-model="leg.line"
                  />
                </template>
              </template>

              <template v-if="editBet.betType === 'parlay'">
                <span></span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  class="w-2/3"
                  @click="addParlayLeg(editBet)"
                  >+ Add Leg</Button
                >
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
                    v-for="result in resultFormOptions"
                    :key="result"
                    @click="this.editBet.result = result.toLowerCase()"
                    >{{ result }}</DropdownMenuItem
                  >
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p v-if="editBetError" class="mt-2 text-center text-sm text-red-500">
              {{ editBetError }}
            </p>
          </CardContent>
          <CardFooter class="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant="destructive"
              @click="deleteBet(editBet._id)"
              class="w-full"
              >Delete</Button
            >
            <Button type="button" variant="secondary" @click="closeEditBetModal" class="w-full"
              >Cancel</Button
            >
            <Button type="submit" variant="default" class="w-full">Save</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  </transition>

  <!-- New Bet Modal -->
  <transition name="fade">
    <div v-if="showNewBetModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <button
        class="absolute inset-0 h-full w-full bg-black bg-opacity-90 p-0 focus:outline-none"
        @click="closeNewBetModal"
        aria-label="Close modal"
      >
        <div class="h-full w-full"></div>
      </button>
      <Card class="z-10 w-96">
        <form @submit.prevent="handleSubmit">
          <CardHeader>
            <CardTitle class="text-center">Enter New Bet</CardTitle>
            <div class="text-center">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                :disabled="isParsingTicket"
                @click="$refs.ticketInput.click()"
                >{{ isParsingTicket ? 'Reading ticket…' : 'Upload Ticket' }}</Button
              >
              <input
                ref="ticketInput"
                type="file"
                accept="image/*"
                class="hidden"
                aria-label="Upload ticket screenshot"
                @change="handleTicketUpload"
              />
              <p v-if="parseError" class="mt-1 text-sm text-red-500">{{ parseError }}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div class="mb-2 text-center">
              <DropdownMenu>
                <DropdownMenuTrigger class="text-xl">{{ modalSelectedSport }}</DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    v-for="sport in modalSportOptions"
                    :key="sport"
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
                    :key="season"
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
                    :key="betType"
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

              <template v-for="(leg, index) in newBet.legs" :key="index">
                <label :for="`new-team-${index}`" class="text-left">{{
                  isMultiLegType(modalSelectedBetTypeValue) ? `Team ${index + 1}:` : 'Team:'
                }}</label>
                <div class="flex items-center gap-1">
                  <Input
                    :id="`new-team-${index}`"
                    type="text"
                    class="w-2/3"
                    required
                    :list="
                      newBet.sport === 'NFL' && modalSelectedBetTypeValue !== 'future'
                        ? 'nfl-teams'
                        : undefined
                    "
                    v-model="leg.team"
                  />
                  <button
                    v-if="modalSelectedBetTypeValue === 'parlay' && newBet.legs.length > 2"
                    type="button"
                    aria-label="Remove leg"
                    class="px-1 text-gray-400 hover:text-red-500"
                    @click="removeParlayLeg(newBet, index)"
                  >
                    ✕
                  </button>
                </div>

                <template v-if="modalSelectedBetTypeValue !== 'future'">
                  <label :for="`new-opponent-${index}`" class="text-left">Opponent:</label>
                  <Input
                    :id="`new-opponent-${index}`"
                    type="text"
                    class="w-2/3"
                    :list="newBet.sport === 'NFL' ? 'nfl-teams' : undefined"
                    v-model="leg.opponent"
                  />
                </template>

                <template
                  v-if="
                    modalSelectedBetTypeValue !== 'moneyline' &&
                    modalSelectedBetTypeValue !== 'future'
                  "
                >
                  <label :for="`new-line-${index}`" class="text-left">Line:</label>
                  <Input
                    :id="`new-line-${index}`"
                    type="text"
                    class="w-2/3"
                    :required="modalSelectedBetTypeValue !== 'parlay'"
                    v-model="leg.line"
                  />
                </template>
              </template>

              <template v-if="modalSelectedBetTypeValue === 'parlay'">
                <span></span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  class="w-2/3"
                  @click="addParlayLeg(newBet)"
                  >+ Add Leg</Button
                >
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
                    v-for="result in resultFormOptions"
                    :key="result"
                    @click="handleModalResultClick(result)"
                    >{{ result }}</DropdownMenuItem
                  >
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p v-if="newBetError" class="mt-2 text-center text-sm text-red-500">
              {{ newBetError }}
            </p>
          </CardContent>
          <CardFooter class="flex justify-end">
            <Button type="button" variant="secondary" @click="closeNewBetModal">Cancel</Button>
            <Button type="submit" class="ml-2" variant="default">Save Bet</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  </transition>

  <!-- Shared team typeahead for the bet form inputs -->
  <datalist id="nfl-teams">
    <option v-for="(name, abbr) in nflTeams" :key="abbr" :value="abbr">{{ name }}</option>
  </datalist>
</template>
<script>
import axios from 'axios'

import { NFL_TEAMS, normalizeNflTeam } from '@/lib/teams'
import downscaleImage from '@/lib/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  // DropdownMenuLabel,
  // DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const API_BASE =
  import.meta.env.VITE_API_BASE || 'https://playbook-api-399674c1bec2.herokuapp.com/api/v1'

// NFL seasons run into the next calendar year — January/February playoff
// bets still belong to the prior season
const now = new Date()
const CURRENT_SEASON = String(now.getMonth() < 2 ? now.getFullYear() - 1 : now.getFullYear())
const SEASON_OPTIONS = []
for (let year = 2023; year <= Number(CURRENT_SEASON); year += 1) {
  SEASON_OPTIONS.push(String(year))
}

const MULTI_LEG_BET_TYPES = ['parlay', '2-team-teaser', '3-team-teaser']
// Historical conventions the backend also allows: '' (futures),
// 'XXX' (opponent not tracked), 'BYE' (playoff-bye teaser legs)
const OPPONENT_PLACEHOLDERS = ['', 'xxx', 'bye']

const emptyLeg = () => ({ team: '', opponent: '', line: '' })

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
    // DropdownMenuLabel,
    // DropdownMenuSeparator,
    DropdownMenuTrigger,
    Input,
    Textarea,
  },
  data() {
    return {
      isLoading: true,
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
        '3-team-teaser': '3 Team Teaser',
      },
      record: '',
      allSports: [],
      allSeasons: [],
      selectedSport: '',
      selectedSeason: '',
      modalSelectedSport: '',
      modalSportOptions: ['NFL', 'NBA'],
      modalSelectedSeason: '',
      modalSeasonOptions: SEASON_OPTIONS,
      modalSelectedBetType: 'Spread',
      modalSelectedBetTypeValue: 'spread',
      modalSelectedResult: 'Pending',
      resultFilterOptions: ['Pending', 'Win', 'Loss', 'Push', 'All'],
      resultFormOptions: ['Pending', 'Win', 'Loss', 'Push'],
      selectedBetResult: 'Pending',
      nflTeams: NFL_TEAMS,
      newBet: {
        sport: '',
        season: '',
        betType: '',
        week: '',
        legs: [emptyLeg()],
        betAmount: '',
        odds: '',
        betPayout: '',
        notes: '',
        result: 'pending',
      },
      editBet: {},
      showNewBetModal: false,
      showEditBetModal: false,
      statsByType: [],
      isParsingTicket: false,
      parseError: '',
      newBetError: '',
      editBetError: '',
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
            show: false,
          },
        },
        title: {
          text: 'Total Winnings',
          align: 'center',
          style: {
            color: '#FFFFFF',
          },
        },
        xaxis: {
          categories: Array.from({ length: 22 }, (_, i) => `Week ${i + 1}`),
          labels: {
            hideOverlappingLabels: true,
            style: {
              colors: '#FFFFFF',
            },
          },
          crosshairs: {
            show: false,
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: '#FFFFFF',
            },
          },
        },
        stroke: {
          curve: 'straight',
        },
        grid: {
          borderColor: '#333333',
        },
        dataLabels: {
          enabled: false,
        },
        tooltip: {
          // removed { series } from the function signature... not sure if i'll need it in the future
          custom({ seriesIndex, dataPointIndex, w }) {
            const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex]
            return `<div class="custom-tooltip">
              <span class="week-header">Week ${data.weekNumber}</span>
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
          },
        },
        colors: ['#c089e8'],
      },
      chartSeries: [
        {
          name: 'Total Winnings',
          data: [],
        },
      ],
    }
  },
  computed: {
    totalAtRisk() {
      return this.allBets
        .filter((bet) => bet.result === 'pending')
        .reduce((sum, bet) => sum + bet.betAmount, 0)
    },
    totalPotentialWinnings() {
      return this.allBets
        .filter((bet) => bet.result === 'pending')
        .reduce((sum, bet) => sum + bet.betPayout, 0)
    },
  },
  methods: {
    async deleteBet(id) {
      try {
        await axios.delete(`${API_BASE}/bets/${id}`)
        this.allBets = this.allBets.filter((bet) => bet._id !== id)
        this.filterAndUpdateBets()
        this.closeEditBetModal()
      } catch (error) {
        console.error('Error deleting bet: ', error)
      }
    },
    closeEditBetModal() {
      this.showEditBetModal = false
    },
    openEditBetModal(bet) {
      this.showEditBetModal = true
      this.editBetError = ''
      this.editBet = { ...bet, legs: this.betToLegs(bet) }
    },
    handleResultClick(result) {
      this.selectedBetResult = result
      this.filterAndUpdateBets()
    },
    async submitEditBet() {
      const betToSubmit = this.prepareBetForSubmit(this.editBet)

      const response = await axios.patch(`${API_BASE}/bets/${this.editBet._id}`, betToSubmit)
      // Find the index of the bet to update in allBets
      const betIndex = this.allBets.findIndex((bet) => bet._id === this.editBet._id)

      if (betIndex !== -1) {
        // Update the bet in the allBets array
        this.allBets[betIndex] = response.data.bet

        this.filterAndUpdateBets()
      } else {
        console.warn('Edited bet not found in allBets array')
      }
    },
    async submitNewBet() {
      const betToSubmit = this.prepareBetForSubmit(this.newBet)

      const response = await axios.post(`${API_BASE}/bets/`, betToSubmit)
      this.allBets.push(response.data.bet)
      this.filterAndUpdateBets()
    },
    // Turns a form's legs back into the parallel team/opponent/line arrays the
    // API stores, normalizing NFL entries to canonical abbreviations. Throws
    // when an entry isn't a recognizable team (futures and NBA stay free text).
    prepareBetForSubmit(bet) {
      const betToSubmit = { ...bet }
      const legs = betToSubmit.legs || []
      delete betToSubmit.legs
      const validateTeams = betToSubmit.sport === 'NFL' && betToSubmit.betType !== 'future'
      const invalid = []

      betToSubmit.team = legs.map((leg) => {
        const raw = (leg.team || '').trim()
        if (!validateTeams) return raw
        const abbr = normalizeNflTeam(raw)
        if (!abbr) invalid.push(raw || '(blank team)')
        return abbr || raw
      })
      betToSubmit.opponent = legs.map((leg) => {
        const raw = (leg.opponent || '').trim()
        if (!validateTeams || OPPONENT_PLACEHOLDERS.includes(raw.toLowerCase())) return raw
        const abbr = normalizeNflTeam(raw)
        if (!abbr) invalid.push(raw)
        return abbr || raw
      })
      betToSubmit.line = legs.map((leg) => String(leg.line ?? '').trim())

      if (invalid.length) {
        throw new Error(`Not an NFL team: ${invalid.join(', ')}`)
      }
      return betToSubmit
    },
    resetNewBetForm() {
      const { week, sport, season, betType } = this.newBet
      this.newBet = {
        sport: sport || this.modalSelectedSport,
        season: season || this.modalSelectedSeason,
        betType: betType || this.modalSelectedBetTypeValue,
        week: week || null,
        legs: this.resizeLegs([], betType || this.modalSelectedBetTypeValue),
        betAmount: '',
        odds: '',
        betPayout: '',
        notes: '',
        result: 'pending',
      }
      this.modalSelectedResult = 'Pending'
      this.newBetError = ''
      this.parseError = ''
    },
    handleSubmit() {
      this.newBetError = ''
      this.submitNewBet()
        .then(() => {
          this.closeNewBetModal()
          this.resetNewBetForm()
        })
        .catch((error) => {
          console.error('Error submitting new bet: ', error)
          this.newBetError = error.response?.data?.msg || error.message
        })
    },
    handleEditSubmit() {
      this.editBetError = ''
      this.submitEditBet()
        .then(() => {
          this.closeEditBetModal()
        })
        .catch((error) => {
          console.error('Error updating bet: ', error)
          this.editBetError = error.response?.data?.msg || error.message
        })
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
          this.newBet.legs = this.resizeLegs(this.newBet.legs, key)
        }
      })
    },
    handleEditBetTypeClick(key) {
      this.editBet.betType = key
      this.editBet.legs = this.resizeLegs(this.editBet.legs, key)
    },
    isMultiLegType(betType) {
      return MULTI_LEG_BET_TYPES.includes(betType)
    },
    // Teasers get exactly 2/3 legs, parlays at least 2, everything else 1.
    // Fields the new type doesn't render are cleared so hidden values can't
    // ride along into the payload.
    resizeLegs(legs, betType) {
      const teaserCounts = { '2-team-teaser': 2, '3-team-teaser': 3 }
      const target =
        betType === 'parlay' ? Math.max(legs.length, 2) : teaserCounts[betType] || 1
      const resized = legs.slice(0, target).map((leg) => ({
        team: leg.team,
        opponent: betType === 'future' ? '' : leg.opponent,
        line: betType === 'moneyline' || betType === 'future' ? '' : leg.line,
      }))
      while (resized.length < target) {
        resized.push(emptyLeg())
      }
      return resized
    },
    addParlayLeg(bet) {
      bet.legs.push(emptyLeg())
    },
    removeParlayLeg(bet, index) {
      if (bet.legs.length > 2) {
        bet.legs.splice(index, 1)
      }
    },
    // Stored parallel arrays -> one editable row per leg
    betToLegs(bet) {
      const teams = Array.isArray(bet.team) ? bet.team : [bet.team]
      const opponents = Array.isArray(bet.opponent) ? bet.opponent : [bet.opponent]
      const lines = Array.isArray(bet.line) ? bet.line : [bet.line]
      const count = Math.max(teams.length, opponents.length, lines.length, 1)
      return Array.from({ length: count }, (_, index) => ({
        team: teams[index] || '',
        opponent: opponents[index] || '',
        line: lines[index] || '',
      }))
    },
    formatLeg(bet, index) {
      const opponent = bet.opponent?.[index]
      const parts = [bet.team[index], bet.line?.[index]]
      // '' and XXX are the no-opponent conventions (futures, untracked parlay legs)
      if (opponent && opponent !== 'XXX') {
        parts.push('vs.', opponent)
      }
      return parts.filter(Boolean).join(' ')
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
      this.newBetError = ''
      this.parseError = ''
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
      filteredBets = filteredBets.filter((bet) => bet.season === Number(this.selectedSeason))
      // By-type stats ignore the result filter — records need every result
      this.statsByType = this.calculateStatsByType(filteredBets)

      // Filter by result
      if (this.selectedBetResult !== 'All') {
        this.cardCarousel = filteredBets
          .filter((bet) => bet.result === this.selectedBetResult.toLowerCase())
          .sort((a, b) => new Date(b.datePlaced) - new Date(a.datePlaced))
      } else {
        this.cardCarousel = filteredBets.sort(
          (a, b) => new Date(b.datePlaced) - new Date(a.datePlaced)
        )
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
    async handleTicketUpload(event) {
      const input = event.target
      const file = input.files[0]
      input.value = '' // allow re-selecting the same file
      if (!file) return
      this.isParsingTicket = true
      this.parseError = ''
      try {
        const blob = await downscaleImage(file)
        const formData = new FormData()
        formData.append('image', blob, 'ticket.jpg')
        const response = await axios.post(`${API_BASE}/bets/parse-ticket`, formData)
        this.applyParsedBet(response.data.parsed)
      } catch (error) {
        console.error('Error parsing ticket: ', error)
        this.parseError =
          error.response?.data?.msg || 'Could not read the ticket, fill the bet in manually'
      } finally {
        this.isParsingTicket = false
      }
    },
    // Pre-fills the New Bet form from parsed ticket fields. The form is the
    // confirmation step — nothing is saved until Save Bet.
    applyParsedBet(parsed) {
      if (parsed.sport) this.handleModalSportClick(parsed.sport)
      if (parsed.season) this.handleModalSeasonClick(String(parsed.season))
      if (parsed.betType) this.handleModalBetTypeClick(this.getBetTypeLabel(parsed.betType))
      if (parsed.week != null) this.newBet.week = parsed.week

      const legCount = Math.max(
        parsed.team?.length || 0,
        parsed.opponent?.length || 0,
        parsed.line?.length || 0,
      )
      if (legCount > 0) {
        const parsedLegs = Array.from({ length: legCount }, (_, index) => ({
          team: parsed.team?.[index] || '',
          opponent: parsed.opponent?.[index] || '',
          line: parsed.line?.[index] || '',
        }))
        this.newBet.legs = this.resizeLegs(parsedLegs, this.modalSelectedBetTypeValue)
      }

      if (parsed.odds) this.newBet.odds = parsed.odds
      if (parsed.betAmount != null) this.newBet.betAmount = parsed.betAmount
      if (parsed.betPayout != null) this.newBet.betPayout = parsed.betPayout
      if (parsed.notes) this.newBet.notes = parsed.notes
    },
    calculateStatsByType(bets) {
      const groups = {}
      bets.forEach((bet) => {
        if (!groups[bet.betType]) {
          groups[bet.betType] = { wins: 0, losses: 0, pushes: 0, pending: 0, net: 0, total: 0 }
        }
        const group = groups[bet.betType]
        group.total += 1
        if (bet.result === 'win') {
          group.wins += 1
          group.net += bet.betPayout || 0
        } else if (bet.result === 'loss') {
          group.losses += 1
          group.net -= bet.betAmount || 0
        } else if (bet.result === 'push') {
          group.pushes += 1
        } else if (bet.result === 'pending') {
          group.pending += 1
        }
      })
      return Object.entries(groups)
        .map(([betType, group]) => ({
          betType,
          label: this.getBetTypeLabel(betType),
          record: `${group.wins}-${group.losses}-${group.pushes}`,
          ...group,
        }))
        .sort((a, b) => b.total - a.total)
    },
    prepareChartData(bets) {
      // Find the maximum week number from the bets
      const maxWeek = Math.max(...bets.map((bet) => bet.week), 0)

      // Create an array of weeks including week 0
      const weeks = Array.from({ length: maxWeek + 1 }, (_, i) => i)
      let cumulativeWinnings = 0

      const weeklyData = weeks.map((week) => ({
        week,
        wins: 0,
        losses: 0,
        pushes: 0,
        weekWinnings: 0,
        totalWinnings: 0,
      }))

      bets.forEach((bet) => {
        const weekIndex = bet.week
        if (bet.result === 'win') {
          weeklyData[weekIndex].wins += 1
          weeklyData[weekIndex].weekWinnings += bet.betPayout
          cumulativeWinnings += bet.betPayout
        } else if (bet.result === 'loss') {
          weeklyData[weekIndex].losses += 1
          weeklyData[weekIndex].weekWinnings -= bet.betAmount
          cumulativeWinnings -= bet.betAmount
        } else if (bet.result === 'push') {
          weeklyData[weekIndex].pushes += 1
        }
        weeklyData[weekIndex].totalWinnings = cumulativeWinnings
      })

      this.chartSeries[0].data = weeklyData.map((item) => ({
        x: `Week ${item.week}`,
        y: item.totalWinnings,
        weekNumber: item.week,
        weekRecord: `${item.wins}-${item.losses}-${item.pushes}`,
        weekWinnings: item.weekWinnings,
        totalWinnings: item.totalWinnings,
      }))

      // Update chart options to show all weeks including week 0
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
        ...Object.keys(sportCounts).sort((a, b) => sportCounts[b] - sportCounts[a]),
      ]

      const seasonCounts = bets.reduce((acc, bet) => {
        acc[bet.season] = (acc[bet.season] || 0) + 1
        return acc
      }, {})
      // Create an array of unique seasons, sorted by most recent season first
      // Always include the current season even if no bets exist yet
      const seasonsFromBets = Object.keys(seasonCounts)
      if (!seasonsFromBets.includes(CURRENT_SEASON)) {
        seasonsFromBets.push(CURRENT_SEASON)
      }
      const allSeasons = [...seasonsFromBets.sort((a, b) => b.localeCompare(a))]

      return {
        wins,
        losses,
        pushes,
        record,
        allSports,
        allSeasons,
        amountWon,
        amountLost,
        amountTotal,
      }
    },
    async getAllBets() {
      try {
        const response = await axios.get(`${API_BASE}/bets/`)
        this.allBets = response.data.bets

        // Calculate initial stats for all bets
        const initialStats = this.calculateStats(
          this.allBets.filter((bet) => bet.result !== 'pending')
        )
        // Dropdown lists must cover every bet, including pending ones
        const allBetStats = this.calculateStats(this.allBets)

        // Update component data with initial stats
        this.record = initialStats.record
        this.allSports = allBetStats.allSports
        this.allSeasons = allBetStats.allSeasons
        this.amountWon = initialStats.amountWon
        this.amountLost = initialStats.amountLost
        this.amountTotal = initialStats.amountTotal

        // Set initial selections
        this.selectedSport = this.allSports[0] || 'NFL'
        this.selectedSeason = this.allSeasons[0] || CURRENT_SEASON
        this.modalSelectedSport = 'NFL'
        this.modalSelectedSeason = CURRENT_SEASON
        this.newBet.sport = 'NFL'
        this.newBet.season = CURRENT_SEASON
        this.newBet.betType = 'spread'

        // Prepare initial chart data
        this.filterAndUpdateBets()

        // Add pending bets to cardCarousel and sort by most recent
        this.cardCarousel = this.allBets
          .filter((bet) => bet.result === 'pending')
          .sort((a, b) => new Date(b.datePlaced) - new Date(a.datePlaced))
      } catch (error) {
        console.error('Error fetching bets:', error)
      } finally {
        this.isLoading = false
      }
    },
    login() {
      axios
        .post(`${API_BASE}/auth/login/`, {
          email: 'brad.bb.bell@gmail.com',
          password: 'passwordbb',
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
    },
  },
  mounted() {
    this.login()
    this.getAllBets()
  },
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
