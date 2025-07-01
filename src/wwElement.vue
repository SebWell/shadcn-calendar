<template>
  <div
    :class="cn(
      'p-3 border rounded-md bg-background',
      content.customClass
    )"
    :style="content.customStyle"
  >
    <!-- Calendar header -->
    <div class="flex items-center justify-between space-x-1 mb-4">
      <!-- Previous month button -->
      <button
        @click="navigateMonth(-1)"
        :class="cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 w-7'
        )"
        :aria-label="'Previous month'"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Month/Year display -->
      <div class="flex items-center space-x-1">
        <select
          v-model="selectedMonth"
          @change="updateCalendar"
          :class="cn(
            'text-sm font-medium bg-transparent border-none focus:outline-none'
          )"
        >
          <option v-for="(month, index) in monthNames" :key="index" :value="index">
            {{ month }}
          </option>
        </select>
        <select
          v-model="selectedYear"
          @change="updateCalendar"
          :class="cn(
            'text-sm font-medium bg-transparent border-none focus:outline-none'
          )"
        >
          <option v-for="year in availableYears" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>

      <!-- Next month button -->
      <button
        @click="navigateMonth(1)"
        :class="cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 w-7'
        )"
        :aria-label="'Next month'"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Day headers -->
    <div class="grid grid-cols-7 gap-1 mb-2">
      <div
        v-for="day in dayHeaders"
        :key="day"
        class="flex items-center justify-center text-xs font-medium text-muted-foreground h-8"
      >
        {{ day }}
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="grid grid-cols-7 gap-1">
      <button
        v-for="(date, index) in calendarDays"
        :key="index"
        @click="selectDate(date)"
        :disabled="isDateDisabled(date)"
        :class="cn(
          'relative flex items-center justify-center text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-8 w-8 rounded-md',
          // Current month days
          date.isCurrentMonth ? 'hover:bg-accent hover:text-accent-foreground' : '',
          // Other month days
          !date.isCurrentMonth ? 'text-muted-foreground opacity-50' : '',
          // Selected date
          isDateSelected(date) ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground' : '',
          // Today
          isToday(date) && !isDateSelected(date) ? 'bg-accent text-accent-foreground' : '',
          // Disabled dates
          isDateDisabled(date) ? 'opacity-50 cursor-not-allowed' : '',
          // Range selection
          content.mode === 'range' && isInRange(date) && !isDateSelected(date) ? 'bg-accent/50' : '',
          // Range start/end
          content.mode === 'range' && (isRangeStart(date) || isRangeEnd(date)) ? 'bg-primary text-primary-foreground' : ''
        )"
      >
        {{ date.day }}
        
        <!-- Event indicators -->
        <div v-if="hasEvents(date)" class="absolute bottom-0 left-1/2 transform -translate-x-1/2">
          <div class="w-1 h-1 bg-primary rounded-full"></div>
        </div>
      </button>
    </div>

    <!-- Selected date info -->
    <div v-if="selectedDates.length > 0 && content.showSelectedInfo !== false" class="mt-4 pt-4 border-t text-sm">
      <div v-if="content.mode === 'single' && selectedDates[0]">
        <strong>Selected:</strong> {{ formatDate(selectedDates[0]) }}
      </div>
      <div v-else-if="content.mode === 'multiple'">
        <strong>Selected ({{ selectedDates.length }}):</strong>
        <div class="mt-1 flex flex-wrap gap-1">
          <span
            v-for="(date, index) in selectedDates.slice(0, 3)"
            :key="index"
            class="px-2 py-1 bg-muted rounded text-xs"
          >
            {{ formatDate(date) }}
          </span>
          <span v-if="selectedDates.length > 3" class="px-2 py-1 bg-muted rounded text-xs">
            +{{ selectedDates.length - 3 }} more
          </span>
        </div>
      </div>
      <div v-else-if="content.mode === 'range' && selectedDates.length === 2">
        <strong>Range:</strong> {{ formatDate(selectedDates[0]) }} - {{ formatDate(selectedDates[1]) }}
      </div>
    </div>

    <!-- Footer actions -->
    <div v-if="content.showFooter !== false" class="mt-4 pt-4 border-t flex justify-between">
      <button
        v-if="content.showClear !== false"
        @click="clearSelection"
        :class="cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3'
        )"
      >
        Clear
      </button>
      
      <button
        v-if="content.showToday !== false"
        @click="goToToday"
        :class="cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3'
        )"
      >
        Today
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'

