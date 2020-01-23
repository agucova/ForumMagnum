import { Components, registerComponent } from 'meteor/vulcan:core';
import React from 'react';
import { useCurrentUser } from '../common/withUser';
import Users from 'meteor/vulcan:users';
import { AnalyticsContext } from "../../lib/analyticsEvents";

const Home2 = () => {
  const currentUser = useCurrentUser();
  const { RecentDiscussionThreadsList, HomeLatestPosts, RecommendationsAndCurated, AnalyticsInViewTracker } = Components

  const shouldRenderSidebar = Users.canDo(currentUser, 'posts.moderate.all') ||
      Users.canDo(currentUser, 'alignment.sidebar')

  return (
      <AnalyticsContext pageContext="homePage">
        <React.Fragment>
          {shouldRenderSidebar && <Components.SunshineSidebar/>}
          <RecommendationsAndCurated configName="frontpage" />
          <AnalyticsInViewTracker
              eventProps={{inViewType: "latestPosts"}}
              observerProps={{threshold:[0, 0.5, 1]}}
          >
              <HomeLatestPosts />
          </AnalyticsInViewTracker>
          <AnalyticsContext pageSectionContext="recentDiscussion">
              <AnalyticsInViewTracker eventProps={{inViewType: "recentDiscussion"}}>
                  <RecentDiscussionThreadsList
                    terms={{view: 'recentDiscussionThreadsList', limit:20}}
                    commentsLimit={4}
                    maxAgeHours={18}
                    af={false}
                  />
              </AnalyticsInViewTracker>
          </AnalyticsContext>
        </React.Fragment>
      </AnalyticsContext>
  )
}

registerComponent('Home2', Home2);