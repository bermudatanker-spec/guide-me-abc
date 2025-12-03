// app/[lang]/blog/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ResponsiveImage from "@/components/ResponsiveImage";
import ShareBar from "./ShareBar";
import { isLocale, type Locale } from "@/i18n/config";
import { formatDate } from "@/lib/formatDate";

/* ------------ Demo data (zelfde keys als je slugs) ------------- */

const blogPosts = {
  "hidden-gems-aruba": {
    title: "10 Hidden Gems in Aruba You Must Visit",
    author: "Maria Rodriguez",
    date: "2025-01-05",
    readTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&auto=format&fit=crop",
    tags: ["Aruba", "Travel Tips", "Beaches"],
    content: `<p>Aruba is famous for Eagle Beach and Palm Beach, but if you only stay on the main strip you’ll miss a whole other side of the island. This guide takes you to ten quieter coves, local hangouts and viewpoints that many visitors never see.</p>

<h2>1. Tres Trapi – Starfish Cove</h2>
<p>On the north-west coast you’ll find a tiny rocky staircase carved into the limestone: Tres Trapi. From here you can slip straight into turquoise water that is usually calm and crystal clear. Early in the morning you often spot starfish on the sandy bottom and turtles gliding past the reef.</p>
<ul>
  <li><strong>Best time:</strong> Early morning for calm water and fewer people.</li>
  <li><strong>Bring:</strong> Reef-safe sunscreen, snorkel set, and water shoes for the rocky entry.</li>
</ul>

<h2>2. Boca Catalina &amp; Catalina Cove</h2>
<p>Just a little further up the coast from the high-rise hotels lies Boca Catalina, a small bay with white sand and lots of shade from divi-divi trees. A short swim from shore brings you over colourful coral heads, schools of blue tang and sometimes even seahorses.</p>
<ul>
  <li>Great for families – easy entry and usually no strong current.</li>
  <li>Perfect sunset spot when the catamarans sail by in the distance.</li>
</ul>

<h2>3. Arashi Dunes &amp; California Lighthouse View</h2>
<p>Most visitors drive up to the California Lighthouse, take a quick photo and leave again. If you walk a little further north into the dunes, you’ll find quiet sandy paths, dramatic cactus landscapes and ocean views where you can sit and watch the waves crash onto the cliffs below.</p>
<ul>
  <li><strong>Tip:</strong> Come an hour before sunset and walk the dunes trail – it feels like you have the north shore to yourself.</li>
</ul>

<h2>4. Mangel Halto Mangrove Lagoon</h2>
<p>Hidden at the edge of the residential area of Pos Chiquito lies Mangel Halto, a snorkel lagoon surrounded by mangroves and wooden decks. The water close to shore is shallow and clear, while a little further out you’ll find a drop-off with larger coral formations and schools of fish.</p>
<ul>
  <li>Ideal for kayak or SUP tours through the mangroves.</li>
  <li>Bring insect repellent if you stay until sunset.</li>
</ul>

<h2>5. Spanish Lagoon &amp; Coastal Trail</h2>
<p>Spanish Lagoon is one of Aruba’s most important nature reserves and a favourite spot for birdwatchers. A small unmarked trail runs along the water and into the coastal forest, where you can spot herons, pelicans and ospreys hunting for fish.</p>
<ul>
  <li><strong>Good to know:</strong> There are very few facilities here – bring water and good shoes.</li>
</ul>

<h2>6. Seroe Colorado Cliffs &amp; Baby Beach Viewpoint</h2>
<p>Most people drive all the way to Baby Beach and rush straight into the water. Take a little detour to the Seroe Colorado cliffs first. From the viewpoint you have a panoramic look over turquoise Baby Beach on one side and the wild east coast on the other.</p>
<ul>
  <li>A fantastic spot for sunrise or golden hour photos.</li>
</ul>

<h2>7. Grapefield Beach &amp; Nearby Caves</h2>
<p>On the way to Baby Beach you’ll pass Grapefield, a long stretch of sand that’s usually almost empty. Local kitesurfers love the steady trade winds here, and on calmer days you can walk for ages along the waterline. Inland you’ll find a few small limestone caves with ancient rock formations.</p>

<h2>8. Rodger’s Beach – The Quiet Neighbour of Baby Beach</h2>
<p>Rodger’s Beach sits just around the corner from famous Baby Beach, but is much quieter, especially during weekdays. Fishing boats gently rock in the bay and the water is usually calm enough for kids. It’s a great place to experience the more local side of San Nicolas.</p>

<h2>9. Alto Vista Chapel &amp; Peace Labyrinth</h2>
<p>The tiny yellow Alto Vista chapel is one of Aruba’s most spiritual places. Behind the chapel you’ll find a walking labyrinth shaped out of white stones. Follow the path slowly while you look over the rugged north coast – it’s a peaceful break from the busier resort area.</p>

<h2>10. Local Snack Trucks &amp; “Keshi Yena” Spots</h2>
<p>Some of Aruba’s best flavours are found far away from hotel restaurants. In the evening, check where the snack trucks and food stalls set up along the roads around Noord and Santa Cruz. Try local favourites such as <em>keshi yena</em> (stuffed cheese), pastechi and fresh fish straight from the grill.</p>

<h2>Practical Tips for Exploring Aruba’s Hidden Gems</h2>
<ul>
  <li>Rent a car so you can reach the more remote beaches and viewpoints.</li>
  <li>Always take drinking water, sun protection and proper footwear for rocky entries.</li>
  <li>Respect nature: do not touch coral, keep distance from turtles and never take starfish out of the water.</li>
  <li>Check wind and wave conditions before swimming on the wild east coast.</li>
</ul>

<p>If you mix a few of these hidden spots with the classic highlights, you’ll experience a much more authentic side of Aruba – with quiet coves, local food and some of the best views on the island.</p>`,
    relatedPosts: ["diving-guide-bonaire"],
  },
  "diving-guide-bonaire": {
    title: "The Ultimate Diving Guide to Bonaire",
    author: "John van der Berg",
    date: "2025-01-03",
    readTime: "8 min read",
    image:
      "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=1200&auto=format&fit=crop",
    tags: ["Bonaire", "Diving", "Activities"],
    content: `<p><h1>The Ultimate Diving Guide to Bonaire (2025)</h1>

<p>Bonaire is often called the <strong>shore diving capital of the world</strong> — and for good reason. With calm waters, excellent visibility, and over 80 marked dive sites, the island is a paradise for both beginners and advanced divers. Whether you’re exploring vibrant coral reefs or swimming alongside sea turtles, diving in Bonaire is an experience unlike anywhere else in the Caribbean.</p>

<p>In this guide, you’ll learn the best dive sites, tips for beginners, recommended gear, and how to get the most value when choosing a local dive operator. And thanks to new online platforms, local dive companies now finally have the chance to compete fairly with big international operators.</p>

<hr/>

<h2>1. Why Bonaire Is One of the Best Diving Destinations in the World</h2>

<p>Bonaire’s reputation comes from a combination of factors:</p>

<ul>
  <li>Calm waters almost year-round</li>
  <li>Visibility often exceeding <strong>30 meters</strong></li>
  <li>Dozens of accessible shore dive sites</li>
  <li>Healthy coral reefs protected for decades</li>
  <li>Warm water temperatures (26–29°C)</li>
</ul>

<p>This makes the island suitable for every type of diver — from complete beginners to advanced technical divers.</p>

<hr/>

<h2>2. How Shore Diving Works in Bonaire</h2>

<p>One of the nicest aspects of diving in Bonaire is that you don’t always need a boat. Many dive sites are marked with yellow stones along the road. You simply park, gear up, and walk straight into the water.</p>

<p>Popular shore dive sites include:</p>

<ul>
  <li><strong>1000 Steps</strong> – crystal-clear waters and sea turtles</li>
  <li><strong>Salt Pier</strong> – iconic pillars filled with fish and light beams</li>
  <li><strong>Andrea I & II</strong> – calm reefs, perfect for beginners</li>
  <li><strong>Bachelor’s Beach</strong> – beautiful walls and soft coral gardens</li>
  <li><strong>Oil Slick Leap</strong> – fun entry jump for adventurous divers</li>
</ul>

<hr/>

<h2>3. Best Time of the Year to Dive in Bonaire</h2>

<p>Diving is good year-round, but:</p>

<ul>
  <li><strong>Best conditions:</strong> March–October</li>
  <li><strong>Quietest months:</strong> May & June</li>
  <li><strong>Turtle season:</strong> June–September</li>
</ul>

<p>Water temperature stays warm throughout the year, so no thick wetsuit needed.</p>

<hr/>

<h2>4. Required Gear for Diving in Bonaire</h2>

<p>You can bring your own gear or rent everything locally. Most dive shops offer equipment at competitive prices.</p>

<p>Recommended gear:</p>

<ul>
  <li>3mm wetsuit</li>
  <li>Boots + open-heel fins (for shore entries)</li>
  <li>Reef-safe sunscreen</li>
  <li>Surface marker buoy (SMB)</li>
</ul>

<hr/>

<h2>5. Boat Diving vs Shore Diving</h2>

<p>While shore diving is what Bonaire is known for, boat diving gives access to Klein Bonaire and more remote sites.</p>

<ul>
  <li><strong>Shore diving:</strong> cheap, flexible, unlimited</li>
  <li><strong>Boat diving:</strong> structured, guided, unique sites</li>
</ul>

<p>Most experienced divers enjoy a mix of both.</p>

<hr/>

<h2>6. Costs of Diving in Bonaire</h2>

<p>Bonaire’s diving can be affordable — but prices vary heavily depending on the operator. Packages often include:</p>

<ul>
  <li>Unlimited air tanks (shore diving)</li>
  <li>Discounted boat trips</li>
  <li>Equipment rentals</li>
  <li>Guided dives</li>
</ul>

<p>International chains tend to charge more, while local operators usually offer better value and more personal service.</p>

<hr/>

<h2>7. Watch Out for Hidden Fees</h2>

<p>To avoid surprises, check if your package includes:</p>

<ul>
  <li>Marine park tag</li>
  <li>Weights & weight belt</li>
  <li>Nitrox upgrades</li>
  <li>Equipment insurance</li>
  <li>Boat surcharges</li>
</ul>

<hr/>

<h2>8. Why Supporting Local Dive Shops Matters — And Saves Money</h2>

<p>For many years, the most affordable and reliable diving experiences on Bonaire were passed around through <strong>word-of-mouth</strong>. Locals recommended small, independent dive shops that offered excellent guides, fair prices, and relaxed service — but these businesses remained mostly offline.</p>

<p>This made it difficult for visitors to discover them, so the larger and more well-known companies continued to dominate the market with higher prices.</p>

<p>Now, thanks to modern platforms like ours, smaller dive operators finally have the opportunity to be visible online, compete fairly, and attract new customers.</p>

<p>The impact is significant:</p>

<ul>
  <li><strong>More competition</strong> means better prices</li>
  <li><strong>Local businesses grow</strong> instead of being overshadowed</li>
  <li><strong>Divers get more authentic experiences</strong></li>
  <li><strong>The big chains lose their monopoly</strong></li>
</ul>

<p>As a result, divers benefit from:</p>
<ul>
  <li>Lower prices</li>
  <li>More flexible packages</li>
  <li>Smaller groups and personal attention</li>
  <li>Supporting local families & community businesses</li>
</ul>

<p>It’s a win for both the local economy and visitors.</p>

<hr/>

<h2>9. Best Local Dive Shops to Consider</h2>

<p>(Replace these later with your partnered companies.)</p>

<ul>
  <li>Family-owned shore diving specialists</li>
  <li>Independent technical dive instructors</li>
  <li>Small dive schools near Kralendijk</li>
  <li>Eco-focused operators near Lac Bay</li>
</ul>

<hr/>

<h2>10. Conclusion</h2>

<p>Bonaire remains one of the world’s greatest diving destinations — and with the rise of online platforms supporting local operators, it’s now easier than ever to enjoy high-quality dives at competitive prices.</p>

<p>Whether you're a beginner exploring a reef for the first time or an experienced diver seeking new adventures, Bonaire offers unmatched freedom, visibility, and beauty beneath the surface.</p>

<p>And by choosing a local dive shop, you’ll not only save money — you’ll help the island’s small businesses thrive and keep Bonaire’s dive culture authentic and accessible.</p>`,
    relatedPosts: ["hidden-gems-aruba", "budget-car-rental-curacao"],
  },
  "budget-car-rental-curacao": {
    title: "How to Rent a Car Cheaply in Curaçao",
    author: "Sophie Martinez",
    date: "2025-01-01",
    readTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&auto=format&fit=crop",
    tags: ["Curaçao", "Car Rentals", "Budget Travel"],
    content: `<p><h1>How to Rent a Car Cheaply in Curaçao (2025 Guide)</h1>

<p>Exploring Curaçao by car is the best way to enjoy the island’s hidden beaches, colorful neighborhoods, and natural beauty. While large international rental companies dominate the airport area, they are often far more expensive than necessary. With the right strategies, travelers can save a significant amount of money — and in many cases, get better service too.</p>

<p>This guide explains how to get the best rental deals in Curaçao, how to avoid tourist traps, and why local rental companies are becoming more accessible and affordable than ever before.</p>

<hr/>

<h2>1. Why Renting a Car in Curaçao Is Essential</h2>
<p>Curaçao has limited public transportation and many of the island’s best beaches, snorkel spots, and viewpoints are not easily accessible without a car. Taxis are also expensive, especially for longer distances. Renting a car gives you the freedom to explore:</p>

<ul>
  <li>Playa Grandi (sea turtles)</li>
  <li>Klein Knip & Grote Knip</li>
  <li>Shete Boka National Park</li>
  <li>Jan Thiel & Mambo Beach</li>
  <li>Local restaurants outside tourist zones</li>
</ul>

<hr/>

<h2>2. Airport Rentals vs. Local Rentals — Big Price Difference</h2>
<p>The biggest mistake visitors make is renting directly at Curaçao International Airport. Prices are often:</p>

<ul>
  <li><strong>30–60% higher</strong> than necessary</li>
  <li>Loaded with extra fees</li>
  <li>More strict regarding deposits and insurance</li>
</ul>

<p>Local, independent rental companies away from the airport usually offer:</p>

<ul>
  <li>Lower prices</li>
  <li>Flexible pick-up & drop-off</li>
  <li>No aggressive upselling</li>
  <li>Better, more personal service</li>
</ul>

<hr/>

<h2>3. Best Times of the Year to Get a Cheap Rental</h2>
<p>Prices vary depending on the season:</p>

<ul>
  <li><strong>Cheapest:</strong> May–November</li>
  <li><strong>Most expensive:</strong> December–April</li>
</ul>

<p>Booking early almost always results in better deals, especially during high season.</p>

<hr/>

<h2>4. What Type of Car Should You Rent?</h2>
<p>Most travelers choose compact cars because they’re cheap, fuel-efficient, and suitable for Curaçao’s roads.</p>

<ul>
  <li><strong>Compact cars</strong> → Best price</li>
  <li><strong>SUV</strong> → Recommended if exploring rugged northern areas</li>
  <li><strong>Vans</strong> → Ideal for groups or families</li>
</ul>

<hr/>

<h2>5. Insurance — What You Really Need</h2>
<p>A common money-saver is understanding rental insurance. Many companies will try to sell expensive full-coverage packages. In reality:</p>

<ul>
  <li>Your credit card may already offer collision insurance</li>
  <li>Local companies often include basic coverage in the price</li>
  <li>You rarely need the “premium” upsell insurance</li>
</ul>

<p>Always check your credit card benefits before booking.</p>

<hr/>

<h2>6. Deposits — Read This Before Booking</h2>
<p>Some large rental chains require high deposits ($500–$1500). Local companies usually offer:</p>

<ul>
  <li>Lower deposits</li>
  <li>Cash or debit-friendly options</li>
  <li>More flexibility</li>
</ul>

<hr/>

<h2>7. Watch Out for These Hidden Fees</h2>
<p>To avoid surprises, check whether the rental price includes:</p>

<ul>
  <li>Additional driver fee</li>
  <li>Airport tax</li>
  <li>Insurance add-ons</li>
  <li>Youth or “under 25” fees</li>
</ul>

<hr/>

<h2>8. Tips to Get the Best Price</h2>
<ul>
  <li>Compare at least 3 companies</li>
  <li>Book early during high season</li>
  <li>Don’t rent from the airport if possible</li>
  <li>Check if unlimited mileage is included</li>
  <li>Avoid unnecessary upgrades</li>
</ul>

<hr/>

<h2>9. Recommended Budget-Friendly Companies</h2>
<p>(You can replace these with your partnered local companies later.)</p>

<ul>
  <li>Local family-owned agencies</li>
  <li>Neighborhood rentals near Mambo Beach</li>
  <li>Independent SUV specialists</li>
</ul>

<hr/>

<h2>10. How Local Companies Are Becoming More Affordable</h2>
<p>Traditionally, the most affordable way to rent a car in Curaçao was through <strong>word-of-mouth</strong>. Locals would recommend small family-run rental businesses to friends and visitors. These companies often offered much better prices than the big international chains — but they were almost invisible online.</p>

<p>Because of this, many tourists ended up renting from large airport companies, paying significantly more while local businesses struggled to compete.</p>

<p>With the launch of our platform, this dynamic is changing. <strong>We give local car rental companies the online visibility they never had before.</strong> Instead of relying solely on local recommendations, they can now reach thousands of travelers directly.</p>

<p>The result?</p>

<ul>
  <li><strong>More competition</strong> across the rental market</li>
  <li><strong>Lower prices</strong> for visitors</li>
  <li><strong>Fair opportunities</strong> for local businesses</li>
  <li><strong>A healthier market</strong> no longer dominated only by big corporations</li>
</ul>

<p>This platform helps break the long-standing monopoly of large rental companies — creating a more balanced and affordable rental landscape for everyone.</p>

<hr/>

<h2>Conclusion</h2>
<p>Renting a car cheaply in Curaçao is absolutely possible — especially now that local companies have a stronger online presence and can finally compete fairly. Whether you want to explore beaches, restaurants, or national parks, choosing the right rental company can save you hundreds of dollars and give you a better travel experience overall.</p>

<p>By comparing prices, avoiding airport markups, and supporting local businesses, you’ll get the best possible value during your stay on this beautiful Caribbean island.</p>`,
    relatedPosts: [],
  },
} as const;

