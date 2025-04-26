import { BotMessageSquare } from 'lucide-react'
import { BatteryCharging } from 'lucide-react'
import { Fingerprint } from 'lucide-react'
import { ShieldHalf } from 'lucide-react'
import { PlugZap } from 'lucide-react'
import { GlobeLock } from 'lucide-react'

import user1 from '../assets/profile-pictures/user1.jpg'
import user2 from '../assets/profile-pictures/user2.jpg'
import user3 from '../assets/profile-pictures/user3.jpg'
import user4 from '../assets/profile-pictures/user4.jpg'
import user5 from '../assets/profile-pictures/user5.jpg'
import user6 from '../assets/profile-pictures/user6.jpg'

export const navItems = [
  { label: 'Features', href: '#' },
  { label: 'Workflow', href: '#' },
  { label: 'Pricing', href: '#' },
  { label: 'Testimonials', href: '#' }
]

export const testimonials = [
  {
    user: 'John Doe',
    company: 'Stellar Solutions',
    image: user1,
    text: 'Choosing a tutor through this platform was an excellent decision. The process was seamless, and the tutor we hired exceeded our expectations with their expertise and dedication.'
  },
  {
    user: 'Jane Smith',
    company: 'Blue Horizon Technologies',
    image: user2,
    text: "I couldn't be happier with the tutor we found here. The platform made it easy to find someone with the right skills and experience, and our tutor's teaching methods have made a significant impact on our learning."
  },
  {
    user: 'David Johnson',
    company: 'Quantum Innovations',
    image: user3,
    text: 'The experience of hiring a tutor through this platform was outstanding. The tutor was professional, knowledgeable, and very effective in helping us achieve our academic goals.'
  },
  {
    user: 'Ronee Brown',
    company: 'Fusion Dynamics',
    image: user4,
    text: 'This platform was a game-changer for us. The tutor we found was incredibly skilled and helped us progress much faster than we anticipated. We are very grateful for their support and expertise.'
  },
  {
    user: 'Michael Wilson',
    company: 'Visionary Creations',
    image: user5,
    text: 'I am amazed by the quality of tutors available on this platform. Our tutor was dedicated, professional, and truly invested in our success. Highly recommend!'
  },
  {
    user: 'Emily Davis',
    company: 'Synergy Systems',
    image: user6,
    text: 'The platform made it easy to find a highly qualified tutor who was perfect for our needs. The tutor expertise and commitment were unmatched. Looking forward to using this service again!'
  }
]

export const features = [
  {
    icon: <BotMessageSquare />,
    text: 'Easily Creating Classes',
    description:
      'Our platform simplifies the process of setting up classes, allowing you to quickly create and manage your courses with just a few clicks.'
  },
  {
    icon: <Fingerprint />,
    text: 'Supportive Tutors',
    description:
      'Benefit from our team of dedicated tutors who are always ready to assist, ensuring you get the help and guidance you need to succeed.'
  },
  {
    icon: <ShieldHalf />,
    text: 'Finding Professional Tutors',
    description:
      'Easily locate and connect with highly qualified tutors who specialize in your area of interest, ensuring you receive top-notch educational support.'
  },
  {
    icon: <BatteryCharging />,
    text: 'Fair Pricing',
    description:
      'Enjoy competitive and transparent pricing, designed to offer you the best value for high-quality tutoring services without breaking the bank.'
  },
  {
    icon: <PlugZap />,
    text: 'Friendly-User Interface',
    description:
      'Friendly-User InterfaceNavigate our platform effortlessly with an intuitive and user-friendly interface that makes finding and booking tutors a breeze.'
  },
  {
    icon: <GlobeLock />,
    text: 'Interest Assurance',
    description:
      'We guarantee a match with a tutor who aligns with your academic goals and interests, ensuring a productive and engaging learning experience.'
  }
]

export const checklistItems = [
  {
    title: 'Code merge made easy',
    description: 'Track the performance of your VR apps and gain insights into user behavior.'
  },
  {
    title: 'Review code without worry',
    description: 'Track the performance of your VR apps and gain insights into user behavior.'
  },
  {
    title: 'AI Assistance to reduce time',
    description: 'Track the performance of your VR apps and gain insights into user behavior.'
  },
  {
    title: 'Share work in minutes',
    description: 'Track the performance of your VR apps and gain insights into user behavior.'
  }
]

export const pricingOptions = [
  {
    title: 'Standard',
    price: '2000 vnd',
    features: [
      'Class duration: 7 days',
      'Access to Basic Teaching Tools',
      'Email Support',
      'Class Recording (Up to 1 Hour)',
      'Customizable Class Schedules'
    ]
  },
  {
    title: 'Pro',
    price: '4000 vnd',
    features: [
      'Class duration: 14 days',
      'Access to Advanced Teaching Tools',
      'Priority Email Support',
      'Class Recording (Up to 3 Hours)',
      'Customizable Class Schedules',
      'Student Performance Tracking'
    ]
  },
  {
    title: 'Premium',
    price: '6000 vnd',
    features: [
      'Class duration: 1 month',
      'Access to Premium Teaching Tools',
      '24/7 Dedicated Support',
      'Class Recording (Unlimited Duration)',
      'Class Recording (Up to 3 Hours)',
      'Customizable Class Schedules',
      'Student Performance Tracking',
      'Marketing and Promotion Tools'
    ]
  }
]

export const resourcesLinks = [
  { href: '#', text: 'Getting Started' },
  { href: '#', text: 'Documentation' },
  { href: '#', text: 'Tutorials' },
  { href: '#', text: 'API Reference' },
  { href: '#', text: 'Community Forums' }
]

export const platformLinks = [
  { href: '#', text: 'Features' },
  { href: '#', text: 'Supported Devices' },
  { href: '#', text: 'System Requirements' },
  { href: '#', text: 'Downloads' },
  { href: '#', text: 'Release Notes' }
]

export const communityLinks = [
  { href: '#', text: 'Events' },
  { href: '#', text: 'Meetups' },
  { href: '#', text: 'Conferences' },
  { href: '#', text: 'Hackathons' },
  { href: '#', text: 'Jobs' }
]
