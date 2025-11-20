"use client";

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      <article className="max-w-3xl mx-auto prose prose-lg">
        <h1 className="text-4xl font-bold mb-6 text-foreground">
          About ABC Islands
        </h1>

        <p className="text-lg text-muted-foreground mb-8">
          Your comprehensive guide to discovering and experiencing Aruba, Bonaire, and Curaçao.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground">Our Mission</h2>
        <p className="text-foreground/90">
          We're dedicated to connecting travelers with the best local businesses, activities, and experiences
          across the ABC Islands. Whether you're planning your first visit or you're a seasoned island hopper,
          we help you discover authentic Caribbean experiences.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground">What We Do</h2>
        <p className="text-foreground/90">
          Our platform brings together shops, restaurants, activities, car rentals, and services from all three
          islands in one easy-to-use directory. We partner with local businesses to help them reach more
          customers while providing travelers with trusted recommendations and insider tips.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground">Why ABC Islands?</h2>
        <p className="text-foreground/90">
          Aruba, Bonaire, and Curaçao each offer unique Caribbean experiences, from world-class diving to pristine
          beaches and vibrant culture. We believe these islands deserve a dedicated platform that showcases
          their individual character while highlighting the best of what they collectively offer.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground">Contact Us</h2>
        <p className="text-foreground/90">
          Have questions or want to learn more?{" "}
          <a href="/contact" className="text-primary hover:underline">
            Get in touch
          </a>{" "}
          with our team.
        </p>
      </article>
    </main>
  );
}