type PostKey = keyof typeof blogPosts;

/* --------- Type voor route-params (als Promise) ---------- */

type RouteParams = {
  lang: Locale;
  slug: PostKey;
};

type PageParamsPromise = {
  params: Promise<RouteParams>;
};

/* ---------------------- SEO metadata ---------------------- */

export async function generateMetadata(
  { params }: PageParamsPromise
): Promise<Metadata> {
  const { lang: rawLang, slug } = await params; // ✅ eerst await
  const lang = isLocale(rawLang) ? rawLang : "en";

  const post = blogPosts[slug];
  if (!post) {
    return {
      title: "Post not found | Guide Me ABC",
      description: "This article could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const desc = post.content.replace(/<[^>]+>/g, "").slice(0, 160);

  const languages: Record<string, string> = {
    en: `/en/blog/${slug}`,
    nl: `/nl/blog/${slug}`,
    pap: `/pap/blog/${slug}`,
    es: `/es/blog/${slug}`,
  };

  return {
    title: post.title,
    description: desc,
    alternates: {
      canonical: `/${lang}/blog/${slug}`,
      languages,
    },
    openGraph: {
      title: post.title,
      description: desc,
      url: `/${lang}/blog/${slug}`,
      images: [{ url: post.image }],
    },
  };
}

/* ------------------------ Page zelf ------------------------ */

export default async function BlogPostPage(
  { params }: PageParamsPromise
) {
  const { lang: rawLang, slug } = await params; // ✅ weer eerst await
  const lang = isLocale(rawLang) ? rawLang : "en";

  const post = blogPosts[slug];
  if (!post) return notFound();

  return (
    <div className="min-h-screen bg-slate-50 text-[#2d303b]">
      <main className="mx-auto max-w-5xl px-4 pt-24 pb-12 sm:px-6 lg:px-10">
        <Link
          href={`/${lang}/blog`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#00bfd3] hover:underline"
        >
          ← Back to Blog
        </Link>

        <article>
          <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-slate-200 sm:h-96">
            <ResponsiveImage
              src={post.image}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 1024px"
              className="object-cover"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-500">
            <span>{post.author}</span>
            <span className="mt-1 text-xs text-slate-400">
              {formatDate(post.date)}
            </span>
            <span>{post.readTime}</span>
          </div>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl md:text-5xl">
            {post.title}
          </h1>

          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Deelbalk */}
          <ShareBar title={post.title} />

          {/* Content */}
          <div
            className="prose prose-slate prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
    </div>
  );
}