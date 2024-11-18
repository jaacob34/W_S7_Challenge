import React, { useEffect, useState } from 'react'
import axios from 'axios'
import * as yup from 'yup'


// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
}

const e = {
  fullNameType: 'fullName must be a string',
  fullNameRequired: 'fullName is required',
  fullNameMin: 'fullName must be at least 3 characters',
  fullNameMax: 'fullName cannot exceed 20 characters',
  sizeRequired: 'size is required',
  sizeOptions: 'size must be one of the following values: S, M, L',
  toppingsRequired: 'toppings is required',
  toppingsType: 'toppings must be an array of IDs',
  toppingInvalid: 'topping ID invalid',
  toppingRepeated: 'topping IDs cannot be repeated',
}

const pizzaSchema = yup.object().shape({
  fullName: yup.string().typeError(e.fullNameType).trim()
    .required(e.fullNameRequired).min(3, validationErrors.fullNameTooShort).max(20, validationErrors.fullNameTooLong),
  size: yup.string().oneOf(['S', 'M', 'L'], validationErrors.sizeIncorrect).required(e.sizeRequired).trim(),
  toppings: yup.array().typeError(e.toppingsType)
    .of(
      yup.number().typeError(e.toppingsType)
        .integer(e.toppingsType)
        .min(1, e.toppingInvalid)
        .max(5, e.toppingInvalid)
    )
  })

// 👇 Here you will create your schema.

// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppingsArray = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },

  
]
const initalValues = () => ({
  fullName: '',
  size: '',
  toppings: []
})
const initalErrors = () => ({
  fullName: '',
  size: '',
  toppings: []
})

export default function Form() {

  

  const [values, setValues] = useState(initalValues())
  const [errors, setErrors] = useState(initalErrors())
  const [success, setSuccess] = useState(false)
  const [failure, setFailure] = useState(false)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    pizzaSchema.isValid(values).then(setEnabled)
  }, [values])

  const handleChange = (e) => {
    const { id, type, checked } = e.target;
  
    if (type === 'checkbox') {
      
      setValues((prev) => ({
        ...prev,
        toppings: checked
          ? [...prev.toppings, id] 
          : prev.toppings.filter((toppingId) => toppingId !== id), 
      }));
    } else {
      // Update other input values
      const { value } = e.target;
      setValues(prev => ({ ...prev, [id]: value }));
    }
    const { value } = e.target
    yup.reach(pizzaSchema, id).validate(value)
      .then(() => setErrors({ ...errors, [id]: '' }))
      .catch((err) => setErrors({ ...errors, [id]: err.errors[0] }))
  };

  const handleSubmit = e => {
    e.preventDefault();
    axios.post('http://localhost:9009/api/order', values)
      .then(res => {
        console.log(res.data)
        setValues(initalValues())
        setSuccess(res.data.message)
        setFailure()
      })
      .catch(err => {
        setFailure(err.response.data.message)
        setSuccess()
      })
  }
  return (
    <form onSubmit={handleSubmit}>
      <h2>Order Your Pizza</h2>
      {success && <div className='success'>{success}</div>}
      {failure && <div className='failure'>{failure}</div>}

      <div className="input-group"> {/* name input */}
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input value={values.fullName} onChange={handleChange} placeholder="Type full name" id="fullName" type="text" />
        </div>
        {errors.fullName && <div className='error'>{errors.fullName}</div>}
      </div>

      <div className="input-group"> {/* size input */}
        <div>
          <label htmlFor="size">Size</label><br />
          <select value={values.size} onChange={handleChange} id="size">
            <option value="">----Choose Size----</option>
            <option value='S'>Small</option>
            <option value='M'>Medium</option>
            <option value='L'>Large</option>
          </select>
        </div>
        {errors.size && <div className='error'>{errors.size}</div>}
      </div>

      <div className="input-group"> {/* toppings checkboxes */}
        {/* 👇 Maybe you could generate the checkboxes dynamically */}
        {toppingsArray.map(top => (
          <label key={top.topping_id}>
            <input checked={values.toppings.includes(top.topping_id)} onChange={handleChange} id={top.topping_id} type='checkbox' />
            {top.text}<br />
          </label>
        ))}

      </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <input type="submit" disabled={!enabled} />
    </form>
  )
}
