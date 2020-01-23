import { addCallback } from 'meteor/vulcan:core';
import { Tags, tagDescriptionEditableOptions } from '../../lib/collections/tags/collection.js';
import { TagRels } from '../../lib/collections/tagRels/collection.js';
import { addEditableCallbacks } from '../editor/make_editable_callbacks.js'
import Users from 'meteor/vulcan:users';
import { performVoteServer } from '../voteServer.js';

function isValidTagName(name) {
  return true;
}

function normalizeTagName(name) {
  // If the name starts with a hash, strip it off
  if (name.startsWith("#"))
    return name.substr(1);
  else
    return name;
}

addCallback("tag.create.validate", (validationErrors, { document: tag }) => {
  if (!isValidTagName(tag.name))
    throw new Error("Invalid tag name (use only letters, digits and dash)");
  
  // If the name starts with a hash, strip it off
  const normalizedName = normalizeTagName(tag.name);
  if (tag.name !== normalizedName) {
    tag = {
      ...tag,
      name: normalizedName,
    };
  }
  
  // Name must be unique
  const existing = Tags.find({name: normalizedName, deleted:false}).fetch();
  if (existing.length > 0)
    throw new Error("A tag by that name already exists");
  
  return tag;
});

addCallback("tag.update.validate", (validationErrors, {oldDocument, newDocument}) => {
  const newName = normalizeTagName(newDocument.name);
  if (oldDocument.name !== newName) { // Tag renamed?
    if (!isValidTagName(newDocument.name))
      throw new Error("Invalid tag name");
    
    const existing = Tags.find({name: newName, deleted:false}).fetch();
    if (existing.length > 0)
      throw new Error("A tag by that name already exists");
  }
  
  if (newDocument.name !== newName) {
    newDocument = {
      ...newDocument, name: newName
    }
  }
  
  return newDocument;
});

addCallback("tag.update.after", async (newDoc, {oldDocument}) => {
  // If this is soft deleting a tag, then cascade to also soft delete any
  // tagRels that go with it.
  if (newDoc.deleted && !oldDocument.deleted) {
    TagRels.update({ tagId: newDoc._id }, { $set: { deleted: true } }, { multi: true });
  }
  return newDoc;
});

addCallback("tagRels.new.after", async (tagRel) => {
  // When you add a tag, vote for it as relevant
  var tagCreator = Users.findOne(tagRel.userId);
  const votedTagRel = await performVoteServer({ document: tagRel, voteType: 'smallUpvote', collection: TagRels, user: tagCreator })
  return {...tagRel, ...votedTagRel};
});

addEditableCallbacks({
  collection: Tags,
  options: tagDescriptionEditableOptions,
});