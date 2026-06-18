import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// In-memory textbook listing database with high-quality styled academic books
interface Book {
  id: string;
  title: string;
  author: string;
  edition: string;
  price: number;
  originalPrice?: number;
  distance: string;
  sellerName: string;
  sellerCourse: string;
  sellerPhone: string;
  coverUrl?: string; // base64 or placeholder style
  coverColor?: string; // hex or tailwind class for beautiful gradients
  isTopperCopy: boolean;
  notesCount?: number;
  condition: string;
  dateListed: string;
  pageUrls?: string[];
  binding?: string;
  publicationYear?: number;
  language?: string;
  publisher?: string;
  totalPages?: number;
}

let books: Book[] = [
  {
    id: "book-1",
    title: "Operations Management",
    author: "Krajewski, Malhotra & Ritzman",
    edition: "12th Global Edition",
    price: 650,
    originalPrice: 1499,
    distance: "0.2 km (Hostel A, Room 304)",
    sellerName: "Rohit Sharma",
    sellerCourse: "MBA Sec A",
    sellerPhone: "+919875543210",
    coverUrl: "/src/assets/images/used_operations_cover_1781513276942.jpg",
    pageUrls: ["/src/assets/images/operations_pages_1780650920873.png"],
    coverColor: "from-blue-600 to-indigo-800",
    isTopperCopy: true,
    condition: "Pre-marked with color highlights, study formula sheets included!",
    dateListed: "Just now",
    binding: "Paperback",
    publicationYear: 2021,
    language: "English",
    publisher: "Pearson Education",
    totalPages: 528
  },
  {
    id: "book-2",
    title: "Introduction to Algorithms",
    author: "Cormen, Leiserson, Rivest & Stein",
    edition: "3rd Edition",
    price: 850,
    originalPrice: 2199,
    distance: "0.1 km (Central Library Lounge)",
    sellerName: "Ananya Iyer",
    sellerCourse: "BTech CSE Yr-3",
    sellerPhone: "+919123456789",
    coverUrl: "/src/assets/images/used_algorithms_cover_1781513216009.jpg",
    pageUrls: ["/src/assets/images/algorithms_pages_1780650939086.png"],
    coverColor: "from-emerald-700 to-teal-900",
    isTopperCopy: false,
    condition: "Excellent condition, no markings, looks completely new",
    dateListed: "2 hours ago",
    binding: "Hardcover",
    publicationYear: 2018,
    language: "English",
    publisher: "MIT Press",
    totalPages: 1292
  },
  {
    id: "book-3",
    title: "Principles of Microeconomics",
    author: "N. Gregory Mankiw",
    edition: "8th Edition",
    price: 490,
    originalPrice: 1150,
    distance: "0.5 km (Hostel C)",
    sellerName: "Arjun Verma",
    sellerCourse: "BCom Hons Yr-2",
    sellerPhone: "+919988776655",
    coverUrl: "/src/assets/images/used_economics_cover_1781513257218.jpg",
    pageUrls: ["/src/assets/images/economics_pages_1780650958123.png"],
    coverColor: "from-amber-600 to-red-800",
    isTopperCopy: true,
    condition: "Topper neat notes & margin explanations for exam preparation!",
    dateListed: "5 hours ago",
    binding: "Paperback",
    publicationYear: 2020,
    language: "English",
    publisher: "Cengage Learning",
    totalPages: 520
  },
  {
    id: "book-4",
    title: "Organic Chemistry",
    author: "Morrison & Boyd",
    edition: "7th Edition",
    price: 580,
    originalPrice: 1350,
    distance: "0.9 km (Chemistry Lab Block)",
    sellerName: "Siddharth Sen",
    sellerCourse: "BSc Chemistry Yr-3",
    sellerPhone: "+919444332211",
    coverUrl: "/src/assets/images/used_chemistry_cover_1781513240203.jpg",
    pageUrls: ["/src/assets/images/chemistry_pages_1780650974960.png"],
    coverColor: "from-sky-700 to-cyan-950",
    isTopperCopy: false,
    condition: "Gently loved, clean pages, minor corner wear",
    dateListed: "1 day ago",
    binding: "Paperback",
    publicationYear: 2011,
    language: "English",
    publisher: "Pearson India",
    totalPages: 1500
  },
  {
    id: "book-5",
    title: "Artificial Intelligence: A Modern Approach",
    author: "Stuart Russell & Peter Norvig",
    edition: "4th Edition",
    price: 950,
    originalPrice: 2499,
    distance: "0.4 km (Hostel H, Room 215)",
    sellerName: "Pooja Hegde",
    sellerCourse: "MTech AI & Robotics",
    sellerPhone: "+919451122334",
    coverUrl: "/src/assets/images/ai_book_cover_1780654966279.png",
    pageUrls: ["/src/assets/images/ai_sample_page_1780655027865.png"],
    coverColor: "from-purple-700 to-indigo-950",
    isTopperCopy: true,
    condition: "Topper annotated copy with hand-written lecture notes on neural networks!",
    dateListed: "3 hours ago",
    binding: "Hardcover",
    publicationYear: 2020,
    language: "English",
    publisher: "Pearson",
    totalPages: 1152
  },
  {
    id: "book-6",
    title: "Computer Networks",
    author: "Andrew S. Tanenbaum",
    edition: "6th Edition",
    price: 420,
    originalPrice: 999,
    distance: "0.7 km (Hostel D, Study Room)",
    sellerName: "Rohan Das",
    sellerCourse: "BTech CSE Yr-3",
    sellerPhone: "+919234567812",
    coverUrl: "/src/assets/images/networks_book_cover_1780654979699.png",
    pageUrls: ["/src/assets/images/networks_sample_page_1780655044262.png"],
    coverColor: "from-slate-700 to-slate-950",
    isTopperCopy: false,
    condition: "Slight edge-wear, but chapters on TCP/IP are highlighted elegantly.",
    dateListed: "Just now",
    binding: "Paperback",
    publicationYear: 2021,
    language: "English",
    publisher: "Pearson India",
    totalPages: 944
  },
  {
    id: "book-7",
    title: "Molecular Biology of the Cell",
    author: "Bruce Alberts & Alexander Johnson",
    edition: "6th Edition",
    price: 1200,
    originalPrice: 3800,
    distance: "1.2 km (Biotech PG Labs)",
    sellerName: "Meera Krishnan",
    sellerCourse: "MSc Biotechnology Yr-2",
    sellerPhone: "+919345678912",
    coverUrl: "/src/assets/images/biology_book_cover_1780654995826.png",
    pageUrls: ["/src/assets/images/biology_sample_page_1780655062922.png"],
    coverColor: "from-teal-800 to-emerald-950",
    isTopperCopy: true,
    condition: "Immaculate condition. Includes printed class flowcharts & practical workbook!",
    dateListed: "1 day ago",
    binding: "Hardcover",
    publicationYear: 2014,
    language: "English",
    publisher: "Garland Science",
    totalPages: 1464
  },
  {
    id: "book-8",
    title: "Marketing Management",
    author: "Philip Kotler & Kevin Lane Keller",
    edition: "15th Edition",
    price: 600,
    originalPrice: 1599,
    distance: "0.3 km (Hostel B, Desk 42)",
    sellerName: "Vikram Sethi",
    sellerCourse: "MBA Sec C",
    sellerPhone: "+919567812345",
    coverUrl: "/src/assets/images/marketing_book_cover_1780655010231.png",
    pageUrls: ["/src/assets/images/marketing_sample_page_1780655082545.png"],
    coverColor: "from-rose-700 to-rose-950",
    isTopperCopy: true,
    condition: "Brilliantly summarized case studies attached to back covers! Highly recommended for midterms.",
    dateListed: "4 hours ago",
    binding: "Paperback",
    publicationYear: 2016,
    language: "English",
    publisher: "Pearson Education",
    totalPages: 832
  },
  {
    id: "book-9",
    title: "Introduction to Electrodynamics",
    author: "David J. Griffiths",
    edition: "4th Edition",
    price: 540,
    originalPrice: 1250,
    distance: "0.5 km (Hostel F, Room 102)",
    sellerName: "Siddhesh Kulkarni",
    sellerCourse: "BSc Physics Yr-2",
    sellerPhone: "+919812345670",
    coverUrl: "/src/assets/images/used_opt_1_1780909304957.png",
    pageUrls: ["/src/assets/images/electrodynamics_page_1780908004425.png"],
    coverColor: "from-blue-700 to-sky-950",
    isTopperCopy: true,
    condition: "Has extremely helpful side margin notations explaining relativistic electrodynamics derivations!",
    dateListed: "2 hours ago",
    binding: "Hardcover",
    publicationYear: 2017,
    language: "English",
    publisher: "Cambridge University Press",
    totalPages: 624
  },
  {
    id: "book-10",
    title: "Database System Concepts",
    author: "Abraham Silberschatz, Henry F. Korth & S. Sudarshan",
    edition: "7th Edition",
    price: 780,
    originalPrice: 1899,
    distance: "0.8 km (Hostel G, Room 411)",
    sellerName: "Aman Preet",
    sellerCourse: "BTech CSE Yr-3",
    sellerPhone: "+919543210987",
    coverUrl: "/src/assets/images/databases_cover_1780908021371.png",
    pageUrls: ["/src/assets/images/databases_page_1780908038880.png"],
    coverColor: "from-orange-600 to-amber-950",
    isTopperCopy: false,
    condition: "Perfect pages, barely used, with an additional study guide printout of SQL indexing strategies",
    dateListed: "1 hour ago",
    binding: "Paperback",
    publicationYear: 2019,
    language: "English",
    publisher: "McGraw Hill",
    totalPages: 1376
  },
  {
    id: "book-11",
    title: "Principles of Mathematical Analysis",
    author: "Walter Rudin",
    edition: "3rd Edition",
    price: 890,
    originalPrice: 2200,
    distance: "1.5 km (Math PG Department Office)",
    sellerName: "Sanya Roy",
    sellerCourse: "MSc Mathematics Yr-1",
    sellerPhone: "+919876543219",
    coverUrl: "/src/assets/images/analysis_cover_1780908054089.png",
    pageUrls: ["/src/assets/images/analysis_page_1780908073899.png"],
    coverColor: "from-indigo-900 to-slate-950",
    isTopperCopy: true,
    condition: "Topper annotated copy outlining major proof strategies for Heine-Borel and Weierstrass theorems!",
    dateListed: "Just now",
    binding: "Hardcover",
    publicationYear: 1976,
    language: "English",
    publisher: "McGraw Hill Education",
    totalPages: 342
  },
  {
    id: "book-12",
    title: "Signals and Systems",
    author: "Alan V. Oppenheim, Alan S. Willsky & S. Hamid",
    edition: "2nd Edition",
    price: 680,
    originalPrice: 1699,
    distance: "0.2 km (Hostel E, Room 122)",
    sellerName: "Tanmay Deshmukh",
    sellerCourse: "BTech ECE Yr-3",
    sellerPhone: "+919876543231",
    coverUrl: "/src/assets/images/signals_cover_1780908450875.png",
    pageUrls: ["/src/assets/images/signals_page_1780908466016.png"],
    coverColor: "from-blue-800 to-indigo-950",
    isTopperCopy: true,
    condition: "Features complete hand-drawn pole-zero plots and Laplace transform summaries in the margins!",
    dateListed: "Just now",
    binding: "Paperback",
    publicationYear: 1996,
    language: "English",
    publisher: "Pearson Education",
    totalPages: 957
  },
  {
    id: "book-13",
    title: "Artificial Intelligence: Foundations of Computational Agents",
    author: "David L. Poole & Alan K. Mackworth",
    edition: "2nd Edition",
    price: 820,
    originalPrice: 2100,
    distance: "0.6 km (PG Computer Lab Annex)",
    sellerName: "Sanya Gupta",
    sellerCourse: "MTech CSE Yr-2",
    sellerPhone: "+919830012345",
    coverUrl: "/src/assets/images/ai_foundations_cover_1780908327749.png",
    pageUrls: ["/src/assets/images/ai_foundations_page_1780908479822.png"],
    coverColor: "from-purple-900 to-slate-950",
    isTopperCopy: true,
    condition: "Flawless inside pages. Contains handwritten notes on Markov Decision Processes attached at the back.",
    dateListed: "1 hour ago",
    binding: "Hardcover",
    publicationYear: 2017,
    language: "English",
    publisher: "Cambridge University Press",
    totalPages: 826
  },
  {
    id: "book-14",
    title: "Macroeconomics",
    author: "Olivier Blanchard",
    edition: "8th Global Edition",
    price: 520,
    originalPrice: 1299,
    distance: "0.3 km (Hostel H, Lounge)",
    sellerName: "Aditya Shah",
    sellerCourse: "BCom Hons Yr-3",
    sellerPhone: "+919425167812",
    coverUrl: "/src/assets/images/macroeconomics_cover_1780908344293.png",
    pageUrls: ["/src/assets/images/macroeconomics_page_1780908496793.png"],
    coverColor: "from-red-800 to-black",
    isTopperCopy: false,
    condition: "Good condition, IS-LM model curves neatly outlined with color pens inside.",
    dateListed: "3 hours ago",
    binding: "Paperback",
    publicationYear: 2020,
    language: "English",
    publisher: "Pearson Education",
    totalPages: 576
  },
  {
    id: "book-15",
    title: "Mechanics of Materials",
    author: "Ferdinand P. Beer, E. Russell Johnston Jr.",
    edition: "7th Edition",
    price: 610,
    originalPrice: 1450,
    distance: "0.5 km (Hostel C, Study Cell)",
    sellerName: "Rakesh Ranjan",
    sellerCourse: "BTech Mechanical Yr-2",
    sellerPhone: "+919561023456",
    coverUrl: "/src/assets/images/mechanics_cover_1780908358834.png",
    pageUrls: ["/src/assets/images/mechanics_page_1780908510984.png"],
    coverColor: "from-amber-700 to-stone-900",
    isTopperCopy: true,
    condition: "Topper annotated copy detailing beautiful step-by-step Mohr circle constructions!",
    dateListed: "2 hours ago",
    binding: "Paperback",
    publicationYear: 2015,
    language: "English",
    publisher: "McGraw Hill Education",
    totalPages: 816
  },
  {
    id: "book-16",
    title: "Operating System Concepts",
    author: "Abraham Silberschatz, Peter B. Galvin & Greg Gagne",
    edition: "10th Edition",
    price: 740,
    originalPrice: 1999,
    distance: "0.1 km (Hostel A, Reading Room)",
    sellerName: "Vikram Malhotra",
    sellerCourse: "BTech CSE Yr-3",
    sellerPhone: "+919811002233",
    coverUrl: "/src/assets/images/used_opt_2_1780909326288.png",
    pageUrls: ["/src/assets/images/operating_systems_page_1780908527141.png"],
    coverColor: "from-teal-800 to-slate-950",
    isTopperCopy: true,
    condition: "Meticulous color-highlighted chapters on Virtual Memory and Process Scheduling.",
    dateListed: "5 hours ago",
    binding: "Paperback",
    publicationYear: 2018,
    language: "English",
    publisher: "John Wiley & Sons",
    totalPages: 1024
  },
  {
    id: "book-17",
    title: "Principles of Genetics",
    author: "Eldon John Gardner, Michael J. Simmons",
    edition: "8th Edition",
    price: 490,
    originalPrice: 1120,
    distance: "1.1 km (Main Science Auditorium)",
    sellerName: "Neha Nair",
    sellerCourse: "MSc Genetics Yr-1",
    sellerPhone: "+919446012345",
    coverUrl: "/src/assets/images/used_opt_3_1780909342850.png",
    pageUrls: ["/src/assets/images/genetics_page_1780908544676.png"],
    coverColor: "from-emerald-700 to-green-950",
    isTopperCopy: false,
    condition: "No scribbles, great condition with colorful Punnett squares attached.",
    dateListed: "4 hours ago",
    binding: "Paperback",
    publicationYear: 2011,
    language: "English",
    publisher: "Wiley India",
    totalPages: 720
  },
  {
    id: "book-18",
    title: "Abstract Algebra",
    author: "David S. Dummit & Richard M. Foote",
    edition: "3rd Edition",
    price: 980,
    originalPrice: 2800,
    distance: "1.3 km (Srinivasa Ramanujan Hall)",
    sellerName: "Karthik Raja",
    sellerCourse: "MSc Mathematics Yr-2",
    sellerPhone: "+919895012341",
    coverUrl: "/src/assets/images/abstract_algebra_cover_1780908406095.png",
    pageUrls: ["/src/assets/images/abstract_algebra_page_1780908559049.png"],
    coverColor: "from-blue-900 to-neutral-950",
    isTopperCopy: true,
    condition: "Very well kept. Highlights specific proving templates for Galois groups and ring isomorphisms.",
    dateListed: "2 days ago",
    binding: "Hardcover",
    publicationYear: 2003,
    language: "English",
    publisher: "John Wiley & Sons",
    totalPages: 944
  },
  {
    id: "book-19",
    title: "Feedback Control of Dynamic Systems",
    author: "Gene F. Franklin, J. David Powell",
    edition: "8th Edition",
    price: 790,
    originalPrice: 1850,
    distance: "0.4 km (Engineering Mechanical Block)",
    sellerName: "Arnav Goel",
    sellerCourse: "BTech Electrical Yr-3",
    sellerPhone: "+919023456711",
    coverUrl: "/src/assets/images/control_systems_cover_1780908426554.png",
    pageUrls: ["/src/assets/images/control_systems_page_1780908573421.png"],
    coverColor: "from-red-950 to-neutral-900",
    isTopperCopy: true,
    condition: "Fully annotated with step-by-step root locus rules and Bode responses plotted on sticky notes.",
    dateListed: "1 day ago",
    binding: "Hardcover",
    publicationYear: 2019,
    language: "English",
    publisher: "Pearson Education",
    totalPages: 880
  },
  {
    id: "book-20",
    title: "Introduction to Quantum Mechanics",
    author: "David J. Griffiths, Darrell F. Schroeter",
    edition: "3rd Edition",
    price: 640,
    originalPrice: 1550,
    distance: "0.2 km (Hostel F, Lounge)",
    sellerName: "Siddhesh Kulkarni",
    sellerCourse: "BSc Physics Yr-2",
    sellerPhone: "+919812345670",
    coverUrl: "/src/assets/images/used_opt_1_1780909304957.png",
    pageUrls: ["/src/assets/images/control_systems_page_1780908573421.png"],
    coverColor: "from-blue-950 to-neutral-900",
    isTopperCopy: true,
    condition: "Includes detailed handwritten calculations for the 1D harmonic oscillator potential wells!",
    dateListed: "3 hours ago",
    binding: "Hardcover",
    publicationYear: 2018,
    language: "English",
    publisher: "Cambridge University Press",
    totalPages: 508
  },
  {
    id: "book-21",
    title: "Financial Accounting",
    author: "Robert Libby, Patricia Libby & Frank Hodge",
    edition: "10th Edition",
    price: 580,
    originalPrice: 1750,
    distance: "0.6 km (Hostel B, study desks)",
    sellerName: "Mridula Roy",
    sellerCourse: "MBA Finance Yr-1",
    sellerPhone: "+919256417382",
    coverUrl: "/src/assets/images/operating_systems_cover_1780908373588.png",
    pageUrls: ["/src/assets/images/operating_systems_page_1780908527141.png"],
    coverColor: "from-indigo-900 to-slate-950",
    isTopperCopy: false,
    condition: "Very subtle highlights on balance sheets and ledger reconciliation tables.",
    dateListed: "4 hours ago",
    binding: "Hardcover",
    publicationYear: 2019,
    language: "English",
    publisher: "McGraw-Hill Education",
    totalPages: 768
  },
  {
    id: "book-22",
    title: "Compilers: Principles, Techniques, and Tools",
    author: "Alfred V. Aho, Monica S. Lam, Ravi Sethi & Jeffrey D. Ullman",
    edition: "2nd Edition (Dragon Book)",
    price: 850,
    originalPrice: 2250,
    distance: "0.8 km (Hostel G, Room 114)",
    sellerName: "Jasmeet Singh",
    sellerCourse: "BTech CSE Yr-3",
    sellerPhone: "+919814422335",
    coverUrl: "/src/assets/images/ai_foundations_cover_1780908327749.png",
    pageUrls: ["/src/assets/images/ai_foundations_page_1780908479822.png"],
    coverColor: "from-purple-950 to-indigo-950",
    isTopperCopy: true,
    condition: "Excellent state, parser tables annotated brilliantly with colored ink flags.",
    dateListed: "Just now",
    binding: "Paperback",
    publicationYear: 2006,
    language: "English",
    publisher: "Pearson India",
    totalPages: 1040
  },
  {
    id: "book-23",
    title: "Corporate Finance",
    author: "Jonathan Berk & Peter DeMarzo",
    edition: "5th Global Edition",
    price: 900,
    originalPrice: 2490,
    distance: "0.3 km (Hostel B, Room 22)",
    sellerName: "Vikram Sethi",
    sellerCourse: "MBA Sec C",
    sellerPhone: "+919567812345",
    coverUrl: "/src/assets/images/used_opt_4_1780909358755.png",
    pageUrls: ["/src/assets/images/macroeconomics_page_1780908496793.png"],
    coverColor: "from-zinc-800 to-black",
    isTopperCopy: true,
    condition: "Valuation models annotated with tips on DCF modeling for exams.",
    dateListed: "Just now",
    binding: "Hardcover",
    publicationYear: 2019,
    language: "English",
    publisher: "Pearson",
    totalPages: 1136
  },
  {
    id: "book-24",
    title: "Thermodynamics: An Engineering Approach",
    author: "Yunus A. Cengel, Michael A. Boles",
    edition: "9th Edition",
    price: 630,
    originalPrice: 1650,
    distance: "0.4 km (Engineering Mech Labs)",
    sellerName: "Rohit Sharma",
    sellerCourse: "BTech Mechanical Yr-2",
    sellerPhone: "+919425167812",
    coverUrl: "/src/assets/images/control_systems_cover_1780908426554.png",
    pageUrls: ["/src/assets/images/control_systems_page_1780908573421.png"],
    coverColor: "from-orange-950 to-neutral-900",
    isTopperCopy: false,
    condition: "Minor cover bends, completely neat inside with dynamic cycle charts.",
    dateListed: "5 hours ago",
    binding: "Paperback",
    publicationYear: 2019,
    language: "English",
    publisher: "McGraw Hill Education",
    totalPages: 1008
  },
  {
    id: "book-25",
    title: "Classical Mechanics",
    author: "Herbert Goldstein, Charles P. Poole",
    edition: "3rd Edition",
    price: 790,
    originalPrice: 2100,
    distance: "1.4 km (Physics PG Block Library)",
    sellerName: "Sanya Roy",
    sellerCourse: "MSc Physics Yr-1",
    sellerPhone: "+919876543219",
    coverUrl: "/src/assets/images/control_systems_cover_1780908426554.png",
    pageUrls: ["/src/assets/images/mechanics_page_1780908510984.png"],
    coverColor: "from-neutral-950 to-slate-900",
    isTopperCopy: true,
    condition: "Stellar annotated equations focusing on advanced Lagrangian and Hamiltonian formulations.",
    dateListed: "2 hours ago",
    binding: "Hardcover",
    publicationYear: 2001,
    language: "English",
    publisher: "Pearson India",
    totalPages: 664
  },
  {
    id: "book-26",
    title: "Introduction to Real Analysis",
    author: "Robert G. Bartle, Donald R. Sherbert",
    edition: "4th Edition",
    price: 450,
    originalPrice: 1050,
    distance: "0.7 km (Hostel H, Study lounge)",
    sellerName: "Anik Samanta",
    sellerCourse: "BSc Maths Yr-3",
    sellerPhone: "+919445102914",
    coverUrl: "/src/assets/images/abstract_algebra_cover_1780908406095.png",
    pageUrls: ["/src/assets/images/abstract_algebra_page_1780908559049.png"],
    coverColor: "from-blue-950 to-slate-950",
    isTopperCopy: true,
    condition: "Annotated proofs on Cauchy sequences and Riemann integration. Extremely helpful for exams.",
    dateListed: "1 hour ago",
    binding: "Paperback",
    publicationYear: 2011,
    language: "English",
    publisher: "Wiley India",
    totalPages: 416
  },
  {
    id: "book-27",
    title: "Cell and Molecular Biology",
    author: "Gerald Karp, Janet Iwasa",
    edition: "8th Edition",
    price: 950,
    originalPrice: 2600,
    distance: "1.2 km (Biosciences PG wing)",
    sellerName: "Diana D'Souza",
    sellerCourse: "MSc Biotech Yr-2",
    sellerPhone: "+919112233445",
    coverUrl: "/src/assets/images/genetics_cover_1780908386418.png",
    pageUrls: ["/src/assets/images/genetics_page_1780908544676.png"],
    coverColor: "from-emerald-950 to-black",
    isTopperCopy: true,
    condition: "Topper annotated copy highlighting metabolic pathways and signal transduction routes.",
    dateListed: "Yesterday",
    binding: "Hardcover",
    publicationYear: 2015,
    language: "English",
    publisher: "Wiley",
    totalPages: 832
  },
  {
    id: "book-28",
    title: "Strategic Management",
    author: "Fred R. David & Forest R. David",
    edition: "16th Edition",
    price: 490,
    originalPrice: 1199,
    distance: "0.4 km (Hostel B, Room 301)",
    sellerName: "Tanvi Saxena",
    sellerCourse: "MBA Sec A",
    sellerPhone: "+919865431678",
    coverUrl: "/src/assets/images/macroeconomics_cover_1780908344293.png",
    pageUrls: ["/src/assets/images/macroeconomics_page_1780908496793.png"],
    coverColor: "from-slate-800 to-stone-950",
    isTopperCopy: false,
    condition: "Slight covers crease, but pages are extremely clean. Business canvases are clearly pre-marked.",
    dateListed: "2 hours ago",
    binding: "Paperback",
    publicationYear: 2016,
    language: "English",
    publisher: "Pearson",
    totalPages: 688
  },
  {
    id: "book-29",
    title: "Design of Machine Elements",
    author: "V.B. Bhandari",
    edition: "4th Edition",
    price: 590,
    originalPrice: 1399,
    distance: "0.6 km (Central Workshop)",
    sellerName: "Aman Preet",
    sellerCourse: "BTech Mechanical Yr-3",
    sellerPhone: "+919543210987",
    coverUrl: "/src/assets/images/mechanics_cover_1780908358834.png",
    pageUrls: ["/src/assets/images/mechanics_page_1780908510984.png"],
    coverColor: "from-neutral-900 to-amber-950",
    isTopperCopy: true,
    condition: "Full solutions to shaft and gearbox problems hand-written across chapter end exercises.",
    dateListed: "Just now",
    binding: "Paperback",
    publicationYear: 2016,
    language: "English",
    publisher: "McGraw Hill Education",
    totalPages: 960
  },
  {
    id: "book-30",
    title: "Digital Signal Processing",
    author: "John G. Proakis, Dimitris G. Manolakis",
    edition: "4th Edition",
    price: 690,
    originalPrice: 1750,
    distance: "0.2 km (Hostel E, Room 302)",
    sellerName: "Tanmay Deshmukh",
    sellerCourse: "BTech ECE Yr-3",
    sellerPhone: "+919876543231",
    coverUrl: "/src/assets/images/signals_cover_1780908450875.png",
    pageUrls: ["/src/assets/images/signals_page_1780908466016.png"],
    coverColor: "from-indigo-950 to-neutral-950",
    isTopperCopy: true,
    condition: "Includes printed notes for FFT and butterfly diagram algorithms. Topper annotated.",
    dateListed: "Just now",
    binding: "Paperback",
    publicationYear: 2007,
    language: "English",
    publisher: "Pearson Education",
    totalPages: 1084
  },
  {
    id: "book-31",
    title: "An Introduction to Thermal Physics",
    author: "Daniel V. Schroeder",
    edition: "1st Edition",
    price: 480,
    originalPrice: 1100,
    distance: "0.5 km (Hostel F, Room 102)",
    sellerName: "Siddhesh Kulkarni",
    sellerCourse: "BSc Physics Yr-2",
    sellerPhone: "+919812345670",
    coverUrl: "/src/assets/images/control_systems_cover_1780908426554.png",
    pageUrls: ["/src/assets/images/control_systems_page_1780908573421.png"],
    coverColor: "from-amber-950 to-stone-950",
    isTopperCopy: false,
    condition: "Excellent condition. Ideal guide for thermodynamic potentials and statistical mechanics.",
    dateListed: "3 hours ago",
    binding: "Paperback",
    publicationYear: 1999,
    language: "English",
    publisher: "Oxford University Press",
    totalPages: 448
  },
];

