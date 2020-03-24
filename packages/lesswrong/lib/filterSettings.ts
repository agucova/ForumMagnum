import * as _ from 'underscore';

export interface FilterSettings {
  personalBlog: FilterMode,
  tags: Array<FilterTag>,
}
export interface FilterTag {
  tagId: string,
  tagName: string,
  filterMode: FilterMode,
}
export type FilterMode = "Hidden"|"Less"|"Default"|"More"|"Required"
//export const filterModes: Array<FilterMode> = ["Hidden","Less","Default","More","Required"];
export const filterModes: Array<FilterMode> = ["Hidden","Default","Required"];

export const defaultFilterSettings: FilterSettings = {
  personalBlog: "Hidden",
  tags: [
    {
      tagId: "tNsqhzTibgGJKPEWB",
      tagName: "Coronavirus",
      filterMode: "Default",
    }
  ],
}

export const filterTooltips = {
  Hidden: "These posts will not appear on the home page",
  Default: "These posts will appear on the home page (sorted normally)",
  Required: "The home page will ONLY show posts that you have marked as 'required.'"
}

export function filterSettingsToString(filterSettings: FilterSettings): string {
  let nonNeutralTagModifiers = _.filter(filterSettings.tags,
    tag => tag.filterMode !== "Default");
  let hasTagModifiers = nonNeutralTagModifiers.length > 0;
  
  // Filters on a tag?
  if (hasTagModifiers) {
    // If filtering on more than one tag, give up and say "Custom"
    if (nonNeutralTagModifiers.length > 1)
      return "Custom";
    
    // Filters is for only the selected tag?
    const singleTagFilter = nonNeutralTagModifiers[0]
    if (singleTagFilter.filterMode === "Required") {
      if (filterSettings.personalBlog === "Default") {
        return singleTagFilter.tagName;
      } else if (filterSettings.personalBlog === "Hidden") {
        return `Frontpage ${singleTagFilter.tagName}`
      } else {
        return "Custom";
      }
    } else if (singleTagFilter.filterMode === "Hidden") {
      if (filterSettings.personalBlog === "Default") {
        return `No ${singleTagFilter.tagName}`;
      } else if (filterSettings.personalBlog === "Hidden") {
        return `Frontpage, No ${singleTagFilter.tagName}`
      } else {
        return "Custom";
      }
    } else {
      // Filter modifies the amount of a tag. Just call it Custom.
      return "Custom";
    }
  }
  
  // Doesn't filter on a tag. Convert the personalBlog setting into a string.
  if (filterSettings.personalBlog === "Hidden") {
    return "No Personal Blogposts";
  } else if (filterSettings.personalBlog === "Required") {
    return "Personal Blog";
  } else if (filterSettings.personalBlog === "Default") {
    return "All";
  } else {
    return "Custom";
  }
}
