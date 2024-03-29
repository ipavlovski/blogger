import { Box, Container, createStyles, Text, getStylesRef } from '@mantine/core'
import { create } from 'zustand'
// import { useActiveStore, useQueriedEntries } from 'components/app'


//  ==============================
//              STYLES
//  ==============================


const mainWidth = 140
const padOffset = 24
const topOffset = 20
const leftOffset = -10

const circleSize = 10
const headerHeight = 24

const colNode = '#e5e5e5'
const colHeader = '#e5e5e5'
const colEntry = '#e5e5e5'

const borderPx = '2px'

const fontSize = 14

const hlHeader = '#7cce73'
const hlMain = '#46ad3a'

const useStyles = createStyles((_, { depth }: {depth: number}) => ({
  treeNode: {
    position: 'relative',
    margin: 0,
    paddingLeft: padOffset,
    paddingTop: depth == 1 ? 16 : 0,

    // horizontal line
    '&:before': {
      display: depth == 1 ? 'none' : 'block',
      position: 'absolute',
      width: padOffset,
      borderBottom: `2px solid ${colNode}`,
      top: topOffset,
      left: leftOffset,
      content: '""'
    },

    // vertical line
    '&::after': {
      display: depth == 1 ? 'none' : 'block',
      position: 'absolute',
      height: '100%',
      borderLeft: `2px solid ${colNode}`,
      top: topOffset,
      left: leftOffset,
      content: '""'
    },

    // if it is the LAST item, don't add vertical line
    '&:last-child::after': {
      display: 'none'
    },

    // highlight side of all previous siblings
    [`&:has(~ .${getStylesRef('hl')})::after`]: {
      borderLeft: `${borderPx} solid ${hlMain}`,
      transition: 'border 0.25s ease',

    },

    // highlight bottoms
    [`&.${getStylesRef('hl')}:before`]: {
      borderBottom: `${borderPx} solid ${hlMain}`,
      zIndex: 3,
      transition: 'border 0.25s ease',

    }
  },
  header: {
    position: 'relative',
    fontSize: fontSize,
    fontWeight: 'bold',
    padding: `${headerHeight / 2 - 2}px 4px`,
    height: headerHeight,
    margin: 0,

    // line going down
    '&::before': {
      // display: isEmpty ? 'none' : 'block',
      display: 'block',
      position: 'absolute',
      borderLeft: `2px solid ${colHeader}`,
      content: '""',
      height: '100%',
      top: topOffset,
      left: leftOffset,
    },

    // if it is the only child (no entries/categories), dont show line
    '&:only-child::before': {
      display: 'none'
    },

    [`&.${getStylesRef('hl')}`]: {
      color: `${hlHeader}`
    },

    // circle
    '&:after': {
      position: 'absolute',
      width: circleSize,
      height: circleSize,
      top: topOffset - circleSize / 2,
      left: leftOffset - circleSize / 2 + 1,
      borderRadius: '50%',
      backgroundColor: 'white',
      content: '""',
    },

    // highlight active circles in the chain
    [`&.${getStylesRef('hl')}:after`]: {
      backgroundColor: `${hlMain}`,
      transition: 'border 0.25s ease',

    },

    // highlight lines going down
    [`&.${getStylesRef('hl')}:before`]: {
      borderLeft: `${borderPx} solid ${hlMain}`,
      transition: 'border 0.25s ease',
    }

  },
  entry: {
    position: 'relative',
    paddingLeft: padOffset*0.4 + 10,
    margin: 0,

    // horizontal line
    '&:before': {
      position: 'absolute',
      width: padOffset*0.4,
      borderBottom: `2px solid ${colEntry}`,
      top: topOffset,
      left: leftOffset,
      content: '""',
    },

    // vertical line
    '&::after': {
      position: 'absolute',
      height: '100%',
      borderLeft: `2px solid ${colEntry}`,
      top: topOffset,
      left: leftOffset,
      content: '""',
    },

    // entry is a child of a highligted treeNode
    [`.${getStylesRef('hl')} > &:after`]: {
      borderLeft: `${borderPx} solid ${hlMain}`,
      transition: 'border 0.25s ease',
    },

    // highlight bottom line of of active entry
    [`&:has(.${getStylesRef('hlEntry')}):before`]: {
      borderBottom: `${borderPx} solid ${hlMain}`,
      zIndex: 3,
      transition: 'border 0.25s ease',
    },

    // in the 'hl-entry' node, highlight only the lines left-of
    [`&:has(> .${getStylesRef('hlEntry')}):after`]: {
      borderLeft: '2px solid white',
    },
    [`&:has(> .${getStylesRef('hlEntry')}) ~ &:after`]: {
      borderLeft: '2px solid white',
    },

    // if it is the LAST item, don't add vertical line
    '&:last-child::after': {
      display: 'none'
    },
  },

  entryHeader: {
    padding: '12px 0 0',
    height: headerHeight,
    fontSize: fontSize,
    lineHeight: '100%',

    // circle
    '&:before': {
      position: 'absolute',
      width: circleSize,
      height: circleSize,
      top: topOffset - circleSize / 2,
      left: padOffset*0.4 - circleSize,
      borderRadius: '50%',
      border: '2px white solid',
      content: '""',
      transition: 'border 0.25s ease',
    },

    // highlight active entry circle
    [`&.${getStylesRef('hlEntry')}:before`]: {
      border: `${borderPx} ${hlMain} solid`,
      transition: 'border 0.25s ease',
    },
  },

  box: {
    padding: 0,
    margin: 0
  },


  hl: {
    ref: getStylesRef('hl'),
  },

  hlEntry: {
    ref: getStylesRef('hlEntry'),
    color: `${hlMain}`,
    transition: 'color 0.25s ease',
  }

}))


