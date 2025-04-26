import { useTheme } from '@mui/material/styles'
import ReactEcharts from 'echarts-for-react'
import { useMemo } from 'react'

const getDaysOfWeek = () => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const groupPaymentsByDay = (payments, targetMonth) => {
  const dayMap = Array(7).fill(0)

  payments.forEach((payment) => {
    const date = new Date(payment.createdAt)
    const amount = parseFloat(payment.amount)
    const month = date.getMonth()
    const day = date.getDay()

    if (month === targetMonth) {
      dayMap[day] += amount
    }
  })

  return dayMap
}

export default function LineChart({ height, color = [], paymentList = [] }) {
  const theme = useTheme()
  const daysOfWeek = getDaysOfWeek()

  const { thisMonthData, lastMonthData } = useMemo(() => {
    const now = new Date()
    const thisMonth = now.getMonth()
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1

    return {
      thisMonthData: groupPaymentsByDay(paymentList, thisMonth),
      lastMonthData: groupPaymentsByDay(paymentList, lastMonth)
    }
  }, [paymentList])

  const option = {
    grid: { top: '10%', bottom: '10%', left: '5%', right: '5%' },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        let result = `${params[0].axisValue}<br/>`
        params.forEach((item) => {
          const amount = item.data * 1000 || 0
          const formatted = amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
          result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${item.color};"></span>${item.seriesName}: ${formatted}<br/>`
        })
        return result
      }
    },
    legend: {
      itemGap: 20,
      icon: 'circle',
      textStyle: {
        fontSize: 13,
        color: theme.palette.text.secondary,
        fontFamily: theme.typography.fontFamily
      }
    },
    label: {
      fontSize: 13,
      color: theme.palette.text.secondary,
      fontFamily: theme.typography.fontFamily
    },
    xAxis: {
      type: 'category',
      data: daysOfWeek,
      axisLine: { show: true },
      axisTick: { show: false },
      axisLabel: {
        fontSize: 14,
        fontFamily: 'roboto',
        color: theme.palette.text.secondary
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: true },
      axisTick: { show: false },
      splitLine: {
        lineStyle: { color: theme.palette.text.secondary, opacity: 0.15 }
      },
      axisLabel: { color: theme.palette.text.secondary, fontSize: 11, fontFamily: 'roboto' }
    },
    series: [
      {
        data: thisMonthData,
        type: 'line',
        name: 'This month',
        smooth: true,
        symbolSize: 4,
        lineStyle: { width: 4 }
      },
      {
        data: lastMonthData,
        type: 'line',
        name: 'Last month',
        smooth: true,
        symbolSize: 4,
        lineStyle: { width: 4 }
      }
    ]
  }

  return <ReactEcharts style={{ height: height }} option={{ ...option, color: [...color] }} />
}
