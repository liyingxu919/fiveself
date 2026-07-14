export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  location: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    quote:
      "Finally — a way to understand myself that feels beautiful. Not a printout. Not a fortune. A personal visual book I want to keep on my desk.",
    name: "Sarah L.",
    location: "New York, USA",
  },
  {
    id: "2",
    quote:
      "Bought this as a wedding gift. The couple opened it together and said it felt more intimate than any physical present they received.",
    name: "Minjae K.",
    location: "Seoul, South Korea",
  },
  {
    id: "3",
    quote:
      "I don't normally buy things like this. But the aesthetic is so calming, so far from what I expected 'Eastern wisdom' to look like. I've shared it with three friends already.",
    name: "Claire B.",
    location: "London, UK",
  },
];