export default {
  props: {
    content: {
      type: Object,
      default: () => ({})
    },
    modelValue: {
      type: [Date, Array],
      default: null
    }
  },
  emits: ['update:modelValue', 'select', 'month-change'],
  setup(props, { emit }) {
    // Import utility function
    const cn = (...inputs) => {
      return inputs.filter(Boolean).join(' ')
    }

    const today = new Date()
    const selectedMonth = ref(today.getMonth())
    const selectedYear = ref(today.getFullYear())
    const selectedDates = ref([])

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const dayHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

    const availableYears = computed(() => {
      const currentYear = today.getFullYear()
      const start = currentYear - 10
      const end = currentYear + 10
      return Array.from({ length: end - start + 1 }, (_, i) => start + i)
    })

    const calendarDays = computed(() => {
      const firstDay = new Date(selectedYear.value, selectedMonth.value, 1)
      const lastDay = new Date(selectedYear.value, selectedMonth.value + 1, 0)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())

      const days = []
      for (let i = 0; i < 42; i++) {
        const currentDate = new Date(startDate)
        currentDate.setDate(startDate.getDate() + i)
        
        days.push({
          date: new Date(currentDate),
          day: currentDate.getDate(),
          month: currentDate.getMonth(),
          year: currentDate.getFullYear(),
          isCurrentMonth: currentDate.getMonth() === selectedMonth.value
        })
      }
      
      return days
    })

    // Initialize selected dates from modelValue
    watch(() => props.modelValue, (newValue) => {
      if (newValue) {
        if (Array.isArray(newValue)) {
          selectedDates.value = [...newValue]
        } else {
          selectedDates.value = [newValue]
        }
      } else {
        selectedDates.value = []
      }
    }, { immediate: true })

    const isToday = (date) => {
      const dateObj = date.date
      return dateObj.toDateString() === today.toDateString()
    }

    const isDateSelected = (date) => {
      return selectedDates.value.some(selected => 
        selected.toDateString() === date.date.toDateString()
      )
    }

    const isDateDisabled = (date) => {
      if (props.content.disabledDates) {
        return props.content.disabledDates.some(disabled => 
          new Date(disabled).toDateString() === date.date.toDateString()
        )
      }
      
      if (props.content.minDate && date.date < new Date(props.content.minDate)) {
        return true
      }
      
      if (props.content.maxDate && date.date > new Date(props.content.maxDate)) {
        return true
      }
      
      return false
    }

    const isInRange = (date) => {
      if (props.content.mode !== 'range' || selectedDates.value.length !== 2) {
        return false
      }
      
      const [start, end] = selectedDates.value.sort((a, b) => a - b)
      return date.date > start && date.date < end
    }

    const isRangeStart = (date) => {
      if (props.content.mode !== 'range' || selectedDates.value.length === 0) {
        return false
      }
      
      const sorted = selectedDates.value.sort((a, b) => a - b)
      return date.date.toDateString() === sorted[0].toDateString()
    }

    const isRangeEnd = (date) => {
      if (props.content.mode !== 'range' || selectedDates.value.length < 2) {
        return false
      }
      
      const sorted = selectedDates.value.sort((a, b) => a - b)
      return date.date.toDateString() === sorted[sorted.length - 1].toDateString()
    }

    const hasEvents = (date) => {
      if (!props.content.events) return false
      
      return props.content.events.some(event => 
        new Date(event.date).toDateString() === date.date.toDateString()
      )
    }

    const selectDate = (date) => {
      if (isDateDisabled(date)) return

      const newDate = new Date(date.date)
      
      if (props.content.mode === 'multiple') {
        const index = selectedDates.value.findIndex(selected => 
          selected.toDateString() === newDate.toDateString()
        )
        
        if (index >= 0) {
          selectedDates.value.splice(index, 1)
        } else {
          selectedDates.value.push(newDate)
        }
        
        emit('update:modelValue', [...selectedDates.value])
      } else if (props.content.mode === 'range') {
        if (selectedDates.value.length === 0) {
          selectedDates.value = [newDate]
        } else if (selectedDates.value.length === 1) {
          selectedDates.value.push(newDate)
          selectedDates.value.sort((a, b) => a - b)
        } else {
          selectedDates.value = [newDate]
        }
        
        emit('update:modelValue', [...selectedDates.value])
      } else {
        selectedDates.value = [newDate]
        emit('update:modelValue', newDate)
      }

      emit('select', {
        date: newDate,
        selectedDates: [...selectedDates.value],
        mode: props.content.mode || 'single'
      })
    }

    const navigateMonth = (direction) => {
      const newDate = new Date(selectedYear.value, selectedMonth.value + direction, 1)
      selectedMonth.value = newDate.getMonth()
      selectedYear.value = newDate.getFullYear()
      
      emit('month-change', {
        month: selectedMonth.value,
        year: selectedYear.value,
        monthName: monthNames[selectedMonth.value]
      })
    }

    const updateCalendar = () => {
      emit('month-change', {
        month: selectedMonth.value,
        year: selectedYear.value,
        monthName: monthNames[selectedMonth.value]
      })
    }

    const goToToday = () => {
      selectedMonth.value = today.getMonth()
      selectedYear.value = today.getFullYear()
      updateCalendar()
    }

    const clearSelection = () => {
      selectedDates.value = []
      emit('update:modelValue', props.content.mode === 'multiple' ? [] : null)
      emit('select', {
        date: null,
        selectedDates: [],
        mode: props.content.mode || 'single'
      })
    }

    const formatDate = (date) => {
      return date.toLocaleDateString()
    }

    return {
      cn,
      selectedMonth,
      selectedYear,
      selectedDates,
      monthNames,
      dayHeaders,
      availableYears,
      calendarDays,
      isToday,
      isDateSelected,
      isDateDisabled,
      isInRange,
      isRangeStart,
      isRangeEnd,
      hasEvents,
      selectDate,
      navigateMonth,
      updateCalendar,
      goToToday,
      clearSelection,
      formatDate
    }
  }
}
</script>

<style>
/* Import global shadcn/ui styles */
@import './globals.css';
</style> 