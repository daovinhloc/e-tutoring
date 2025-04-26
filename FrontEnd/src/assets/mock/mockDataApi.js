export const mockData = {
  'payments/getPaymentInfo': {
    data: [
      // Giao dịch tháng này (Tháng 4/2025)
      {
        paymentID: 1,
        amount: '300.00',
        status: 'Completed',
        paymentMethod: 'Credit Card',
        transactionID: 'TRX100001',
        createdAt: '2025-04-06T09:00:00Z',
        updatedAt: '2025-04-06T09:00:00Z'
      },
      {
        paymentID: 2,
        amount: '450.00',
        status: 'Completed',
        paymentMethod: 'Momo',
        transactionID: 'TRX100002',
        createdAt: '2025-04-07T12:30:00Z',
        updatedAt: '2025-04-07T12:30:00Z'
      },
      {
        paymentID: 3,
        amount: '500.00',
        status: 'Pending',
        paymentMethod: 'Bank Transfer',
        transactionID: 'TRX100003',
        createdAt: '2025-04-08T15:00:00Z',
        updatedAt: '2025-04-08T15:00:00Z'
      },
      {
        paymentID: 4,
        amount: '700.00',
        status: 'Completed',
        paymentMethod: 'Credit Card',
        transactionID: 'TRX100004',
        createdAt: '2025-04-09T10:15:00Z',
        updatedAt: '2025-04-09T10:15:00Z'
      },
      {
        paymentID: 5,
        amount: '200.00',
        status: 'Failed',
        paymentMethod: 'ZaloPay',
        transactionID: 'TRX100005',
        createdAt: '2025-04-10T08:45:00Z',
        updatedAt: '2025-04-10T08:45:00Z'
      },
      {
        paymentID: 6,
        amount: '800.00',
        status: 'Completed',
        paymentMethod: 'Credit Card',
        transactionID: 'TRX100006',
        createdAt: '2025-04-11T14:20:00Z',
        updatedAt: '2025-04-11T14:20:00Z'
      },
      {
        paymentID: 7,
        amount: '650.00',
        status: 'Completed',
        paymentMethod: 'Bank Transfer',
        transactionID: 'TRX100007',
        createdAt: '2025-04-12T11:00:00Z',
        updatedAt: '2025-04-12T11:00:00Z'
      },

      // Giao dịch tháng trước (Tháng 3/2025)
      {
        paymentID: 8,
        amount: '250.00',
        status: 'Completed',
        paymentMethod: 'Momo',
        transactionID: 'TRX090001',
        createdAt: '2025-03-02T10:00:00Z',
        updatedAt: '2025-03-02T10:00:00Z'
      },
      {
        paymentID: 9,
        amount: '400.00',
        status: 'Completed',
        paymentMethod: 'Credit Card',
        transactionID: 'TRX090002',
        createdAt: '2025-03-03T13:00:00Z',
        updatedAt: '2025-03-03T13:00:00Z'
      },
      {
        paymentID: 10,
        amount: '350.00',
        status: 'Pending',
        paymentMethod: 'Bank Transfer',
        transactionID: 'TRX090003',
        createdAt: '2025-03-04T16:30:00Z',
        updatedAt: '2025-03-04T16:30:00Z'
      },
      {
        paymentID: 11,
        amount: '600.00',
        status: 'Completed',
        paymentMethod: 'ZaloPay',
        transactionID: 'TRX090004',
        createdAt: '2025-03-05T09:30:00Z',
        updatedAt: '2025-03-05T09:30:00Z'
      },
      {
        paymentID: 12,
        amount: '300.00',
        status: 'Failed',
        paymentMethod: 'Momo',
        transactionID: 'TRX090005',
        createdAt: '2025-03-06T07:45:00Z',
        updatedAt: '2025-03-06T07:45:00Z'
      },
      {
        paymentID: 13,
        amount: '750.00',
        status: 'Completed',
        paymentMethod: 'Credit Card',
        transactionID: 'TRX090006',
        createdAt: '2025-03-07T12:15:00Z',
        updatedAt: '2025-03-07T12:15:00Z'
      },
      {
        paymentID: 14,
        amount: '550.00',
        status: 'Completed',
        paymentMethod: 'Bank Transfer',
        transactionID: 'TRX090007',
        createdAt: '2025-03-08T10:10:00Z',
        updatedAt: '2025-03-08T10:10:00Z'
      }
    ]
  },
  'admin/getActiveUser': {
    data: {
      totalCount: 150,
      createLastMonthCount: 12,
      users: [
        {
          id: 'U001',
          fullName: 'Nguyễn Văn A',
          createdAt: '2024-04-02T09:00:00Z'
        },
        {
          id: 'U002',
          fullName: 'Trần Thị B',
          createdAt: '2024-04-03T11:00:00Z'
        },
        {
          id: 'U003',
          fullName: 'Lê Văn C',
          createdAt: '2024-03-28T15:30:00Z'
        }
      ]
    }
  }
}