// Horizontal scrolling Bounty List (seeking items / immediately matching demand)
interface Bounty {
  id: string;
  seekingText: string;
  course: string;
  offeredReward: string;
}

let bounties: Bounty[] = [
  { id: "b-1", seekingText: "Statistics for Business Cover", course: "MBA QTM", offeredReward: "Offering ₹500" },
  { id: "b-2", seekingText: "Marketing Management by Kotler", course: "MBA Sec B", offeredReward: "Required urgently" },
  { id: "b-3", seekingText: "Operating System Concepts", course: "BTech Yr-2", offeredReward: "Willing to pay ₹700" },
  { id: "b-4", seekingText: "DC Pandey Physics", course: "JEE prep", offeredReward: "Can trade with chemistry guide" },
];

// Configure larger body parsers for high-res base64 images scanned from phone camera
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Express API endpoints
// 1. Get all books
app.get("/api/books", (req, res) => {
  res.json(books);
});

// 2. Create standard book
app.post("/api/books", (req, res) => {
  const {
    title,
    author,
    edition,
    price,
    originalPrice,
    distance,
    sellerName,
    sellerCourse,
    sellerPhone,
    coverUrl,
    pageUrls,
    coverColor,
    isTopperCopy,
    condition,
    binding,
    publicationYear,
    language,
    publisher,
    totalPages,
  } = req.body;

  if (!title || !price || !sellerPhone) {
    return res.status(400).json({ error: "Missing required fields (Title, Price, Phone Number)" });
  }

  const newBook: Book = {
    id: `book-${Date.now()}`,
    title: String(title),
    author: String(author || "Unknown Author"),
    edition: String(edition || "First Edition"),
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    distance: String(distance || "0.1 km (Nearby)"),
    sellerName: String(sellerName || "Anonymous Seller"),
    sellerCourse: String(sellerCourse || "General Course"),
    sellerPhone: String(sellerPhone),
    coverUrl: coverUrl ? String(coverUrl) : undefined,
    pageUrls: Array.isArray(pageUrls) ? pageUrls : (pageUrls ? [String(pageUrls)] : []),
    coverColor: coverColor || "from-slate-700 to-gray-900",
    isTopperCopy: !!isTopperCopy,
    condition: String(condition || "Good condition"),
    dateListed: "Just listed",
    binding: binding ? String(binding) : "Paperback",
    publicationYear: publicationYear ? Number(publicationYear) : new Date().getFullYear(),
    language: language ? String(language) : "English",
    publisher: publisher ? String(publisher) : "Unknown Publisher",
    totalPages: totalPages ? Number(totalPages) : undefined,
  };

  books = [newBook, ...books];
  res.status(201).json(newBook);
});

