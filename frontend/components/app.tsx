import { Container, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'

import { queryClient, trpc, trpcClient } from 'frontend/apis/queries'
import { globalTheme } from 'frontend/apis/styles'
import Blogpost from 'components/blog-post'
import Blogposts from 'components/blog-list'
import Header from 'components/header'


function Root() {
  return (
    <Container size={840} style={{ position: 'relative' }}>
      <Header />
      <Outlet />
    </Container>
  )
}


const router = createBrowserRouter([{
  path: '/',
  element: <Root />,
  children: [
    {
      path: 'posts/:postId',
      element: <Blogpost />,
    },
    {
      index: true,
      element: <Blogposts />,
    },
  ],
}])


export default function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider withGlobalStyles withNormalizeCSS theme={globalTheme}>
          <Notifications />
          <RouterProvider router={router}/>
        </MantineProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </trpc.Provider>
  )
}
