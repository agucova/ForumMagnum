import { Components, registerComponent, useSingle } from 'meteor/vulcan:core';
import React from 'react';
import { Posts } from '../../lib/collections/posts';
import { Comments } from '../../lib/collections/comments';
import { withStyles } from '@material-ui/core/styles';
import { POST_PREVIEW_WIDTH } from './PostsPreviewTooltip';

const styles = theme => ({
  loading: {
    width: POST_PREVIEW_WIDTH,
    paddingTop: theme.spacing.unit,
    paddingBottom: theme.spacing.unit
  }
})

const PostsPreviewTooltipSingle = ({ classes, postId, truncateLimit=600, showAllInfo }) => {
  const { Loading, PostsPreviewTooltip  } = Components

  const { document: post, loading: postLoading } = useSingle({
    collection: Posts,
    queryName: "postsPreviewTooltipSingle",
    fragmentName: 'PostsList',
    fetchPolicy: 'cache-then-network',
    documentId: postId
  });

  if (postLoading) return <div className={classes.loading}>
      <Loading/>
    </div>
  
  return <PostsPreviewTooltip post={post} showAllInfo={showAllInfo} truncateLimit={truncateLimit} />
}

registerComponent('PostsPreviewTooltipSingle', PostsPreviewTooltipSingle, withStyles(styles, {name:"PostsPreviewTooltipSingle"}));

const PostsPreviewTooltipSingleWithComment = ({ classes, postId, commentId, truncateLimit=600, showAllInfo }) => {
  const { Loading, PostsPreviewTooltip  } = Components

  const { document: post, loading: postLoading } = useSingle({
    collection: Posts,
    queryName: "postsPreviewTooltipSingle",
    fragmentName: 'PostsList',
    fetchPolicy: 'cache-then-network',
    documentId: postId
  });

  const { document: comment, loading: commentLoading } = useSingle({
    collection: Comments,
    queryName: "commentLinkPreview",
    fragmentName: 'CommentsList',
    fetchPolicy: 'cache-then-network',
    documentId: commentId,
  });

  if (postLoading || commentLoading) return <div className={classes.loading}>
      <Loading/>
    </div>
  
  return <PostsPreviewTooltip post={post} comment={commentId && comment} showAllInfo={showAllInfo} truncateLimit={truncateLimit} />
}


registerComponent('PostsPreviewTooltipSingleWithComment', PostsPreviewTooltipSingleWithComment, withStyles(styles, {name:"PostsPreviewTooltipSingleWithComment"}));