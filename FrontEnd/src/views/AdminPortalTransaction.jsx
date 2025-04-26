// AdminPortalTransaction.jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, Grid, styled, useTheme } from '@mui/material'
import DoughnutChart from '../components/Doughnut.jsx'
import { MegaMenuWithHover } from '../components/MegaMenuWithHover.jsx'
import StatCards2 from '../components/StatCards.jsx'
import LineChart from '../components/LineChart.jsx'
import { makeGet, makeGetMock } from '../apiService/httpService.js'
import { formatDateToLocalString, formatVND } from '../utils/format.js'

const PaymentStatus = {
  Completed: 'text-success',
  Pending: 'text-warning',
  Failed: 'text-red-800'
}

const AdminPortalTransaction = () => {
  const [payments, setPayments] = useState([])
  const [paymentsInMonth, setPaymentsInMonth] = useState([])
  const [users, setUsers] = useState([])
  const [usersInMonth, setUsersInMonth] = useState([])
  const { palette } = useTheme()

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        // when BE api is ready, change makeGetMock to makeGet
        const response = await makeGet('payments/getPaymentInfo')
        setPayments(response.data)
      } catch (error) {
        console.error('Error fetching payments:', error)
      }
    }
    const fetchPaymentsInMonth = async () => {
      try {
        const response = await makeGet('admin/getPaymentInfoThisMonth')
        setPaymentsInMonth(response.data)
      } catch (error) {
        console.error('Error fetching payments:', error)
      }
    }
    const fetchUsers = async () => {
      try {
        const response = await makeGet('admin/getActiveUser')
        setUsers(response.data)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
    const fetchUsersInMonth = async () => {
      try {
        const response = await makeGet('admin/getUserActiveByMonthAndYear')
        setUsersInMonth(response.data)
      } catch (error) {
        console.error('Error fetching payments:', error)
      }
    }
    fetchPayments()
    fetchPaymentsInMonth()
    fetchUsers()
    fetchUsersInMonth()
  }, [])

  return (
    <div className='mx-auto p-6 bg-gray-100 min-h-screen'>
      <header className='bg-purple-600 text-white shadow-md py-4'>
        <MegaMenuWithHover />
      </header>
      <div className='pt-14'>
        <h1 className='text-4xl font-bold mb-6 text-center text-black'>Admin Portal - Revenue</h1>
        <Grid container spacing={3}>
          <Grid item lg={8} md={8} sm={12} xs={12}>
            <StatCards2
              userData={users}
              usersInMonth={usersInMonth[0]}
              paymentData={payments}
              paymentsInMonth={paymentsInMonth[0]}
            />
            <div
              style={{ maxHeight: '605px', overflow: 'auto' }}
              className='mx-auto relative bg-white shadow-md rounded-lg pb-2'
            >
              <table
                className='min-w-full'
                style={{
                  height: '100%',
                  overflow: 'auto'
                }}
              >
                <thead className='bg-gradient-to-t sticky top-0 left-0 from-yellow-700 to-yellow-300 text-black'>
                  <tr>
                    <th className='p-4 text-left'>ID</th>
                    <th className='p-4 text-left'>Order Code</th>
                    <th className='p-4 text-left'>Payment method</th>
                    <th className='p-4 text-left'>Amount</th>
                    <th className='p-4 text-left'>Status</th>
                    <th className='p-4 text-left'>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => (
                    <tr key={payment.paymentID} className='border-b hover:bg-purple-50 text-'>
                      <td className='p-4'>{payment.paymentID}</td>
                      <td className='p-4'>{payment.transactionID}</td>
                      <td className='p-4'>{payment.paymentMethod}</td>
                      <td className='p-4'>{formatVND(payment.amount)}</td>
                      <td className='p-4'>
                        <span className={PaymentStatus[payment.status] ?? 'text-yellow-500'}>{payment.status}</span>
                      </td>
                      <td className='p-4'>{formatDateToLocalString(payment.createAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Grid>
          <Grid item lg={4} md={4} sm={12} xs={12}>
            <Card sx={{ px: 3, py: 2, mb: 3 }}>
              <h4>Revenue Distribution by Subscription Tier</h4>
              <DoughnutChart height='300px' color={['#ff6384', '#36a2eb', '#cc65fe']} paymentList={payments} />
            </Card>
            <Card sx={{ px: 3, py: 2, mb: 3 }}>
              <h4>Revenue Distribution by days in week</h4>
              <LineChart height='300px' color={['#ff6384', '#36a2eb']} paymentList={payments} />
            </Card>
          </Grid>
        </Grid>
      </div>
    </div>
  )
}

export default AdminPortalTransaction
