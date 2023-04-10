import { Flex, Text } from '@mantine/core'
import { useFilteredBlogposts } from 'frontend/apis/queries'
import { Link } from 'react-router-dom'


export default function BlogpostList() {
  const blogposts = useFilteredBlogposts()

  return(
    <>
      {blogposts.map((blogpost) => (
        <Flex key={blogpost.id} gap={18} mb={5}>
          <Text color='#726f6f' size={15}>
            {blogpost.createdAt.toISOString().substring(0, 10)}
          </Text>

          <Link to={`posts/${blogpost.id}`} style={{ textDecoration: 'none' }}>
            <Text td='underline' size={15}>{blogpost.title}</Text>
          </Link>
        </Flex>
      ))}
    </>
  )
}
