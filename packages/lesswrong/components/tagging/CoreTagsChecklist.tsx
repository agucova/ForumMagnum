import React from 'react';
import { Components, registerComponent } from '../../lib/vulcan-lib';
import { useMulti } from '../../lib/crud/withMulti';
import { tagStyle } from './FooterTag';
import { taggingNameSetting } from '../../lib/instanceSettings';

const styles = (theme: ThemeType): JssStyles => ({
  root: {
    marginBottom: 8,
    display: "flex",
    flexWrap: "wrap"
  },
  checkbox: {
    padding: "0 8px 2px 0",
    '& svg': {
      height:14,
      width: 14
    }
  },
  tag: {
    ...tagStyle(theme),
    backgroundColor: "unset",
    color: theme.palette.grey[500],
    border: theme.palette.border.extraFaint,
    '&:hover': {
      border: theme.palette.border.grey300,
      color: theme.palette.grey[800]
    }
  }
}); 

const CoreTagsChecklist = ({onTagSelected, classes, existingTagIds=[] }: {
  onTagSelected?: (tag: {tagId: string, tagName: string}, existingTagIds: Array<string>)=>void,
  classes: ClassesType,
  existingTagIds?: Array<string|undefined>
}) => {
  const { results, loading } = useMulti({
    terms: {
      view: "coreTags",
    },
    collectionName: "Tags",
    fragmentName: "TagFragment",
    limit: 100,
  });
  
  const { Loading, LWTooltip } = Components;
  if (loading) return <Loading/>

  const unusedCoreTags = results?.filter(tag => !existingTagIds.includes(tag._id))

  const handleOnTagSelected = (tag, existingTagIds) => onTagSelected ? onTagSelected({tagId:tag._id, tagName:tag.name}, existingTagIds) : undefined

  return <>
    {unusedCoreTags?.map(tag => <LWTooltip key={tag._id} title={<div>Click to assign <em>{tag.name}</em> {taggingNameSetting.get()}</div>}>
      <div className={classes.tag} onClick={() => handleOnTagSelected(tag, existingTagIds)}>
        {tag.name}
      </div>
    </LWTooltip>)}
  </>
}


const CoreTagsChecklistComponent = registerComponent("CoreTagsChecklist", CoreTagsChecklist, {styles});

declare global {
  interface ComponentTypes {
    CoreTagsChecklist: typeof CoreTagsChecklistComponent
  }
}
