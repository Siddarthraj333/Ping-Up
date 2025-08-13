import React from 'react'

const Loading =({height = '100vh'})=> {
  return (
    <div style={{height}} className='flex items-center justify-center h-screen'>
        <div className='w-10 h-10 rounded-full border-red-300
        border-piurple-500 border-t-transparent animate-spin'></div>
      
    </div>
  )
}

export default Loading
