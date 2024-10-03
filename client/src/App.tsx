import { createBrowserRouter , RouterProvider  } from "react-router-dom"
import { Lobby, Room } from "./pages"

function App() {
  
  const router = createBrowserRouter (
    [
      {
        path : "/",
        element : <Lobby/>
      },
      {
        path:"/room/:roomId",
        element : <Room/>
      }
    ]
  )

  return (

    < RouterProvider router= {router}/>
  )
}

export default App