interface TreeLeaf {
  id: number
  title: string
}

export interface TreeNode {
  item: { id: number, path: number[], name: string }
  leafs: TreeLeaf[]
  children: TreeNode[]
  depth: number
}


interface ActiveStore {
  selectedChain: number[]
  selectedChild: number,
  setActive: (chain: number[], child: number) => void
}

export const useActiveStore = create<ActiveStore>((set) => ({
  selectedChain: [0],
  selectedChild: 0,
  setActive: (selectedChain, selectedChild) => set(() => ({ selectedChain, selectedChild }))
}))


function Entry({ leaf, depth, ind }: {leaf: TreeLeaf, depth: number, ind: number}) {
  const { classes, cx } = useStyles({ depth })

  const { selectedChain, selectedChild } = useActiveStore.getState()
  const isSelected = leaf.id == selectedChild && depth == selectedChain.length

  return (
    <Box key={ind} className={cx(classes.entry)} >
      <Text truncate className={cx(classes.entryHeader, isSelected && classes.hlEntry)}>
        {leaf.title || 'untitled'}
      </Text>
    </Box>
  )
}

export default function TreeView({ treeNode }: {treeNode: TreeNode}) {
  const { depth, item, leafs, children } = treeNode
  const { classes, cx } = useStyles({ depth })

  const selectedChain = useActiveStore.getState().selectedChain
  const isSelected = selectedChain.slice(0, depth).join() == item.path.slice(0, depth).join()


  return (
    <Box className={cx(classes.treeNode, isSelected && classes.hl)} >

      {/* category header */}
      <Box className={cx(classes.header, isSelected && classes.hl)}>
        <Text truncate>{item.name}</Text>
      </Box>

      {/* entries */}
      {leafs.length > 0 &&
      leafs.map((entry, ind) => ( <Entry key={ind} depth={depth} leaf={entry} ind={ind}/> ))}

      {/* child categories */}
      {children.length > 0 &&
      <div className={classes.box}>
        { children.map((treeNode, ind) => <TreeView key={ind} treeNode={treeNode}/>) }
      </div>}

    </Box>
  )
}
