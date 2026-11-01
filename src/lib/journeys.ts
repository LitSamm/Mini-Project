export type Journey = {
  slug: string;
  title: string;
  eyebrow: string;
  status: string;
  description: string;
  image: string;
  imageAlt: string;
  body: string[];
};

export const journeys: Journey[] = [
  {
    slug: "giias-2027",
    title: "The Next Challenge Awaits",
    eyebrow: "UPCOMING EVENT · GIIAS 2027",
    status: "Upcoming",
    description:
      "A new chapter for Anargya ITS Formula EV Team. Meet the people and engineering behind our next challenge.",
    image: "/images/hero-giias.webp",
    imageAlt: "Anargya's electric formula car, ready for its next event",
    body: [
      "GIIAS 2027 is the next event on Anargya's horizon. It is an opportunity to bring the team's work in electric motorsport closer to a wider community.",
      "The event overview, programme, and visitor information will be shared here as details are confirmed.",
    ],
  },
  {
    slug: "inside-the-workshop",
    title: "Inside the workshop",
    eyebrow: "TEAM JOURNAL · THE BUILD",
    status: "Team story",
    description:
      "A closer look at the people, decisions, and hands-on work behind an electric formula car.",
    image: "/images/hero-team.webp",
    imageAlt: "Anargya team members working together around their car",
    body: [
      "A race car is never the work of one person. Students across disciplines share the process: asking questions, testing ideas, and learning from each iteration.",
      "This journal is a window into that process. The team is continuing to document its work, from the first decisions in the workshop to the moments the car meets the track.",
    ],
  },
  {
    slug: "electric-by-design",
    title: "Electric, by design",
    eyebrow: "TEAM JOURNAL · FORMULA EV",
    status: "Team story",
    description:
      "How a student team turns curiosity about electric mobility into a shared engineering challenge.",
    image: "/images/fsae-2025-track.webp",
    imageAlt: "Anargya Formula EV racing at a 2025 Formula Student event",
    body: [
      "Anargya ITS is a student-led Formula EV team based in Surabaya. Designing and building an electric race car brings research, engineering, and teamwork together in one place.",
      "The result is more than a vehicle. It is a hands-on way to explore what the next generation of electric mobility can become.",
    ],
  },
];
