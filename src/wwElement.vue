<template>
  <div class="ww-calendar">
    <!-- Calendar Header -->
    <div v-if="content.showHeader !== false" class="calendar-header">
      <button @click="navigateMonth(-1)" class="nav-button" type="button">
        <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <div class="calendar-title">
        {{ monthNames[currentMonth] }} {{ currentYear }}
      </div>
      
      <button @click="navigateMonth(1)" class="nav-button" type="button">
        <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Day Headers -->
    <div class="calendar-grid-header">
      <div v-for="day in dayHeaders" :key="day" class="day-header">
        {{ day }}
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid">
      <button
        v-for="(date, index) in calendarDays"
        :key="index"
        @click="selectDate(date)"
        :class="getDateClasses(date)"
        :disabled="isDateDisabled(date)"
        type="button"
      >
        {{ date.day }}
      </button>
    </div>

    <!-- Footer -->
    <div v-if="content.showFooter !== false" class="calendar-footer">
      <button v-if="content.showToday !== false" @click="goToToday" class="footer-button" type="button">
        Today
      </button>
      <button v-if="content.showClear !== false" @click="clearSelection" class="footer-button" type="button">
        Clear
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    content: { type: Object, required: true },
    wwElementState: { type: Object, required: true },
    /* wwEditor:start */
    wwEditorState: { type: Object, required: true },
    /* wwEditor:end */
  },
  emits: ['update:content:effect', 'update:content', 'element-event'],
  data() {
    const today = new Date()
    return {
      today,
      currentMonth: today.getMonth(),
      currentYear: today.getFullYear(),
      selectedDates: [],
      monthNames: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      dayHeaders: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    }
  },
  computed: {
    calendarDays() {
      const firstDay = new Date(this.currentYear, this.currentMonth, 1)
      const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0)
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
          isCurrentMonth: currentDate.getMonth() === this.currentMonth
        })
      }
      
      return days
    }
  },
  watch: {
    'content.selectedDate': {
      handler(newValue) {
        if (newValue) {
          if (Array.isArray(newValue)) {
            this.selectedDates = [...newValue]
          } else {
            this.selectedDates = [new Date(newValue)]
          }
        } else {
          this.selectedDates = []
        }
      },
      immediate: true
    }
  },
  methods: {
    selectDate(dateObj) {
      if (this.isDateDisabled(dateObj)) return

      const newDate = new Date(dateObj.date)
      const mode = this.content.mode || 'single'
      
      if (mode === 'multiple') {
        const index = this.selectedDates.findIndex(selected => 
          selected.toDateString() === newDate.toDateString()
        )
        
        if (index >= 0) {
          this.selectedDates.splice(index, 1)
        } else {
          this.selectedDates.push(newDate)
        }
      } else if (mode === 'range') {
        if (this.selectedDates.length === 0) {
          this.selectedDates = [newDate]
        } else if (this.selectedDates.length === 1) {
          this.selectedDates.push(newDate)
          this.selectedDates.sort((a, b) => a - b)
        } else {
          this.selectedDates = [newDate]
        }
      } else {
        this.selectedDates = [newDate]
      }

      // WeWeb event emission
      this.$emit('element-event', {
        type: 'date-select',
        date: newDate,
        selectedDates: [...this.selectedDates],
        mode: mode
      })

      // Update content
      const updateValue = mode === 'single' ? newDate : this.selectedDates
      this.$emit('update:content', { selectedDate: updateValue })
    },

    navigateMonth(direction) {
      const newDate = new Date(this.currentYear, this.currentMonth + direction, 1)
      this.currentMonth = newDate.getMonth()
      this.currentYear = newDate.getFullYear()
      
      this.$emit('element-event', {
        type: 'month-change',
        month: this.currentMonth,
        year: this.currentYear
      })
    },

    goToToday() {
      this.currentMonth = this.today.getMonth()
      this.currentYear = this.today.getFullYear()
    },

    clearSelection() {
      this.selectedDates = []
      this.$emit('update:content', { selectedDate: null })
      this.$emit('element-event', { type: 'clear' })
    },

    isDateSelected(dateObj) {
      return this.selectedDates.some(selected => 
        selected.toDateString() === dateObj.date.toDateString()
      )
    },

    isToday(dateObj) {
      return dateObj.date.toDateString() === this.today.toDateString()
    },

    isDateDisabled(dateObj) {
      if (this.content.disabledDates && Array.isArray(this.content.disabledDates)) {
        return this.content.disabledDates.some(disabled => 
          new Date(disabled).toDateString() === dateObj.date.toDateString()
        )
      }
      
      if (this.content.minDate && dateObj.date < new Date(this.content.minDate)) {
        return true
      }
      
      if (this.content.maxDate && dateObj.date > new Date(this.content.maxDate)) {
        return true
      }
      
      return false
    },

    isInRange(dateObj) {
      if (this.content.mode !== 'range' || this.selectedDates.length !== 2) {
        return false
      }
      
      const [start, end] = this.selectedDates.sort((a, b) => a - b)
      return dateObj.date > start && dateObj.date < end
    },

    getDateClasses(dateObj) {
      const classes = ['date-button']
      
      if (!dateObj.isCurrentMonth) {
        classes.push('other-month')
      }
      
      if (this.isDateSelected(dateObj)) {
        classes.push('selected')
      }
      
      if (this.isToday(dateObj) && !this.isDateSelected(dateObj)) {
        classes.push('today')
      }
      
      if (this.isDateDisabled(dateObj)) {
        classes.push('disabled')
      }
      
      if (this.isInRange(dateObj)) {
        classes.push('in-range')
      }
      
      return classes.join(' ')
    }
  }
}
</script>

<style>
/* Shadcn UI Variables */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
}

/* Calendar Container */
.ww-calendar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius));
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: inherit;
}

/* Header */
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.calendar-title {
  font-size: 1rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.ww-calendar .nav-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: #ffffff;
  color: #0f172a;
  cursor: pointer;
  transition: all 150ms ease;
}

.ww-calendar .nav-button:hover {
  background-color: #f1f5f9 !important;
  color: #0f172a !important;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-icon {
  width: 1rem;
  height: 1rem;
}

/* Day Headers */
.calendar-grid-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.day-header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
}

/* Calendar Grid */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.ww-calendar .date-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: none;
  border-radius: 6px;
  background-color: transparent;
  color: #0f172a;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 150ms ease;
}

.ww-calendar .date-button:hover:not(:disabled) {
  background-color: #f1f5f9 !important;
  color: #0f172a !important;
}

.ww-calendar .date-button.other-month {
  color: #64748b;
  opacity: 0.5;
}

.ww-calendar .date-button.selected {
  background-color: #0f172a !important;
  color: #f8fafc !important;
}

.ww-calendar .date-button.selected:hover {
  background-color: #0f172a !important;
  color: #f8fafc !important;
}

.ww-calendar .date-button.today:not(.selected) {
  background-color: #f1f5f9 !important;
  color: #0f172a !important;
  font-weight: 600;
}

.ww-calendar .date-button.disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}

.ww-calendar .date-button.in-range:not(.selected) {
  background-color: rgba(241, 245, 249, 0.5) !important;
}

/* Footer */
.calendar-footer {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid hsl(var(--border));
}

.ww-calendar .footer-button {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: #ffffff;
  color: #0f172a;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 150ms ease;
}

.ww-calendar .footer-button:hover {
  background-color: #f1f5f9 !important;
  color: #0f172a !important;
}
</style>