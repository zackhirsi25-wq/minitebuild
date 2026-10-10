import type { BusinessType } from "@/lib/business-type";
import type { PublicSite } from "@/lib/sites/public";

// Demo businesses for every type except contractor (see index.ts). Invented
// names; phones in the 555-01xx range reserved for fiction; no addresses.

export type Demo = Omit<PublicSite, "slug" | "template" | "status" | "updatedAt" | "images" | "palette">;

const week = (open: string, close: string, sat?: string, sun?: string) => [
  ...["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((d) => `${d}: ${open} – ${close}`),
  `Saturday: ${sat ?? "Closed"}`,
  `Sunday: ${sun ?? "Closed"}`,
];

export const MORE_DEMOS: Partial<Record<BusinessType, Demo>> = {
  restaurant: {
    name: "Olive & Ash",
    city: "Portland",
    phone: "(503) 555-0118",
    address: null,
    hours: week("5:00 PM", "10:00 PM", "4:00 PM – 11:00 PM", "4:00 PM – 9:00 PM"),
    category: "Restaurant",
    trade: "general_contractor",
    content: {
      headline: "Wood-fired dinners in Southeast Portland",
      subheadline:
        "A small dining room built around one oven: seasonal plates, bread from the fire and a short wine list. Call to book a table.",
      services: [
        {
          title: "Dinner service",
          description:
            "A menu that changes with the season, cooked over oak in an open kitchen you can watch from every seat.",
        },
        {
          title: "Private dining",
          description:
            "The back room seats up to a long table of friends for birthdays, rehearsal dinners and work nights out.",
        },
        {
          title: "Takeaway bread",
          description: "Loaves from the morning bake, available at the bar until they run out each evening.",
        },
        {
          title: "Wine and aperitifs",
          description: "A short list of bottles and glasses chosen to sit next to food cooked over fire.",
        },
      ],
      about:
        "Olive & Ash is a neighbourhood restaurant in Portland built around a single wood-fired oven. The menu is short and changes as the season does, with vegetables, fish and meat cooked over oak.\n\nThe room is small, so booking ahead is the best way to get a table. Walk-ins are welcome at the bar when there is space.",
      serviceAreas: ["Southeast Portland", "Hawthorne", "Division", "Richmond", "Sunnyside", "Buckman"],
      faq: [
        {
          question: "Do you take reservations?",
          answer: "Yes. Call us to book a table. The bar is kept for walk-ins when there is room.",
        },
        {
          question: "Can you cater for dietary needs?",
          answer:
            "Tell us when you book and the kitchen will talk you through what can be changed on the menu that night.",
        },
        {
          question: "Can we book the private room?",
          answer: "Yes. Call to ask about dates and how many people the room can take for your evening.",
        },
        {
          question: "Is there parking nearby?",
          answer: "Street parking is usually available on the side streets around the restaurant in the evening.",
        },
      ],
      cta: {
        heading: "Book a table at Olive & Ash",
        body: "Call to reserve, or ask about the private room.",
        buttonLabel: "Call to book",
      },
      process: [
        { title: "Call to book", body: "Pick a night and tell us how many people are coming." },
        { title: "Arrive and settle in", body: "Your table is ready when you arrive, with the menu for that evening." },
        { title: "Eat well", body: "Dinner comes from the oven to your table, course by course." },
      ],
    },
  },
  salon: {
    name: "Studio Nine Hair",
    city: "Austin",
    phone: "(512) 555-0193",
    address: null,
    hours: week("10:00 AM", "7:00 PM", "9:00 AM – 5:00 PM"),
    category: "Hair salon",
    trade: "general_contractor",
    content: {
      headline: "Cuts and colour, unhurried, in Austin",
      subheadline:
        "A small salon on the east side where every appointment has time built in to talk through what you want. Call to book.",
      services: [
        {
          title: "Cuts and styling",
          description: "Cuts for every length and texture, finished with a style you can recreate at home.",
        },
        {
          title: "Colour",
          description:
            "All-over colour, glosses and root touch-ups, matched to your skin tone and how often you want to come back.",
        },
        {
          title: "Balayage and highlights",
          description: "Hand-painted and foil highlights for soft, grown-out colour that ages well between visits.",
        },
        {
          title: "Blow-dry and occasion hair",
          description: "Blow-dries and styling for weddings, events and nights out.",
        },
      ],
      about:
        "Studio Nine Hair is a small salon in East Austin. Appointments are booked with time to talk first, so you leave with the cut or colour you came in for.\n\nWe keep the salon calm and the chairs few. Call to book, and tell us if it is your first visit so we can plan a consultation.",
      serviceAreas: ["East Austin", "Downtown Austin", "Mueller", "Holly", "Cherrywood", "Govalle"],
      faq: [
        {
          question: "Do I need a consultation before colour?",
          answer:
            "For big colour changes we suggest a short consultation first. Call and we will find a time that suits you.",
        },
        {
          question: "How do I book?",
          answer: "Call the salon and we will find an appointment with the right amount of time for what you want.",
        },
        {
          question: "What if I need to cancel?",
          answer: "Call us as early as you can so we can offer the time to someone else.",
        },
        {
          question: "Do you do wedding hair?",
          answer: "Yes. Call to talk through your date, the number of people and where you are getting ready.",
        },
      ],
      cta: {
        heading: "Book your next appointment",
        body: "Call Studio Nine Hair to find a time that suits you.",
        buttonLabel: "Call to book",
      },
      process: [
        { title: "Call to book", body: "Tell us what you have in mind and we will find the right amount of time." },
        { title: "Talk it through", body: "Your appointment starts with a conversation about what you want." },
        { title: "Leave happy", body: "We finish with a style you can keep up at home." },
      ],
    },
  },
  clinic: {
    name: "Eastside Dental",
    city: "Chicago",
    phone: "(312) 555-0167",
    address: null,
    hours: week("8:00 AM", "5:00 PM", "9:00 AM – 1:00 PM"),
    category: "Dentist",
    trade: "general_contractor",
    content: {
      headline: "Calm, careful dentistry in Chicago",
      subheadline:
        "Check-ups, cleanings and treatment explained in plain words before anything starts. Call to book a visit.",
      services: [
        {
          title: "Check-ups and cleaning",
          description: "Regular exams and cleaning, with a clear explanation of anything we notice.",
        },
        {
          title: "Fillings and repairs",
          description: "Treatment for cavities and chipped teeth, with the options and costs talked through first.",
        },
        {
          title: "Whitening",
          description: "In-chair and take-home whitening, after a check that it is right for your teeth.",
        },
        {
          title: "Emergency appointments",
          description:
            "Call if you are in pain or have broken a tooth and we will find the earliest time we can see you.",
        },
      ],
      about:
        "Eastside Dental is a dental practice in Chicago for patients of all ages. Visits are unhurried and every treatment is explained before it begins, so you always know what is happening and why.\n\nIf you are nervous about the dentist, tell us when you call and we will plan your visit around it.",
      serviceAreas: ["Chicago", "Wicker Park", "Bucktown", "Logan Square", "Ukrainian Village", "West Town"],
      faq: [
        {
          question: "Are you taking new patients?",
          answer: "Call us to ask about appointments for new patients and what to bring to your first visit.",
        },
        {
          question: "Do you take my insurance?",
          answer: "Call with your insurance details and we will tell you how it works with our practice.",
        },
        {
          question: "What if I have dental pain?",
          answer: "Call as soon as you can. We will find the earliest time we can see you.",
        },
        {
          question: "I get nervous at the dentist. Can you help?",
          answer: "Tell us when you book. We will take things slowly and explain each step before we start.",
        },
      ],
      cta: {
        heading: "Book a visit at Eastside Dental",
        body: "Call to make an appointment or ask a question.",
        buttonLabel: "Call now",
      },
      process: [
        { title: "Call to book", body: "Tell us whether it is a check-up, a problem tooth or something else." },
        { title: "Your visit", body: "We look, explain what we find and talk through any options." },
        { title: "Plan together", body: "Any treatment is scheduled when it suits you." },
      ],
    },
  },
  "real-estate": {
    name: "Harbor & Pine Realty",
    city: "San Diego",
    phone: "(619) 555-0134",
    address: null,
    hours: week("9:00 AM", "6:00 PM", "10:00 AM – 4:00 PM"),
    category: "Real estate agency",
    trade: "general_contractor",
    content: {
      headline: "Buying and selling homes in San Diego",
      subheadline:
        "Local agents who walk you through every step, from the first viewing to handing over the keys. Call to talk it through.",
      services: [
        {
          title: "Selling your home",
          description:
            "Pricing, preparing and marketing your home, with honest advice on timing and what buyers look for.",
        },
        {
          title: "Buying a home",
          description: "Help finding homes that fit your list, booking viewings and making an offer with confidence.",
        },
        {
          title: "First-time buyers",
          description: "Every step explained, from getting ready to buy to what happens after your offer is accepted.",
        },
        {
          title: "Home valuations",
          description: "A clear idea of what your home could sell for in today's market, with no pressure to list.",
        },
      ],
      about:
        "Harbor & Pine Realty helps people buy and sell homes across San Diego. We work with a small number of clients at a time so each one gets clear answers and quick replies.\n\nWhether you are selling the family home or buying your first place, call and we will talk through where you are and what comes next.",
      serviceAreas: ["San Diego", "North Park", "Point Loma", "La Jolla", "Mission Hills", "Ocean Beach", "Clairemont"],
      faq: [
        {
          question: "How do I know what my home is worth?",
          answer:
            "Call to book a valuation. We will look at your home and recent sales nearby and explain our thinking.",
        },
        {
          question: "I am a first-time buyer. Where do I start?",
          answer: "Call us and we will walk you through the steps, the costs to plan for and how to get ready.",
        },
        {
          question: "Which areas do you cover?",
          answer: "Neighbourhoods across San Diego. Call to ask about a specific street or area.",
        },
        {
          question: "How long does it take to sell?",
          answer: "It depends on the home, the price and the market. We give you an honest view when we meet.",
        },
      ],
      cta: {
        heading: "Thinking of buying or selling?",
        body: "Call Harbor & Pine Realty and talk it through.",
        buttonLabel: "Call now",
      },
      process: [
        { title: "Call us", body: "Tell us whether you are buying, selling or just weighing it up." },
        { title: "Meet and plan", body: "We talk through your home, your budget and your timing." },
        { title: "Move forward", body: "We guide you through every step until the keys change hands." },
      ],
    },
  },
  shop: {
    name: "Fern & Co. Florist",
    city: "Seattle",
    phone: "(206) 555-0176",
    address: null,
    hours: week("9:00 AM", "6:00 PM", "9:00 AM – 5:00 PM", "10:00 AM – 3:00 PM"),
    category: "Florist",
    trade: "general_contractor",
    content: {
      headline: "Seasonal flowers, arranged in Seattle",
      subheadline:
        "Bouquets, plants and wedding flowers from a small shop in Capitol Hill. Call to order or ask what is in this week.",
      services: [
        { title: "Bouquets", description: "Hand-tied bouquets made to order with whatever is freshest that week." },
        {
          title: "Wedding flowers",
          description: "Bouquets, buttonholes and table flowers, planned with you well before the day.",
        },
        {
          title: "House plants",
          description: "Easy-going plants for homes and offices, with advice on light and watering.",
        },
        {
          title: "Local delivery",
          description: "Flowers delivered around Seattle. Call to check delivery times for your area.",
        },
      ],
      about:
        "Fern & Co. is a small flower shop in Capitol Hill. We buy what is in season and arrange it by hand, so no two bouquets are quite the same.\n\nCall to order flowers for a birthday, a thank-you or a wedding, or drop in to see what arrived this week.",
      serviceAreas: ["Capitol Hill", "First Hill", "Central District", "Madison Park", "Eastlake", "Downtown Seattle"],
      faq: [
        {
          question: "Can I order flowers by phone?",
          answer: "Yes. Call the shop, tell us the occasion and your budget, and we will put something together.",
        },
        {
          question: "Do you deliver?",
          answer: "We deliver around Seattle. Call to check times and whether we cover your address.",
        },
        {
          question: "How early should I book wedding flowers?",
          answer: "As early as you can. Call to check your date and arrange a time to talk through ideas.",
        },
        {
          question: "Can you choose for me?",
          answer: "Of course. Tell us the colours and the mood and we will choose from what is fresh.",
        },
      ],
      cta: {
        heading: "Send flowers this week",
        body: "Call Fern & Co. to order or ask what is in season.",
        buttonLabel: "Call to order",
      },
      process: [
        { title: "Call the shop", body: "Tell us the occasion, the colours you like and your budget." },
        { title: "We arrange", body: "We choose what is freshest and make it up by hand." },
        { title: "Collect or delivery", body: "Pick up from the shop or have it delivered nearby." },
      ],
    },
  },
  professional: {
    name: "Calder Tax & Bookkeeping",
    city: "Minneapolis",
    phone: "(612) 555-0151",
    address: null,
    hours: week("9:00 AM", "5:00 PM"),
    category: "Accounting",
    trade: "general_contractor",
    content: {
      headline: "Taxes and books for Minneapolis small businesses",
      subheadline:
        "Bookkeeping, payroll and tax returns, explained in plain language so you always know where your numbers stand.",
      services: [
        {
          title: "Bookkeeping",
          description: "Monthly books kept up to date, with simple reports that show how the business is doing.",
        },
        {
          title: "Tax returns",
          description: "Business and personal returns prepared and filed, with your questions answered along the way.",
        },
        {
          title: "Payroll",
          description: "Payroll run on schedule, with the filings that come with it handled for you.",
        },
        {
          title: "Getting set up",
          description: "Help choosing accounting software and setting it up when you start a business.",
        },
      ],
      about:
        "Calder Tax & Bookkeeping works with small businesses and self-employed people in Minneapolis. We keep things simple: clear numbers, plain answers and a person you can call.\n\nIf your books have fallen behind or tax season is coming, call and we will talk through where you are.",
      serviceAreas: ["Minneapolis", "St. Paul", "Edina", "St. Louis Park", "Richfield", "Roseville"],
      faq: [
        {
          question: "My books are behind. Can you help?",
          answer: "Yes. Call and tell us how far behind they are. We will explain how we would catch them up.",
        },
        {
          question: "Do you work with sole proprietors?",
          answer: "Yes. We work with self-employed people as well as small companies.",
        },
        {
          question: "Do I need to come to the office?",
          answer: "Not always. Call us and we will talk through what works best for you.",
        },
        {
          question: "When should I get in touch about taxes?",
          answer: "The earlier the better. Call ahead of tax season so there is time to get organised.",
        },
      ],
      cta: {
        heading: "Get your numbers in order",
        body: "Call Calder Tax & Bookkeeping to talk it through.",
        buttonLabel: "Call now",
      },
      process: [
        { title: "Call us", body: "Tell us about your business and what you need help with." },
        { title: "Get organised", body: "We gather what is needed and set up a plan with you." },
        { title: "Stay on track", body: "We keep your books and filings up to date through the year." },
      ],
    },
  },
};
