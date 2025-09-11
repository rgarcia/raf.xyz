import type { Metadata, Site, Socials } from "@types";

export const SITE: Site = {
  NAME: "Rafael Garcia",
  EMAIL: "hi@raf.xyz",
  NUM_POSTS_ON_HOMEPAGE: 3,
  NUM_WORKS_ON_HOMEPAGE: 2,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Hi, I'm Raf. Welcome to my personal website.",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "A collection of articles on topics I am passionate about.",
};

export const WORK: Metadata = {
  TITLE: "Work",
  DESCRIPTION: "Where I have worked and what I have done.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION: "A collection of my projects, with links to repositories and demos.",
};

export const SOCIALS: Socials = [
  {
    NAME: "twitter-x",
    HREF: "https://twitter.com/rfgarcia",
  },
  {
    NAME: "github",
    HREF: "https://github.com/rgarcia"
  },
  {
    NAME: "linkedin",
    HREF: "https://www.linkedin.com/in/rafgarcia",
  }
];
