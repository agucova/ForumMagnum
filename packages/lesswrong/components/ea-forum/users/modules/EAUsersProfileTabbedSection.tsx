import { Components, registerComponent } from '../../../../lib/vulcan-lib';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import Button from '@material-ui/core/Button';

const COLLAPSED_SECTION_HEIGHT = 200

const styles = (theme: ThemeType): JssStyles => ({
  section: {
    background: theme.palette.grey[0],
    padding: '24px 32px',
    marginBottom: 24,
    [theme.breakpoints.down('xs')]: {
      padding: 16,
    }
  },
  tabsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 30,
    rowGap: '10px',
    marginBottom: 24,
    [theme.breakpoints.down('sm')]: {
      columnGap: 24,
    }
  },
  tab: {
    display: 'flex',
    columnGap: 10,
    fontSize: 20,
    lineHeight: '30px',
    fontWeight: '700',
    paddingBottom: 3,
    borderBottom: `3px solid transparent`,
    cursor: 'pointer',
    '&:hover': {
      opacity: 0.5
    },
    [theme.breakpoints.down('xs')]: {
      columnGap: 8,
      fontSize: 18,
      lineHeight: '28px',
    }
  },
  activeTab: {
    borderBottom: `3px solid ${theme.palette.primary.main}`,
  },
  tabCount: {
    fontSize: 14,
    fontWeight: '400',
    color: theme.palette.grey[600],
    [theme.breakpoints.down('xs')]: {
      fontSize: 12,
    }
  },
  tabRowAction: {
    flex: '1 1 0',
    textAlign: 'right'
  },
  collapsableTabBody: {
    position: 'relative'
  },
  collapsedTabBody: {
    maxHeight: COLLAPSED_SECTION_HEIGHT,
    overflow: 'hidden',
    '&::after': {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      height: 50,
      content: "''",
      background: `linear-gradient(to top, ${theme.palette.grey[0]}, transparent)`,
    }
  },
  toggleCollapsedBtn: {
    marginTop: 20
  }

})

const EAUsersProfileTabbedSection = ({user, currentUser, tabs, classes}: {
  user: UsersProfile,
  currentUser: UsersCurrent|null,
  tabs: Array<any>,
  classes: ClassesType,
}) => {
  const [activeTab, setActiveTab] = useState(tabs.length ? tabs[0] : null)
  const ownPage = currentUser?._id === user._id
  
  // handle the case when we want a collapsable tab body
  const bodyRef = useRef<HTMLDivElement>(null)
  const resizeObserver = useRef<ResizeObserver|null>(null)
  // this tracks whether the contents of the tab actually overflow
  const [meritsCollapse, setMeritsCollapse] = useState(false)
  // this tracks whether the tab body is collapsed or expanded
  const [collapsed, setCollapsed] = useState(true)
  
  useEffect(() => {
    if (bodyRef.current) {
      // show/hide the collapse-related buttons depending on whether or not the content all fits
      resizeObserver.current = new ResizeObserver(elements => {
        setMeritsCollapse(elements[0].contentRect.height >= COLLAPSED_SECTION_HEIGHT)
      })
      resizeObserver.current.observe(bodyRef.current)
    }
    return () => resizeObserver.current?.disconnect()
  }, [bodyRef, activeTab])

  const { Typography } = Components
  
  if (!tabs.length) return null
  
  let tabBody = activeTab.body
  if (activeTab.collapsable) {
    tabBody = <>
      <div className={classNames(classes.collapsableTabBody, {[classes.collapsedTabBody]: collapsed && meritsCollapse})} ref={bodyRef}>
        {activeTab.body}
      </div>
      {meritsCollapse && (collapsed ?
        <Button variant="outlined" color="primary" className={classes.toggleCollapsedBtn} onClick={() => setCollapsed(false)}>
          Show more
        </Button> :
        <Button variant="outlined" color="primary" className={classes.toggleCollapsedBtn} onClick={() => setCollapsed(true)}>
          Show less
        </Button>)
      }
    </>
  }

  return (
    <div className={classes.section}>
      <div className={classes.tabsRow}>
        {tabs.map(tab => {
          if (tab.ownPageOnly && !ownPage) return null
          
          return <Typography
            key={tab.id}
            variant="headline"
            onClick={() => setActiveTab(tab)}
            className={classNames(classes.tab, {[classes.activeTab]: activeTab.id === tab.id})}
          >
            {tab.label}
            {tab.count && <div className={classes.tabCount}>{tab.count}</div>}
          </Typography>
        })}
        <div className={classes.tabRowAction}>
          {activeTab.secondaryNode}
        </div>
      </div>
      {tabBody}
    </div>
  )
}

const EAUsersProfileTabbedSectionComponent = registerComponent(
  'EAUsersProfileTabbedSection', EAUsersProfileTabbedSection, {styles}
);

declare global {
  interface ComponentTypes {
    EAUsersProfileTabbedSection: typeof EAUsersProfileTabbedSectionComponent
  }
}
