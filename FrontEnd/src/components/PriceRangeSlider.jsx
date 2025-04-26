import React, { useState } from 'react'
import { Slider } from '@nextui-org/react'

const PriceRangeSlider = ({ onChange }) => {
  const min = 0
  const max = 500000
  const [priceRange, setPriceRange] = useState([min, max])

  const handleChange = (value) => {
    const transformedValue = value.map((v) => v / 1000)
    setPriceRange(transformedValue)
    onChange(transformedValue)
  }

  return (
    <Slider
      label='Price / hour'
      step={50000}
      minValue={min}
      maxValue={max}
      defaultValue={[min, max]}
      formatOptions={{ style: 'currency', currency: 'VND' }}
      className='max-w-md block antialiased tracking-normal font-sans text-base font-semibold leading-relaxed text-inherit mb-4'
      onChange={handleChange}
    />
  )
}

export default PriceRangeSlider
