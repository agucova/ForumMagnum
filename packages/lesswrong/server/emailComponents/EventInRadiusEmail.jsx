import React from 'react';
import { registerComponent, useSingle } from 'meteor/vulcan:core';
import { Posts } from '../../lib/collections/posts';
import moment from '../../lib/moment-timezone';

const eventTimeFormat = "Do MMMM YYYY h:mm A"

const EventInRadiusEmail = ({openingSentence, postId}) => {
  const { document: post, loading } = useSingle({
    documentId: postId,
    collection: Posts,
    fragmentName: "PostsRevision",
    ssr: true,
  });
  if (loading) return null;
  
  const link = Posts.getPageUrl(post, true);
  
  return <div>
    <p>
      {openingSentence}: <a href={link}>{post.title}</a>.
    </p>
    <p>
      Location: {post.location}
    </p>
    <p>
      Start Time: {moment(post.localStartTime).utc().format(eventTimeFormat)}
    </p>
    {post.localEndTime && <p>
      End Time: {moment(post.localEndTime).utc().format(eventTimeFormat)}
    </p>}
  </div>
}

registerComponent("EventInRadiusEmail", EventInRadiusEmail);