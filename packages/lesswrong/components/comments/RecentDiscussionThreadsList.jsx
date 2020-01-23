import React, { useState, useCallback } from 'react';
import { Components, registerComponent, useMulti, useUpdate } from 'meteor/vulcan:core';
import { Posts } from '../../lib/collections/posts';
import { Comments } from '../../lib/collections/comments'
import { useCurrentUser } from '../common/withUser';
import AddBoxIcon from '@material-ui/icons/AddBox';
import { useGlobalKeydown } from '../common/withGlobalKeydown';

const RecentDiscussionThreadsList = ({
  terms, commentsLimit, maxAgeHours, af,
  title="Recent Discussion", shortformButton=true
}) => {
  const [expandAllThreads, setExpandAllThreads] = useState(false);
  const [showShortformFeed, setShowShortformFeed] = useState(false);
  const currentUser = useCurrentUser();
  
  const {mutate: updateComment} = useUpdate({
    collection: Comments,
    fragmentName: 'CommentsList',
  });
  const { results, loading, loadMore, loadingMore, refetch } = useMulti({
    terms,
    collection: Posts,
    queryName: 'selectCommentsListQuery',
    fragmentName: 'PostsRecentDiscussion',
    fetchPolicy: 'cache-and-network',
    enableTotal: false,
    pollInterval: 0,
    extraVariables: {
      commentsLimit: 'Int',
      maxAgeHours: 'Int',
      af: 'Boolean',
    },
    extraVariablesValues: {
      commentsLimit, maxAgeHours, af
    },
    ssr: true,
  });

  useGlobalKeydown(ev => {
    const F_Key = 70
    if ((event.metaKey || event.ctrlKey) && event.keyCode == F_Key) {
      setExpandAllThreads(true);
    }
  });
  
  const toggleShortformFeed = useCallback(
    () => {
      setShowShortformFeed(!showShortformFeed);
    },
    [setShowShortformFeed, showShortformFeed]
  );
  
  const { SingleColumnSection, SectionTitle, SectionButton, ShortformSubmitForm, Loading, AnalyticsInViewTracker } = Components

  const { LoadMore } = Components

  if (!loading && results && !results.length) {
    return null
  }

  const expandAll = currentUser?.noCollapseCommentsFrontpage || expandAllThreads

  // TODO: Probably factor out "RecentDiscussionThreadsList" vs "RecentDiscussionSection", rather than making RecentDiscussionThreadsList cover both and be weirdly customizable
  return (
    <SingleColumnSection>
      <SectionTitle title={title}>
        {currentUser?.isReviewed && shortformButton && <div onClick={toggleShortformFeed}>
          <SectionButton>
            <AddBoxIcon />
            New Shortform Post
          </SectionButton>
        </div>}
      </SectionTitle>
      {showShortformFeed && <ShortformSubmitForm successCallback={refetch}/>}
      <div>
        {results && <div>
          {results.map((post, i) =>
            <Components.RecentDiscussionThread
              key={post._id}
              post={post}
              postCount={i}
              refetch={refetch}
              comments={post.recentComments}
              expandAllThreads={expandAll}
              currentUser={currentUser}
              updateComment={updateComment}/>
          )}
        </div>}
        <AnalyticsInViewTracker eventProps={{inViewType: "loadMoreButton"}}>
            { loadMore && <LoadMore loading={loadingMore || loading} loadMore={loadMore}  /> }
            { (loading || loadingMore) && <Loading />}
        </AnalyticsInViewTracker>
      </div>
    </SingleColumnSection>
  )
}

registerComponent('RecentDiscussionThreadsList', RecentDiscussionThreadsList);