// 3. Get all bounties
app.get("/api/bounties", (req, res) => {
  res.json(bounties);
});

// 4. Add bounty (seeking bubble)
app.post("/api/bounties", (req, res) => {
  const { seekingText, course, offeredReward } = req.body;
  if (!seekingText) {
    return res.status(400).json({ error: "Seeking text is required" });
  }
  const newBounty: Bounty = {
    id: `b-${Date.now()}`,
    seekingText: String(seekingText),
    course: String(course || "Any course"),
    offeredReward: String(offeredReward || "Negotiable"),
  };
  bounties = [newBounty, ...bounties];
  res.status(201).json(newBounty);
});

// 5. Scan book cover using Gemini-3.5-flash
app.post("/api/scan-book", async (req, res) => {
  if (!ai) {
    return res.status(500).json({
      error: "Gemini API client is not initialized. Please verify your GEMINI_API_KEY environment variable.",
    });
  }

  const { imageBase64 } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: "No book cover image data provided" });
  }

  try {
    // Strip the data URL header if present (e.g. "data:image/png;base64,xxxx")
    let rawBase64 = imageBase64;
    let mimeType = "image/jpeg";

    if (imageBase64.includes(";base64,")) {
      const parts = imageBase64.split(";base64,");
      rawBase64 = parts[1];
      const match = parts[0].match(/data:(.*?)$/);
      if (match) {
        mimeType = match[1];
      }
    }

    const imagePart = {
      inlineData: {
        data: rawBase64,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: "You are a specialized textbook and study-notes detector for college campus library markets. Analyze the cover image of the textbook to extract details. Identify the Book Title, Book Author(s), and Book Edition, estimated publication year, estimated or detected primary publisher, likely language, estimated total pages based on textbook thickness, and binding style (Paperback or Hardcover). Additionally, look close for student signatures, handwriting markup, custom study labels, or highlighting markers on the cover suggesting custom student notes or a previous high-scoring topper textbook edition ('Topper's copy'). Return proper values. Write Title, Author, and Publisher neatly with standard capitalization rules.",
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "The complete, properly capitalized textbook title or study notebook title.",
            },
            author: {
              type: Type.STRING,
              description: "The primary author or authors of the textbook, or the course subject for notebook guides.",
            },
            edition: {
              type: Type.STRING,
              description: "The edition number (e.g. '12th Edition', 'Global Edition') or publication description. Keep it concise.",
            },
            isTopperCopy: {
              type: Type.BOOLEAN,
              description: "True if you detect handwritten text, annotations, study tags, or handmarked signatures on the book cover/spine representing student work.",
            },
            binding: {
              type: Type.STRING,
              description: "Likely binding style. Choose between 'Paperback' or 'Hardcover'.",
            },
            publicationYear: {
              type: Type.INTEGER,
              description: "The printed or estimated four-digit publication year of this edition.",
            },
            language: {
              type: Type.STRING,
              description: "Primary language of the textbook. E.g. 'English', 'Hindi', etc.",
            },
            publisher: {
              type: Type.STRING,
              description: "The publishing agency name, e.g. 'Pearson', 'McGraw Hill', 'MIT Press', etc.",
            },
            totalPages: {
              type: Type.INTEGER,
              description: "An estimation or lookup of the total number of pages in the printed volume (e.g., 450, 800, 1200).",
            },
          },
          required: ["title", "author", "edition", "isTopperCopy", "binding", "publicationYear", "language", "publisher", "totalPages"],
        },
      },
    });

    const parsedResult = JSON.parse(response.text || "{}");
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Error scanning cover photo with Gemini:", error);
    res.status(500).json({
      error: "Could not scan the book cover. Please try again or fill the fields manually.",
      details: error.message,
    });
  }
});

// Vite middleware & Static routing
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Campus Shelf server booting up on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start the Express server:", err);
});
