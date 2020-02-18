// components/calendar/calendar.js
var date = new Date()
var monthHadLoad = []

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    date: String,
    topbarBgColor: String,
    bgColor: String,
    todayColor: String,
    markColor: String,
    periodColor: String,
    periods: Array,
    markdays: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    year: 2020,
    month: 2,
    weekBarData: ['日', '一', '二', '三', '四', '五', '六'],
    dateList: [
      [],
      [],
      []
    ],
    currentItem: 1,
    today: null,
  },

  attached() {
    console.log('attached')

    let today = new Date()
    today = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2)
    this.setData({
      today: today,
      currentSelected: (this.properties.date && this.properties.date.length == 10) ? this.properties.date : today
    })

    // 初始化组件高度
    this.createSelectorQuery().select('.topBar').boundingClientRect((rect) => {
      this.setData({
        width: rect.width
      })
    }).exec();

    // 加载日历数据
    if (this.properties.date) {
      date = new Date(this.properties.date)
    }

    this.renderCalendar(date, true)
    // 初次渲染完成事件
    this.triggerEvent('renderfinish', {
      date: this.data.currentSelected
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    renderCalendar(date, firstRender, lastItem) {
      if (firstRender) {
        // 只有首次渲染时才去生成当月的数据，提高性能
        console.log('render current')
        this.generateCalendar(date, this.data.currentItem)
      }
      // 生成上一个月的数据
      date.setMonth(date.getMonth() - 1)
      if ((this.data.currentItem + 3 - 1) % 3 != lastItem) {
        console.log('render last')
        this.generateCalendar(date, (this.data.currentItem + 3 - 1) % 3)
      }
      // 生成下一个月的数据
      date.setMonth(date.getMonth() + 2)
      if ((this.data.currentItem + 1) % 3 != lastItem) {
        console.log('render next')
        this.generateCalendar(date, (this.data.currentItem + 1) % 3)
      }
      // 还原临时变量
      date.setMonth(date.getMonth() - 1)

      this.setData({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        currentDate: date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)
      })

      this.createSelectorQuery().select('.dateBlock').boundingClientRect((rect) => {
        this.setData({
          blockWidth: rect.height
        })
      }).exec();
    },

    // 生成日期数据
    generateCalendar(date, item) {
      // 清空当前日期
      this.data.dateList[item] = []

      let y = date.getFullYear()
      let m = date.getMonth() + 1
      let d = date.getDate()

      // 获取月头第一天时间
      let monthFistDate = new Date(y + '-' + m + '-01')

      // 月份长度数组，其中2月份需要判断平年闰年
      let monthLength = [
        31, null, 31, 30,
        31, 30, 31, 31,
        30, 31, 30, 31
      ];
      monthLength[1] = ((y % 400 === 0) || (y % 100 !== 0 && y % 4 === 0)) ? 29 : 28

      // 填充上个月的部分
      for (let i = 0; i < monthFistDate.getDay(); i++) {
        let d = monthLength[((m + 10) % 12)] - monthFistDate.getDay() + i + 1
        let day = {
          text: d,
          type: 'lastMonth',
          date: ((((m + 10) % 12) + 1) == 12 ? (y - 1) : y) + '-' + ('0' + (((m + 10) % 12) + 1)).slice(-2) + '-' + ('0' + d).slice(-2)
        }
        // 判断是否处于周期内
        for (let i = 0; i < this.properties.periods.length; i++) {
          if (day.date >= this.properties.periods[i][0] && day.date <= this.properties.periods[i][1]) {
            switch (day.date) {
              case this.properties.periods[i][0]:
                day.periodType = 'start'
                break;
              case this.properties.periods[i][1]:
                day.periodType = 'end'
                break;
              default:
                day.periodType = 'center'
            }
          }
        }
        // 判断是否被标记
        if (this.properties.markdays.indexOf(day.date) != -1) {
          day.mark = true
        }
        this.data.dateList[item].push(day)
      }
      // 填充当月数据
      for (let i = 0; i < monthLength[m - 1]; i++) {
        let day = {
          text: i + 1,
          type: '',
          date: y + '-' + ('0' + m).slice(-2) + '-' + ('0' + (i + 1)).slice(-2)
        }
        // 判断是否处于周期内
        for (let i = 0; i < this.properties.periods.length; i++) {
          if (day.date >= this.properties.periods[i][0] && day.date <= this.properties.periods[i][1]) {
            switch (day.date) {
              case this.properties.periods[i][0]:
                day.periodType = 'start'
                break;
              case this.properties.periods[i][1]:
                day.periodType = 'end'
                break;
              default:
                day.periodType = 'center'
            }
          }
        }
        // 判断是否被标记
        if (this.properties.markdays.indexOf(day.date) != -1) {
          day.mark = true
        }
        this.data.dateList[item].push(day)
      }
      // 填充下个月的部分
      let needFillNum = (7 - (this.data.dateList[item].length % 7)) % 7
      for (let i = 0; i < needFillNum; i++) {
        let day = {
          text: i + 1,
          type: 'nextMonth',
          date: (((m % 12) + 1) == 1 ? (y + 1) : y) + '-' + ('0' + ((m % 12) + 1)).slice(-2) + '-' + ('0' + (i + 1)).slice(-2)
        }
        // 判断是否处于周期内
        for (let i = 0; i < this.properties.periods.length; i++) {
          if (day.date >= this.properties.periods[i][0] && day.date <= this.properties.periods[i][1]) {
            switch (day.date) {
              case this.properties.periods[i][0]:
                day.periodType = 'start'
                break;
              case this.properties.periods[i][1]:
                day.periodType = 'end'
                break;
              default:
                day.periodType = 'center'
            }
          }
        }
        // 判断是否被标记
        if (this.properties.markdays.indexOf(day.date) != -1) {
          day.mark = true
        }
        this.data.dateList[item].push(day)
      }

      this.setData({
        ['dateList[' + item + ']']: this.data.dateList[item],
      })

      // 触发加载新月份的时间
      let monthLoad = this.data.dateList[item][0].date.slice(0, 7)
      if (monthHadLoad.indexOf(monthLoad) == -1) {
        monthHadLoad.push(monthLoad)
        this.triggerEvent('newmonthload', {
          data: this.data.dateList[item].map(x => {
            return x.date
          })
        })
      }
    },

    // 日期被改变
    onDateChange(e) {
      date = new Date(e.detail.value)
      this.renderCalendar(date, true)
      this.setData({
        currentSelected: e.detail.value
      })
      this.triggerEvent('datechange', {
        date: e.detail.value
      })
    },

    // 日期被点击
    onDateTap(e) {
      this.setData({
        currentSelected: e.currentTarget.dataset.date
      })
      this.triggerEvent('datechange', {
        date: e.currentTarget.dataset.date
      })
      switch (e.currentTarget.dataset.type) {
        case 'lastMonth':
          this.changeMonth({
            currentTarget: {
              id: 'prev'
            }
          })
          break
        case 'nextMonth':
          this.changeMonth({
            currentTarget: {
              id: 'next'
            }
          })
          break
      }
    },

    // 切换月份
    changeMonth(e) {
      let lastItem = this.data.currentItem
      switch (e.currentTarget.id) {
        case 'prev':
          // 上一个月
          date.setMonth(date.getMonth() - 1)
          this.setData({
            currentItem: (this.data.currentItem + 3 - 1) % 3
          })
          break;
        case 'next':
          // 下一个月
          date.setMonth(date.getMonth() + 1)
          this.setData({
            currentItem: (this.data.currentItem + 1) % 3
          })
          break;
        case 'swipe':
          // 只响应手动滑动
          if (e.detail.source == 'touch') {
            date.setMonth(date.getMonth() + ([1, -2].indexOf(e.detail.current - this.data.currentItem) != -1 ? 1 : -1))
            console.log(date.getMonth() + 1)
            this.data.currentItem = e.detail.current
          } else {
            return
          }
      }

      // 跳过刚才的月份，只渲染新的月份，提高渲染性能
      this.renderCalendar(date, false, lastItem)
    }
  },

  options: {
    
  },

  observers: {
    'date': function (dateNew) {
      if (dateNew && dateNew.length == 10) {
        date = new Date(dateNew)
        this.setData({
          currentSelected: dateNew
        })

        if (this.data.dateList[0].length == 0) return // 还未开始渲染

        let d = new Date(dateNew)
        if (d < new Date(this.data.dateList[this.data.currentItem][0].date) || d > new Date(this.data.dateList[this.data.currentItem][this.data.dateList[this.data.currentItem].length - 1].date)) {
          console.log(1)
          this.renderCalendar(date, true)
        }
      }
    },

    'markdays': function (markdays) {
      if (this.data.dateList[0].length == 0) return // 还未开始渲染
      this.renderCalendar(date, true)
    }
  }
})