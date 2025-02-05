import type { Metadata } from "next";
import ClientPage from "./page.client";
import { workshopMeta } from "@/lib/workshopMeta";

type Props = {
  params: { id: string }
};

// Fetch workshop data
async function getWorkshop(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/workshop/${id}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Error fetching workshop:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  const meta = workshopMeta[id];
  const workshop = await getWorkshop(id);

  if (!meta && !workshop) {
    return {
      title: "Workshop Not Found",
      description: "The requested workshop could not be found.",
    };
  }

  return {
    title: meta?.title || workshop?.theme || "GeniusLabs Workshop",
    description: meta?.description || "Join our exciting STEM workshops for kids!",
    openGraph: {
      title: meta?.title || workshop?.theme || "GeniusLabs Workshop",
      description: meta?.description || "Join our exciting STEM workshops for kids!",
      url: `https://workshops.geniuslabs.live/${id}`,
      siteName: 'GeniusLabs Workshops',
      images: [
        {
          url: '/images/share-image.jpg',
          width: 1200,
          height: 630,
          alt: meta?.title || workshop?.theme || "GeniusLabs Workshop",
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta?.title || workshop?.theme || "GeniusLabs Workshop",
      description: meta?.description || "Join our exciting STEM workshops for kids!",
      images: ['/images/share-image.jpg'],
    },
  };
}

export default async function Page({ params }: Props) {
  const workshop = await getWorkshop(params.id);
  return <ClientPage initialData={workshop} params={params} />;
} 