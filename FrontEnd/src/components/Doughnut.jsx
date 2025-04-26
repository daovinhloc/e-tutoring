import { useTheme } from '@mui/material/styles'
import ReactEcharts from 'echarts-for-react'
import { formatVND } from '../utils/format'
export default function DoughnutChart({ height, color = [], paymentList = [] }) {
  const theme = useTheme()
  const amounts = paymentList.map((p) => parseFloat(p.amount))

  const min = Math.min(...amounts)
  const max = Math.max(...amounts)
  const range = max - min
  const step = Math.ceil(range / 3)

  const range1Max = min + step
  const range2Max = min + step * 2

  const range1 = paymentList.filter((p) => parseFloat(p.amount) <= range1Max).length
  const range2 = paymentList.filter((p) => {
    const amt = parseFloat(p.amount)
    return amt > range1Max && amt <= range2Max
  }).length
  const range3 = paymentList.filter((p) => parseFloat(p.amount) > range2Max).length

  const option = {
    legend: {
      show: true,
      itemGap: 20,
      icon: 'circle',
      bottom: 0,
      textStyle: {
        color: theme.palette.text.secondary,
        fontSize: 13,
        fontFamily: 'roboto'
      }
    },
    tooltip: {
      show: true,
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    series: [
      {
        name: 'Amount Range',
        type: 'pie',
        radius: ['45%', '72.55%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        hoverOffset: 5,
        stillShowZeroSum: false,
        label: {
          show: false,
          position: 'center',
          textStyle: {
            color: theme.palette.text.secondary,
            fontSize: 13,
            fontFamily: 'roboto'
          },
          formatter: '{a}'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'normal',
            formatter: '{b} \n({d}%)'
          }
        },
        labelLine: { show: false },
        data: [
          {
            value: range1,
            name: `≤ ${formatVND(range1Max)}`
          },
          {
            value: range2,
            name: `${formatVND(range1Max + 1)} - ${formatVND(range2Max)}`
          },
          {
            value: range3,
            name: `> ${formatVND(range2Max)}`
          }
        ],
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  return <ReactEcharts style={{ height }} option={{ ...option, color }} notMerge={true} lazyUpdate={true} />
}
