import { ExpandLess, StarOutline, TrendingUp } from '@mui/icons-material'
import { Card, Fab, Grid, lighten, styled, useTheme } from '@mui/material'
import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { formatVND } from '../utils/format'

const StatCard = (props) => {
  const { userData, paymentData, usersInMonth, paymentsInMonth } = props

  const amountGrowPercent = useMemo(() => {
    const totalAmount =
      paymentData && paymentData.length
        ? paymentData.filter((item) => item.status === 'Completed').reduce((sum, a) => sum + +a.amount, 0)
        : 0
    if (!totalAmount || !paymentsInMonth?.total_amount) return 0
    else return Math.ceil((100 * paymentsInMonth.total_amount) / totalAmount)
  }, [paymentData, paymentsInMonth])

  const userGrowPercent = useMemo(() => {
    if (!userData.length || !usersInMonth?.total_registered_students) return 0
    else return Math.ceil((100 * usersInMonth.total_registered_students) / userData.length)
  }, [userData, usersInMonth])

  // STYLED COMPONENTS
  const ContentBox = styled('div')(() => ({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center'
  }))

  const FabIcon = styled(Fab)(() => ({
    width: '44px !important',
    height: '44px !important',
    boxShadow: 'none !important',
    zIndex: 1
  }))

  const H3 = styled('h3')(() => ({
    margin: 0,
    fontWeight: '500',
    marginLeft: '12px'
  }))

  const H1 = styled('h1')(({ theme }) => ({
    margin: 0,
    flexGrow: 1,
    color: theme.palette.text.secondary
  }))

  const Span = styled('span')(() => ({
    fontSize: '13px',
    marginLeft: '4px'
  }))

  const IconBox = styled('div')(() => ({
    width: 16,
    height: 16,
    color: '#fff',
    display: 'flex',
    overflow: 'hidden',
    borderRadius: '300px ',
    justifyContent: 'center',
    '& .icon': { fontSize: '14px' }
  }))

  const { palette } = useTheme()
  const bgError = lighten(palette.error.main, 0.85)

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} md={6}>
        <Card elevation={3} sx={{ p: 2 }}>
          <ContentBox>
            <FabIcon size='medium' sx={{ background: 'rgba(9, 182, 109, 0.15)' }}>
              <TrendingUp color='success' />
            </FabIcon>

            <H3 color='#08ad6c'>Active Users</H3>
          </ContentBox>

          <ContentBox sx={{ pt: 2 }}>
            <H1>New student this month: {usersInMonth?.total_registered_students ?? 0}</H1>

            <IconBox sx={{ backgroundColor: 'success.main' }}>
              <ExpandLess className='icon' />
            </IconBox>

            <Span color='#08ad6c'>{userGrowPercent} %</Span>
          </ContentBox>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card elevation={3} sx={{ p: 2 }}>
          <ContentBox>
            <FabIcon size='medium' sx={{ backgroundColor: bgError, overflow: 'hidden' }}>
              <StarOutline color='error' />
            </FabIcon>

            <H3 color='error.main'>Transactions</H3>
          </ContentBox>

          <ContentBox sx={{ pt: 2 }}>
            <H1>This month: {formatVND(paymentsInMonth?.total_amount)}</H1>

            <IconBox sx={{ backgroundColor: 'error.main' }}>
              <ExpandLess className='icon' />
            </IconBox>

            <Span color='error.main'>{amountGrowPercent} %</Span>
          </ContentBox>
        </Card>
      </Grid>
    </Grid>
  )
}

export default StatCard
