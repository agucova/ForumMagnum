import React, { useContext, useCallback, useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useCurrentUser } from './withUser';
import { useNewEvents } from '../../lib/events/withNewEvents';
import { hookToHoc } from '../../lib/hocUtils';

export type ItemsReadContextType = {
  postsRead: Record<string,boolean>,
  setPostRead: (postId: string, isRead: boolean) => void,
  tagsRead: Record<string,boolean>,
  setTagRead: (tagId: string, isRead: boolean) => void,
};
export const ItemsReadContext = React.createContext<ItemsReadContextType|null>(null);
export const useItemsRead = (): ItemsReadContextType => {
  const context = useContext(ItemsReadContext);
  if (!context) throw new Error("useItemsRead called but not a descedent of Layout");
  return context;
}
export const withItemsRead = hookToHoc(useItemsRead);

export const useRecordPostView = (post: PostsBase): {recordPostView: any, isRead: boolean} => {
  const [increasePostViewCount] = useMutation(gql`
    mutation increasePostViewCountMutation($postId: String) {
      increasePostViewCount(postId: $postId)
    }
  `, {
    ignoreResults: true
  });
  
  const {recordEvent} = useNewEvents()
  const currentUser = useCurrentUser();
  const {postsRead, setPostRead} = useItemsRead();
  const isRead = post && ((post._id in postsRead) ? postsRead[post._id] : post.isRead)
  
  const recordPostView = useCallback(async ({post, extraEventProperties}) => {
    try {
      if (!post) throw new Error("Tried to record view of null post");
      
      // a post id has been found & it's has not been seen yet on this client session
      if (!postsRead[post._id]) {

        // Trigger the asynchronous mutation with postId as an argument
        // Deliberately not awaiting, because this should be fire-and-forget
        await increasePostViewCount({
          variables: {
            postId: post._id
          }
        });

        // Update the client-side read status cache
        setPostRead(post._id, true);
      }

      // Register page-visit event
      if(currentUser) {
        let eventProperties = {
          userId: currentUser._id,
          important: false,
          intercom: true,
          ...extraEventProperties
        };

        eventProperties = {
          ...eventProperties,
          documentId: post._id,
          postTitle: post.title,
        };
        
        recordEvent('post-view', true, eventProperties);
      }
    } catch(error) {
      console.log("recordPostView error:", error); // eslint-disable-line
    }
  }, [postsRead, setPostRead, increasePostViewCount, currentUser, recordEvent]);
  
  return { recordPostView, isRead };
}

export const withRecordPostView = hookToHoc(useRecordPostView);

export const useRecordTagView = (tag: TagFragment): {recordTagView: any, isRead: boolean} => {
  const {recordEvent} = useNewEvents()
  const currentUser = useCurrentUser();
  const {tagsRead, setTagRead} = useItemsRead();
  const isRead = tag && ((tag._id in tagsRead) ? tagsRead[tag._id] : tag.isRead)
  
  const recordTagView = useCallback(async ({tag, extraEventProperties}) => {
    try {
      if (!tag) throw new Error("Tried to record view of null tag");
      
      // Update the client-side read status cache
      if (!tagsRead[tag._id]) {
        setTagRead(tag._id, true);
      }

      // Register page-visit event
      if(currentUser) {
        let eventProperties = {
          userId: currentUser._id,
          important: false,
          intercom: true,
          ...extraEventProperties
        };

        eventProperties = {
          ...eventProperties,
          documentId: tag._id,
          tagName: tag.name,
        };
        
        recordEvent('tag-view', true, eventProperties);
      }
    } catch(error) {
      console.log("recordTagView error:", error); // eslint-disable-line
    }
  }, [tagsRead, setTagRead, currentUser, recordEvent]);
  
  return { recordTagView, isRead };
}

export default withRecordPostView;
