import React from 'react';
import { Components, registerComponent } from '../../lib/vulcan-lib';

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    marginBottom: 24,
    [theme.breakpoints.down("md")]: {
      marginTop: 12,
      marginBottom: 8,
    }
  }
});

const StickiedPosts = ({
  classes,
}: {
  classes: ClassesType,
}) => {
  const { SingleColumnSection, PostsList2, TargetedJobAd } = Components

  return <SingleColumnSection className={classes.root}>
    <PostsList2
      terms={{view:"stickied", limit:100, forum: true}}
      showNoResults={false}
      showLoadMore={false}
      hideLastUnread={false}
      boxShadow={false}
      curatedIconLeft={false}
    />
    <TargetedJobAd />
  </SingleColumnSection>
}

const StickiedPostsComponent = registerComponent("StickiedPosts", StickiedPosts, {styles});

declare global {
  interface ComponentTypes {
    StickiedPosts: typeof StickiedPostsComponent
  }
}
