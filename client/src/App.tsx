import { createBrowserRouter , RouterProvider  } from "react-router-dom"
import { Lobby, Room } from "./pages"
import SocketProvider from "./context/SocketProvider"

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

    <SocketProvider>
      < RouterProvider router= {router}/>
    </SocketProvider>

  )
}

export default App
